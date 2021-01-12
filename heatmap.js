var createHeatmap;

var pointOriginLayer;

//创建热力图
require(["esri/Graphic", "esri/Map", "esri/views/MapView",
        "esri/layers/FeatureLayer",
        "esri/layers/support/Field",
        "dojo/dom-construct"
    ],
    function (
        Graphic, Map, MapView, FeatureLayer, Field
    ) {

        function createDataPoint(date) {

            view.popup.close();
            if (pointOriginLayer != null)
                map.remove(pointOriginLayer);

            var pointFields = [
                new Field({
                    name: "ObjectID",
                    alias: "ObjectID",
                    type: "oid"
                })
            ];

            var features = [];
            var feature;


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

            xmlhttp.open("GET", "http://47.92.202.85:82/WebService1.asmx/getHeatmapData?a=" + date , false);

            xmlhttp.send();

            for (var i = 0; i < feature.length; i++) {
                features.push({
                    geometry: {
                        type: "point",
                        x: feature[i].x,
                        y: feature[i].y
                    },
                    attributes: {
                        ObjectID: i+1,
                    }
                });
            }
            pointOriginLayer = new FeatureLayer({
                fields: pointFields,
                objectIdField: "ObjectID",
                outFields: ["*"],
                source: features,
                renderer:{type: "heatmap",
                colorStops: [
                  { ratio: 0, color: "rgba(255, 255, 255, 0)" },
                  { ratio: 0.2, color: "rgba(255, 195, 193, 1)" },
                  { ratio: 0.5, color: "rgba(255, 140, 0, 1)" },
                  { ratio: 0.75, color: "rgba(255, 69, 0, 1)" },
                  { ratio: 1, color: "rgba(255, 0, 0, 1)" }
                ],
                minPixelIntensity: 0,
                maxPixelIntensity: 50}
            });
            map.add(pointOriginLayer);

            title=document.getElementById("titleDiv");
            title.innerText="中国各地级市疫情期间被报道情况图-"+date
        }

        createHeatmap = createDataPoint;
    })