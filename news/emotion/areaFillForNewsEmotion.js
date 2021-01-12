var fillCity, fillProvince, cancelFill;
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
        }

        //添加省市着色图层
        function addCityFill(value) {
            provinceFillLayer = null;
            addCityDataFill();
            addCityDataFill();

            //删除上个图层遗留的图表
            deleteCharts();

            view.zoom = 7;
            map.add(cityDataFillLayer);
            map.add(pointCityDataLayer);
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
                        "width": 1
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
        }

        function addProvinceFill(value) {

            var positive = 0,
                negative = 0;
            for (var i = 0; i < cityData.length; i++) {
                positive += parseInt(cityData[i].optimisticCount);
                negative += parseInt(cityData[i].passiveCount);
            }

            var positivePercent = parseFloat(positive / (positive + negative));
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
            dataViusalize(positivePercent);

        }

        //向功能面板中添加仪表盘，可视化选择的省份/城市数据
        function dataViusalize(value) {
            var color;
            if (value < 0.1)
                color = '#3b4371';
            else if (value < 0.3)
                color = "#60526A";
            else if (value < 0.5)
                color = "#816164";
            else if (value < 0.6)
                color = "#CD6600";
            else if (value < 0.8)
                color = "#EE7600";
            else if (value <= 1)
                color = "#FF7F00";


            var option2 = {
                tooltip: {
                    formatter: '{a} <br/>{b} : {c}%'
                },
                series: [{
                    startAngle: 180,
                    endAngle: 0,


                    radius: '90%',
                    name: '情感分析',
                    type: 'gauge',

                    detail: {
                        formatter: '{value}%'
                    },
                    data: [{
                        value: value * 100,
                        name: '正向情感占比'
                    }],
                    axisLine: {
                        lineStyle: {
                            color: [
                                [1, color]
                            ],
                            shadowColor: 'rgba(0,0,0,0.5)',
                            shadowBlur: 10,
                        }
                    }
                }]
            };
            gaugeChart.setOption(option2);
        }

        fillCity = addCityFill;
        fillProvince = addProvinceFill;
        cancelFill = clearFill;
    });