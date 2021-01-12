var echartsInfos = [];
var deleteCharts;

function placedByChart(features) {
    var ifEchart = false;
    //对view的坐标改变进行监视，当精度足够大（即城市占据屏幕面积足够大）时，将聚类切换为分析图表
    view.watch("extent", function () {
        if (ifKeywords)
            checkZoom();
    });
    view.watch("rotation", function () {
        if (ifKeywords)
            checkZoom();
    });

    //确认缩放倍数，达到一定倍数执行聚类切换为分析图表，图表切换为聚类的操作
    function checkZoom() {
        if (view.zoom == 8 && ifEchart == false) {
            remakeLayer(provinceFillLayer, pointCityDataLayer, cityDataFillLayer);
            ifEchart = true;
        } else if (view.zoom >= 8)
            relocatePopup();
        else if (view.zoom == 7 && ifEchart == true) {
            remakeLayer();
            ifEchart = false;
        }
    }

    function remakeLayer() {
        if (ifEchart == false) {

            if (provinceFillLayer != null)
                provinceFillLayer.visible = false;

            pointCityDataLayer.visible = false;

            cityDataFillLayer.visible = true;

            echartsMapInit();
        } else if (ifEchart == true) {

            //如果是选中武汉市，则无省级图层，故cityDataFillLayer不需隐藏
            if (provinceFillLayer != null) {
                cityDataFillLayer.visible = false;
                provinceFillLayer.visible = true;
            }

            pointCityDataLayer.visible = true;
            deleteChart();
        }
    }


    //生成echart图表
    function echartsMapInit() {
        //arcgis在对layer进行重新赋值后会对此函数进行回溯，原因不明，为防止多次重复生成图表，故每次初始化图表前进行一次删除
        deleteChart();
        for (var i = 0; i < features.length; i++) {
            echartsInfos.push({
                //地图坐标
                x: features[i].geometry.x,
                y: features[i].geometry.y,
                content: '<div id="info' + i + '" style="height:150px;width:300px;position:absolute;"></div>',
                //div的id唯一标识
                id: "info" + i,
                echartsObj: null,
                option: {
                    tooltip: {
                        formatter: '{b} <br/>{a} : {c}条'
                    },

                    legend: {
                        data: ["相关报导", "不相关报导"]
                    },
                    grid: {
                        left: "3%",
                        right: "4%",
                        bottom: "3%",
                        containLabel: true
                    },
                    xAxis: {
                        type: "category",
                        data: [features[i].attributes.cityName + "报导情况"]
                    },
                    yAxis: {
                        type: "value"
                    },
                    series: [{
                        name: "相关报导",
                        type: "bar",
                        data: [features[i].attributes.related],
                        itemStyle: {
                            color: "#90EE90"
                        }
                    }, {
                        name: "不相关报导",
                        type: "bar",
                        data: [features[i].attributes.irrelated],
                        itemStyle: {
                            color: "#7D26CD"
                        }
                    }]
                },
            });
        }

        for (var i = 0; i < echartsInfos.length; i++) {
            var echartsInfo = echartsInfos[i];
            //坐标转换
            var mapPoint = {
                x: echartsInfo.x,
                y: echartsInfo.y,
                spatialReference: {
                    wkid: 4326
                },
            };
            var screenPoint = view.toScreen(mapPoint);
            var obj = {};

            obj.x = screenPoint.x - 130;
            obj.y = screenPoint.y + 50;
            obj.content = echartsInfo.content;
            obj.id = echartsInfo.id;
            obj.option = echartsInfo.option;
            obj.echartsObj = echartsInfo.echartsObj;
            echartsInfos[i].echartsObj = loadEchartsMap(obj);
            //刷新统计图窗口位置
            //positionEchartsMap(obj);
        }
    }

    function loadEchartsMap(obj) {
        //动态添加气泡窗口DIV
        $("#viewDiv").append(obj.content);
        //统计图加载
        var dom = document.getElementById(obj.id);
        var myChart = echarts.init(dom);
        myChart.setOption(obj.option);
        //刷新统计图窗口位置
        positionEchartsMap(obj);
        return myChart;
    }
    //统计图窗口位置
    function relocatePopup() {
        for (var i = 0; i < echartsInfos.length; i++) {
            var echartsInfo = echartsInfos[i];
            //坐标转换
            var mapPoint = {
                x: echartsInfo.x,
                y: echartsInfo.y,
                spatialReference: {
                    wkid: 4326
                }
            };
            var screenPoint = view.toScreen(mapPoint);
            var obj = {};
            obj.x = screenPoint.x - 130;
            obj.y = screenPoint.y + 50;
            obj.option = echartsInfo.option;
            obj.id = echartsInfo.id;
            obj.echartsObj = echartsInfo.echartsObj;
            //刷新统计图窗口位置
            positionEchartsMap(obj);
        }
    }

    //刷新统计图窗口位置
    function positionEchartsMap(obj) {
        $("#" + obj.id).css(
            "transform",
            "translate(" + obj.x + "px, " + obj.y + "px)"
        );
        //动态改变echarts统计图div大小
        switch (view.zoom) {
            case 9:
            case 10:
                $("#" + obj.id).css("height", "250px");
                $("#" + obj.id).css("width", "300px");
                break;
            case 11:
            case 12:
                $("#" + obj.id).css("height", "300px");
                $("#" + obj.id).css("width", "400px");
                break;
            default:
                $("#" + obj.id).css("height", "200px");
                $("#" + obj.id).css("width", "250px");
        }
        if (obj.echartsObj) obj.echartsObj.resize();
    }

    function deleteChart() {
        for (var i = 0; i < echartsInfos.length; i++) {
            var child = document.getElementById("info" + i);
            child.parentNode.removeChild(child);
        }
        echartsInfos = [];
    }
    deleteCharts = deleteChart;
}