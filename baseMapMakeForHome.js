//基础地图和view等的构建
var cityFill;
var pointDataFill;

var cityFeatures;
var cityLayer;
var provinceLayer;
var map;
var view;

require(["esri/Map", "esri/views/MapView",
        "esri/layers/FeatureLayer", "esri/widgets/Legend",
        "esri/widgets/Expand"
    ],
    function (
        Map, MapView, FeatureLayer, Legend, Expand
    ) {
        provinceLayer = new FeatureLayer({
            url: "https://services5.arcgis.com/s0bdWPf8HMc4m0IJ/ArcGIS/rest/services/chinamap/FeatureServer/3",
            renderer: {
                type: "simple",
                symbol: {
                    color: "white",
                    type: "simple-fill"
                }
            },
            opacity: 1
        })
        

        map = new Map({
            basemap: "gray-vector"
        });

        map.add(provinceLayer);
       
        view = new MapView({
            container: "viewDiv",
            map: map,
            center: [114.80543, 36.02700],
            zoom: 3,

        });

        const infoDiv = document.getElementById("infoDiv");
        view.ui.add(
            new Expand({
                view: view,
                content: infoDiv,
                expandIconClass: "esri-icon-layer-list",
                expanded: true
            }),
            "bottom-right"
        );

        view.ui.empty("top-left");
        title=document.getElementById("titleDiv");
        view.ui.add(titleDiv, "top-left");
        cityLayer.when(function () {
                var query = cityLayer.createQuery();
                return cityLayer.queryFeatures(query);
            })
            .then(getValues);

        function getValues(response) {
            cityFeatures = response.features;
        }
    })