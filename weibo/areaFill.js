var fillCity,cancelFill,dataVisualize;
var cityFillLayer,cityDataFillLayer;
require([
        "esri/layers/FeatureLayer", "esri/Map", "esri/views/MapView"
    ],
    function (
        FeatureLayer, Map, MapView,
    ) {


        function clearFill() {
            if (cityFillLayer != null)
                map.remove(cityFillLayer);
            if (pointCityDataLayer != null)
                map.remove(pointCityDataLayer);
            if (pointOriginLayer != null)
                map.remove(pointOriginLayer);
        }

        function createFillSymbol(value, percent) {
            var color;
            if (percent < 0.1)
                color = "#8B4500";
            else if (percent < 0.3)
                color = '#60526A';
            else if (percent < 0.5)
                color = "#816164";
            else if (percent < 0.6)
                color = "#CD6600";
            else if (percent < 0.8)
                color = "#EE7600";
            else if (percent <= 1)
                color = "#FF7F00";
            return {
                "value": value,
                "symbol": {
                    "color": color,
                    "type": "simple-fill",
                    "style": "solid",
                    "outline": {
                        "color": "black",
                        "width":1
                    }
                },
                "label": value
            };
        }

        function addCityDataFill() {
            var positive = 0,
                negative = 0,
                positivePercent = 0;
            var cityRenderer = [];
            for (var i = 0; i < cityData.length; i++) {
                positive = parseInt(cityData[i].optimisticCount);
                negative = parseInt(cityData[i].passiveCount);
                positivePercent = parseFloat(positive / (positive + negative));
                cityRenderer.push(createFillSymbol(cityData[i].cityName, positivePercent));
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

            //固定缩放
            view.zoom=8;
            map.add(cityDataFillLayer);
            map.add(pointOriginLayer);
            map.add(pointCityDataLayer);
            map.add(pointClusterLayer);
            pointOriginLayer.visible=false;
            pointClusterLayer.visible=false;
        }

        //向功能面板中添加仪表盘，可视化选择的省份/城市数据
        function dataVisualizeByChart(startDate, endDate)
        {
            gaugeChart.clear();
            var chartData = [];
            var dateData = [];
            var positiveData = [];
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

            xmlhttp.open("POST", "http://47.92.202.85:82/WebService1.asmx/getWeiboLineData", false);

            xmlhttp.setRequestHeader(
                "Content-type",
                "application/x-www-form-urlencoded"
            );
            xmlhttp.send("a=" + startDate + "&b=" + endDate );

            if(startDate!=endDate)
            {
            for (var i = 0; i < chartData.length; i++) {
                dateData.push(chartData[i].date);
                positiveData.push(parseFloat((parseInt(chartData[i].positiveCount) / parseInt(chartData[i].totalCount))).toFixed(2) * 100)
            }

            
            var optionLineKey = {
                tooltip: {
                    trigger: 'axis',
                    formatter: '{b0}<br/>{a0}: {c0}%<br/>'
                },
                legend: {
                    orient: 'horizontal',
                    data: ['微博内容积极']
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
                    name: '微博内容积极',
                    type: 'line',
                    data: positiveData
                }]
            }
            gaugeChart.setOption(optionLineKey);
            }
        else
        {

               
            var option2 = {
                tooltip: {
                    formatter: '{b} <br/>{a} : {c}条，占比{d}%'
                },
                
                series: [{ 
                    name: '武汉市微博情感倾向',
                    type: 'pie',
    
                    roseType:'radius',
                    detail: {
                        formatter: '{value}%'
                    },
                    data: [{value: parseInt(chartData[0].positiveCount),
                        name: '内容积极'
                    },{
                        value: parseInt(chartData[0].totalCount)-parseInt(chartData[0].positiveCount),
                        name: '内容消极'
                    }],
                    label: {
                        position: 'inside',
                    },
                }
                
            ]
            };
            gaugeChart.setOption(option2);
        }
    }
        
        dataVisualize=dataVisualizeByChart;

        fillCity = addCityDataFill;
        cancelFill = clearFill;
    });