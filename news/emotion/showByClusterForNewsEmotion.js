var createClustering;
var pointClusterLayer;
var pointOriginLayer;
var pointCityDataLayer;
var cityData;

//创建聚类部分
require(["esri/Graphic", "esri/Map", "esri/views/MapView",
        "esri/layers/FeatureLayer",
        "esri/layers/support/Field",
        "dojo/dom-construct", "dojo/domReady!", "dojo/_base/window",
    ],
    function (
        Graphic, Map, MapView, FeatureLayer, Field, domConstruct, win
    ) {
        function cityLayerMake() {
            var cityFields = [
                new Field({
                    name: "ObjectID",
                    alias: "ObjectID",
                    type: "oid"
                }),
                new Field({
                    name: "cityName",
                    alias: "cityName",
                    type: "string"
                }),
                new Field({
                    name: "positive",
                    alias: "positiveEmotion",
                    type: "integer"
                }),
                new Field({
                    name: "negative",
                    alias: "negativeEmotion",
                    type: "integer"
                })
            ];

            var features = [];

            function findPointXY(value) {
                for (var i = 0; i < value.length; i++) {
                    for (var j = 0; j < cityFeatures.length; j++) {
                        if (cityFeatures[j].attributes.NAME == value[i].attributes.cityName) {
                            value[i].geometry.x = cityFeatures[j].attributes.X;
                            value[i].geometry.y = cityFeatures[j].attributes.Y;
                            view.center = [cityFeatures[j].attributes.X, cityFeatures[j].attributes.Y];
                        }
                    }
                }
            }

            for (var i = 0; i < cityData.length; i++) {
                features.push({
                    geometry: {
                        type: "point",
                        x: null,
                        y: null
                    },
                    attributes: {
                        ObjectID: i + 1,
                        cityName: cityData[i].cityName,
                        positive: parseInt(cityData[i].optimisticCount),
                        negative: parseInt(cityData[i].passiveCount)
                    }
                });
            }
            findPointXY(features);

            pointCityDataLayer = new FeatureLayer({
                fields: cityFields,
                objectIdField: "ObjectID",
                outFields: ["*"],
                source: features,
                renderer: {
                    type: "simple",
                    symbol: {
                        type: "picture-marker", // autocasts as new PictureMarkerSymbol()
                        url: "https://bengliezina.maps.arcgis.com/sharing/rest/content/items/fba1f634842b4380b28083faa98fcef5/data",
                        width: "32px",
                        height: "32px"
                    }
                },
                popupTemplate: {
                    title: "{cityName}被报道状况",

                    // Set content elements in the order to display.
                    // The first element displayed here is the fieldInfos.
                    content: [{
                            type: "fields", // FieldsContentElement
                            fieldInfos: [{
                                    fieldName: "positive",
                                    visible: true,
                                    label: "正面报导",
                                    format: {
                                        places: 0,
                                        digitSeparator: true
                                    }
                                },
                                {
                                    fieldName: "negative",
                                    visible: true,
                                    label: "负面报导",
                                    format: {
                                        places: 0,
                                        digitSeparator: true
                                    }
                                }
                            ]
                        },
                        {
                            type: "media", // MediaContentElement
                            mediaInfos: {
                                title: "<b>被报导情况</b>",
                                type: "pie-chart",
                                caption: "",
                                value: {
                                    fields: ["positive", "negative"],
                                    normalizeField: null,
                                }
                            }

                        },
                        {
                            type: "attachments" // AttachmentsContentElement
                        }
                    ]
                },


            })

            placedByChart(features);
        }

        function createDataPoint(value, startDate, endDate) {

            view.popup.close();
            var provinceFields = [
                new Field({
                    name: "ObjectID",
                    alias: "ObjectID",
                    type: "oid"
                }),
                new Field({
                    name: "provinceName",
                    alias: "provinceName",
                    type: "string"
                }),
                new Field({
                    name: "positive",
                    alias: "positiveEmotion",
                    type: "integer"
                }),
                new Field({
                    name: "negative",
                    alias: "negativeEmotion",
                    type: "integer"
                })
            ];

            var pointFields = [
                new Field({
                    name: "ObjectID",
                    alias: "ObjectID",
                    type: "oid"
                }),
                new Field({
                    name: "cityName",
                    alias: "cityName",
                    type: "string"
                }),
                new Field({
                    name: "emotion",
                    alias: "emotion",
                    type: "string"
                })
            ];

            var features = [];
            var feature;

            function getCityData(value, startDate, endDate) {
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
                        cityData = eval("(" + x + ")");
                    }
                }

                xmlhttp.open("GET", "http://47.92.202.85:82/WebService1.asmx/getCityData?a=" + value + "&b=" + startDate + "&c=" + endDate, false);

                xmlhttp.send();
                
            }

            function getPoint(value, startDate, endDate) {
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
                        feature = eval("(" + x + ")");
                    }
                }

                xmlhttp.open("GET", "http://47.92.202.85:82/WebService1.asmx/getCluster?a=" + value + "&b=" + startDate + "&c=" + endDate, false);

                xmlhttp.send();
            }

            //查询城市地点并赋值经纬度
            function findPointXY(value) {
                for (var i = 0; i < value.length; i++) {
                    for (var j = 0; j < cityFeatures.length; j++) {
                        if (cityFeatures[j].attributes.NAME == value[i].attributes.cityName) {
                            value[i].geometry.x = cityFeatures[j].attributes.X;
                            value[i].geometry.y = cityFeatures[j].attributes.Y;
                            view.center = [cityFeatures[j].attributes.X, cityFeatures[j].attributes.Y];
                        }
                    }
                }
            }

            getPoint(value, startDate, endDate);
            getCityData(value, startDate, endDate);

            for (var i = 0; i < feature.length; i++) {
                features.push({
                    geometry: {
                        type: "point",
                        x: feature[i].x,
                        y: feature[i].y
                    },
                    attributes: {
                        ObjectID: feature[i].ObjectID,
                        cityName: feature[i].cityName,
                        emotion: feature[i].emotion
                    }
                });
            }
            pointOriginLayer = new FeatureLayer({
                fields: pointFields,
                objectIdField: "ObjectID",
                outFields: ["*"],
                source: features,
                renderer: {
                    type: "unique-value", // autocasts as new SimpleRenderer()
                    field: "emotion",
                    defaultSymbol: {
                        type: "simple-marker"
                    },
                    uniqueValueInfos: [{
                        // All features with value of "North" will be blue
                        value: "1",
                        symbol: {
                            type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
                            size: 6,
                            color: "red",
                            outline: { // autocasts as new SimpleLineSymbol()
                                width: 0.5,
                                color: "black"
                            }
                        }
                    }, {
                        // All features with value of "North" will be blue
                        value: "0",
                        symbol: {
                            type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
                            size: 6,
                            color: "blue",
                            outline: { // autocasts as new SimpleLineSymbol()
                                width: 0.5,
                                color: "black"
                            }
                        }
                    }]
                }
            });

            

            /*findPointXY(features);

            */

            cityLayerMake();
        }

        createClustering = createDataPoint;
    })