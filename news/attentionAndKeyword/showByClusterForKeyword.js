var createClustering;
var pointClusterLayer;
var pointOriginLayer; //每条新闻原始数据图层
var pointCityDataLayer; //市级数据图层
var cityData; //市级数据

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
            //市级图层 场
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
                    name: "related",
                    alias: "relatedNews",
                    type: "integer"
                }),
                new Field({
                    name: "irrelated",
                    alias: "irrelatedNews",
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
                        related: parseInt(cityData[i].relatedCount),
                        irrelated: parseInt(cityData[i].irrelatedCount)
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
                    title: "{cityName}报道状况",

                    // Set content elements in the order to display.
                    // The first element displayed here is the fieldInfos.
                    content: [{
                            type: "fields", // FieldsContentElement
                            fieldInfos: [{
                                    fieldName: "related",
                                    visible: true,
                                    label: "相关报导",
                                    format: {
                                        places: 0,
                                        digitSeparator: true
                                    }
                                },
                                {
                                    fieldName: "irrelated",
                                    visible: true,
                                    label: "不相关报导",
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
                                    fields: ["related", "irrelated"],
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

        function createDataPoint(keyWord, cityName, startDate, endDate) {

            view.popup.close();

            function getCityData(keyWord, cityName, startDate, endDate) {
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

                xmlhttp.open("GET", "http://47.92.202.85:82/WebService1.asmx/getCityKeywordData?a=" + keyWord + "&b=" + cityName + "&c=" + startDate + "&d=" + endDate, false);

                xmlhttp.send();

            }

            //getPoint(keyWord,cityName, startDate, endDate);
            getCityData(keyWord, cityName, startDate, endDate);

            cityLayerMake();
        }

        createClustering = createDataPoint;
    })