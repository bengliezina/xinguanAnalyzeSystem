var fillCity, fillProvince, cancelFill, dataVisualize;
var cityFillLayer, provinceFillLayer, cityDataFillLayer;
require([
        "esri/layers/FeatureLayer", "esri/Map", "esri/views/MapView"
    ],
    function (
        FeatureLayer, Map, MapView,
    ) {


        function clearFill() {
            if (cityFillLayer != null)
                map.remove(cityFillLayer);
            if (provinceFillLayer != null)
                map.remove(provinceFillLayer);
            if (pointCityDataLayer != null)
                map.remove(pointCityDataLayer);
            if (pointOriginLayer != null)
                map.remove(pointOriginLayer);
            if (lineLayer != null)
                map.remove(lineLayer);
            if (redPointLayer != null)
                map.remove(redPointLayer);
            if (purplePointLayer != null)
                map.remove(purplePointLayer);
            cityFillLayer = provinceFillLayer = pointCityDataLayer = pointOriginLayer = lineLayer = redPointLayer = purplePointLayer = null;
        }

        //添加省市着色图层
        function addCityFill() {
            provinceFillLayer = null;
            addCityDataFill();

            //删除上个图层遗留的图表
            deleteCharts();

            map.add(cityDataFillLayer);
            map.add(pointCityDataLayer);
        }

        function createFillSymbolForAttention(value, percent) {
            var color;
            if (percent < 0.1)
                color = "#38a800";
            else if (percent < 0.2)
                color = "#79c900";
            else if (percent < 0.3)
                color = "#ceed00";
            else if (percent < 0.4)
                color = "#ffcc00";
            else if (percent < 0.5)
                color = "#ff6600";
            else if (percent <= 1)
                color = "#ff0000";
            return {
                "value": value,
                "symbol": {
                    "color": color,
                    "type": "simple-fill",
                    "style": "solid",
                    "outline": {
                        "color": "black",
                        "width": 1
                    }
                },
                "label": value
            };
        }

        function createFillSymbol(value, percent) {
            var color;
            if (percent < 0.2)
                color = "#F9D324";
            else if (percent < 0.4)
                color = "#FBB12F";
            else if (percent < 0.6)
                color = "#FC913A";
            else if (percent < 0.8)
                color = "#FE7045";
            else if (percent <= 1)
                color = "#FF504F";
            return {
                "value": value,
                "symbol": {
                    "color": color,
                    "type": "simple-fill",
                    "style": "solid",
                    "outline": {
                        "color": "black",
                        "width": 1
                    }
                },
                "label": value
            };
        }

        function addCityDataFill() {
            var relatedCount = 0,
                irrelatedCount = 0,
                relatedPercent = 0;
            var cityRenderer = [];
            for (var i = 0; i < cityData.length; i++) {
                relatedCount = parseInt(cityData[i].relatedCount);
                irrelatedCount = parseInt(cityData[i].irrelatedCount);
                relatedPercent = parseFloat(relatedCount / (relatedCount + irrelatedCount));
                cityRenderer.push(createFillSymbol(cityData[i].cityName, relatedPercent));
            }

            var openSpacesRenderer = {
                type: "unique-value",
                field: "NAME",
                uniqueValueInfos: cityRenderer
            };

            cityDataFillLayer = new FeatureLayer({
                url: "https://services5.arcgis.com/s0bdWPf8HMc4m0IJ/arcgis/rest/services/chinacityarea/FeatureServer/0",
                //url: "https://services5.arcgis.com/s0bdWPf8HMc4m0IJ/ArcGIS/rest/services/chinamap/FeatureServer/3",
                renderer: openSpacesRenderer,
                opacity: 1
            });
        }

        function addProvinceFill(value) {

            if (ifKeywords) {
                var relatedCount = 0,
                    irrelatedCount = 0;
                for (var i = 0; i < cityData.length; i++) {
                    relatedCount += parseInt(cityData[i].relatedCount);
                    irrelatedCount += parseInt(cityData[i].irrelatedCount);
                }

                var positivePercent = parseFloat(relatedCount / (relatedCount + irrelatedCount));
                positivePercent = positivePercent.toFixed(2);
                //map.add(newMap);
                // Add parks with a class breaks renderer and unique symbols


                var openSpacesRenderer = {
                    type: "unique-value",
                    field: "NAME",
                    uniqueValueInfos: [
                        createFillSymbol(value, positivePercent)
                    ]
                };

                // Create the layer and set the renderer
                provinceFillLayer = new FeatureLayer({
                    //url: "https://services5.arcgis.com/s0bdWPf8HMc4m0IJ/arcgis/rest/services/chinacityarea/FeatureServer/0",
                    url: "https://services5.arcgis.com/s0bdWPf8HMc4m0IJ/ArcGIS/rest/services/chinamap/FeatureServer/3",
                    renderer: openSpacesRenderer,
                    opacity: 1
                });

                addCityDataFill();

                //删除上个图层遗留的图表
                deleteCharts();

                //固定缩放
                if (value == "北京" || value == "上海" || value == "天津" || value == "重庆")
                    view.zoom = 7;
                else
                    view.zoom = 6;

                map.remove(cityLayer);
                // Add the layer
                map.add(provinceFillLayer);
                map.add(cityLayer);
                map.add(pointCityDataLayer);
                map.add(cityDataFillLayer);
                cityDataFillLayer.visible = false;
                cityLayer.visible=true;
            } else {
                //删除上个图层遗留的图表
                deleteCharts();
                var infos = [];
                for (var i = 0; i < results.length; i++) {
                    infos.push(createFillSymbolForAttention(results[i][3], results[i][2]));
                }
                var openSpacesRenderer = {
                    type: "unique-value",
                    field: "NAME",
                    uniqueValueInfos: infos
                };

                // Create the layer and set the renderer
                provinceFillLayer = new FeatureLayer({
                    //url: "https://services5.arcgis.com/s0bdWPf8HMc4m0IJ/arcgis/rest/services/chinacityarea/FeatureServer/0",
                    url: "https://services5.arcgis.com/s0bdWPf8HMc4m0IJ/ArcGIS/rest/services/chinamap/FeatureServer/3",
                    renderer: openSpacesRenderer,
                    opacity: 1
                });
                map.remove(cityLayer);
                // Add the layer
                map.add(provinceFillLayer);
                map.add(cityLayer);
                cityLayer.visible=false;
            }
        }


        function dataVisualizeByChart(keyWord, areaName, startDate, endDate) {
            gaugeChart.clear();
            var chartData = [];
            var dateData = [];
            var relData = [];
            var xmlhttp;

            if (window.XMLHttpRequest) {
                // IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
                xmlhttp = new XMLHttpRequest();
            } else {
                // IE6, IE5 浏览器执行代码
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            }
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    var x = xmlhttp.responseText;
                    chartData = eval("(" + x + ")");
                }
            }

            xmlhttp.open("GET", "http://47.92.202.85:82/WebService1.asmx/getLineData?a=" + keyWord + "&b=" + areaName +
                "&c=" + startDate + "&d=" + endDate, false);

            xmlhttp.send();

            if (startDate != endDate) {
                for (var i = 0; i < chartData.length; i++) {
                    dateData.push(chartData[i].date);
                    relData.push(parseFloat((parseInt(chartData[i].relatedCount) / parseInt(chartData[i].totalCount)))
                        .toFixed(2) * 100)
                }


                var optionLineKey = {
                    tooltip: {
                        trigger: 'axis',
                        formatter: '{b0}<br/>{a0}: {c0}%<br/>'
                    },
                    legend: {
                        orient: 'horizontal',
                        data: ['关键词相关']
                    },
                    grid: {
                        left: '2%',
                        right: '7%',
                        bottom: '10%',
                        top: '20%',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: dateData
                    },
                    yAxis: {
                        type: 'value',
                        axisLabel: {
                            show: true,
                            interval: 'auto',
                            formatter: '{value}%'
                        },
                        show: true
                    },
                    series: [{
                        name: '关键词相关',
                        type: 'line',
                        data: relData
                    }]
                }
                gaugeChart.setOption(optionLineKey);
            } else {


                var option2 = {
                    tooltip: {
                        formatter: '{b} <br/>{a} : {c}条，占比{d}%'
                    },
                    series: [{
                        name: areaName + '报导情况',
                        type: 'pie',

                        roseType: 'radius',
                        detail: {
                            formatter: '{value}%'
                        },
                        data: [{
                            value: parseInt(chartData[0].relatedCount),
                            name: '相关报导'
                        }, {
                            value: parseInt(chartData[0].totalCount) - parseInt(chartData[0].relatedCount),
                            name: '不相关报导'
                        }]

                    }]
                };
                gaugeChart.setOption(option2);
            }
        }
        fillCity = addCityFill;
        fillProvince = addProvinceFill;
        cancelFill = clearFill;
        dataVisualize = dataVisualizeByChart;
    });