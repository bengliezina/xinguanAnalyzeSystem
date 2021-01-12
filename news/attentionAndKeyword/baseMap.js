var addLines; //创建图层的函数，vue里面调用
var results = new Array();
var lineLayer,redPointLayer,purplePointLayer;
require([
    "esri/Map",
    "esri/request",
    "esri/geometry/support/webMercatorUtils",
    "esri/views/MapView"
], function (
    Map,
    esriRequest,
    webMercatorUtils,
    MapView
) {


    // //根据两点获取中间点的经纬度
    // function getMidPoint(lon1, lat1, lon2, lat2, pathLL, maxLon, minLon, maxLat, minLat) {
    //     if (Math.abs(lon1 - lon2) > 0.01 || Math.abs(lat1 - lat2) > 0.01) {
    //         var midPoint = new Array(2);
    //         var mlon = (lon1 + lon2) / 2;
    //         var mlat = (lat1 + lat2) / 2;
    //         if (mlon < maxLon && mlon > minLon && mlat < maxLat && mlat > minLat) {
    //             getMidPoint(lon1, lat1, mlon, mlat, pathLL, maxLon, minLon, maxLat, minLat);
    //             midPoint[0] = mlon; midPoint[1] = mlat;
    //             pathLL.push(midPoint);
    //             getMidPoint(mlon, mlat, lon2, lat2, pathLL, maxLon, minLon, maxLat, minLat);
    //         }
    //     }
    // }


    //构造函数，创建线状图形，参数分颜色，经纬度
    //该线其它省到武汉
    function MgraphicLine(color, lon, lat) {
        this.attributes = {
            color: color
        };
        this.geometry = webMercatorUtils.geographicToWebMercator({
            paths: [
                [
                    [lon, lat],
                    [114.305392, 30.593098]
                ]
            ],
            type: "polyline",
            spatialReference: {
                wkid: 4326
            }
        })
    };


    //构造函数，创建紫色点图形，参数分别为省份名称，经度，纬度，关注度值
    function MgraphicPPoint(pro, lon, lat, attention, numaboutwhan, totalNum) {
        this.attributes = {
            name: pro,
            attention: attention,
            unattention: 1 - attention,
            related: numaboutwhan,
            irrelated: totalNum - numaboutwhan,
            total: totalNum
        };
        this.popupTemplate = {
            title: "{name}共报道发生武汉市的新闻{related}条，关注度为{attention}",
            content: [{
                    // type: "media",
                    // mediaInfos: [
                    //     {
                    //         type: "column-chart",
                    //         value: {
                    //             fields: ["related", "irrelated"]
                    //         }
                    //     }
                    // ]
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
                        //title: "被报导情况",
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
        };
        this.geometry = webMercatorUtils.geographicToWebMercator({
            x: lon,
            y: lat,
            type: "point",
            spatialReference: {
                wkid: 4326
            }
        })
    };

    //构造函数，创建红色点图形，参数分别为省份名称，经度，纬度
    function MgraphicWuhan(pro, lon, lat) {
        this.attributes = {
            Name: pro
        };
        this.geometry = webMercatorUtils.geographicToWebMercator({
            x: lon,
            y: lat,
            type: "point",
            spatialReference: {
                wkid: 4326
            }
        })
    };

    //创建图层的函数，赋值给addLines，在vue中调用，参数分别为查询结果，及结果条数
    function addl(startDate, endDate) {
        cancelFill();
        view.popup.close();
        if (timeSlider != null) {
            view.ui.remove(timeSlider);
            timeSlider = null;
            $("body").append("<div id='timeSliderDiv'></div>");
        }
        view.center=[114.80543, 36.02700];
        view.zoom=3;
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
                var data = xmlhttp.responseText;
                data = eval("(" + data + ")");
                for (var i = 0; i < data.length; i++) {
                    results[i] = [data[i].x, data[i].y, data[i].relatedIndex, data[i].provinceName, data[i].relatedCount, data[i].totalCount];
                }
            }
        }

        xmlhttp.open("GET", "http://47.92.202.85:82/WebService1.asmx/getAttentionData?a=" + startDate + "&b=" + endDate, false);

        xmlhttp.send();


        fillProvince("");
        var graphicLines = new Array(); //记录所有的线
        var graphicPoints = new Array(); //记录所有紫色的点

        //此循环，根据查询结果创建线状图形和点状图形
        for (var ir = 0; ir < results.length; ir++) {
            var color;
            //根据计算结果设置线状图形的颜色，关注度值越大，颜色越深
            if (results[ir][2] >= 0.216) {
                color = [44, 54, 94];
            } else if (results[ir][2] >= 0.180) {
                color = [80, 98, 170];
            }  else {
                color = [165, 174, 213];
            }

            // //最大经纬度及最小经纬度
            // var maxLon; var minLon; var maxLat; var minLat;
            // var path = new Array();//表示路径
            // var point = new Array(2);//表示坐标点
            // point[0] = res[ir][0]; point[1] = res[ir][1];
            // path.push(point);//把其它省份作为起点

            // //确定最大经纬度及最小经纬度
            // if (res[ir][0] > 114.305392) {
            //     maxLon = res[ir][0]; minLon = 114.305392;
            // }
            // else {
            //     maxLon = 114.305392; minLon = res[ir][0];
            // }
            // if (res[ir][1] > 30.593098) {
            //     maxLat = res[ir][1]; minLat = 30.593098;
            // }
            // else {
            //     maxLat = 30.593098; minLat = res[ir][1];
            // }
            // var pointwh = new Array(2);//表示武汉的坐标点
            // pointwh[0] = 114.305392; pointwh[1] = 30.593098;
            // getMidPoint(res[ir][0], res[ir][1], pointwh[0], pointwh[1], path, maxLon, minLon, maxLat, minLat);
            // path.push(pointwh);//把武汉作为终点

            //创建一条线并添加到graphicLines中用于创建图层
            var polylineGraphic = new MgraphicLine(color, results[ir][0], results[ir][1]);
            graphicLines.push(polylineGraphic);
            //创建一个点并添加到graphicPoint中用于创建图层
            var pointGraphic = new MgraphicPPoint(results[ir][3], results[ir][0], results[ir][1], results[ir][2], results[ir][4], results[ir][5]);
            graphicPoints.push(pointGraphic);
        }


        //创建紫色点图层
        purplePointLayer = new CustomLayerPurplePoint({
            graphics: graphicPoints

        });
        map.add(purplePointLayer);


        //创建红色点图层
        var wuhan = new MgraphicWuhan('武汉', 114.305392, 30.593098);
        redPointLayer = new CustomLayerRedPoint({
            popupTemplate: {
                title: "武汉市"
            },
            graphics: wuhan
        });
        map.add(redPointLayer);


        //创建线图层
        lineLayer = new CustomLayer({
            popupTemplate: {
                title: "{name}对武汉市的关注度为{attention}"
            },
            graphics: graphicLines
        });
        
        map.add(lineLayer);
    }

    addLines = addl;
});