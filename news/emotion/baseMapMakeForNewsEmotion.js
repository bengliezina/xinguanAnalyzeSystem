//基础地图和view等的构建
var cityFill;
var pointDataFill;

var cityFeatures;
var cityLayer;
var provinceLayer;
var map;
var view;

require(["esri/Map", "esri/views/MapView",
        "esri/layers/FeatureLayer","esri/widgets/Legend",
        "esri/widgets/Expand"
    ],
    function (
        Map, MapView, FeatureLayer,Legend, Expand
    ) {
        provinceLayer=new FeatureLayer({
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
        cityLayer = new FeatureLayer({
            url: "https://services5.arcgis.com/s0bdWPf8HMc4m0IJ/arcgis/rest/services/chinacityarea/FeatureServer/0",
            renderer: {
                type: "simple",
                symbol: {
                    color: "transparent",
                    type: "simple-fill"
                }
            },
            opacity: 1
        });

        map = new Map({
            basemap: "gray-vector"
        });

        map.add(provinceLayer);
        map.add(cityLayer);


        view = new MapView({
            container: "viewDiv",
            map: map,
            center: [114.80543, 34.02700],
            zoom: 7,
            popup: {
                dockEnabled: true,
                dockOptions: {
                    buttonEnabled: false,
                    breakpoint: false,
                    position: "top-left"
                }
            },
        });

        view.ui.empty("top-left");

        const infoDiv = document.getElementById("infoDiv");
        view.ui.add(
            new Expand({
                view: view,
                content: infoDiv,
                expandIconClass: "esri-icon-layer-list",
                expanded: true
            }),
            "bottom-left"
        );
        cityLayer.when(function () {
                var query = cityLayer.createQuery();
                return cityLayer.queryFeatures(query);
            })
            .then(getValues);

        function getValues(response) {
            cityFeatures = response.features;
            setSingleDate("2020-01-20", "2020-01-20", "北京","北京");
        }
    })