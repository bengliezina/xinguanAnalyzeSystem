//修改日期格式
Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}

var setDates;
var setSingleDate;
var timeSlider;

require([
    "esri/views/MapView", "esri/widgets/TimeSlider"
], function (MapView, TimeSlider) {


    function singleDate(keyword, area, startDate, endDate) {
        if (timeSlider != null) {
            view.ui.remove(timeSlider);
            timeSlider = null;
        }
        cancelFill();
        createClustering(keyword, area, startDate, endDate);
        if (area != "武汉市")
            fillProvince(area);
        else
            fillCity(area);
        dataVisualize(keyword, area, startDate, endDate);
        getNews(keyword, area, startDate, endDate);
    }


    function setDate(keyword, area, startDate, endDate) {

        if (timeSlider != null) {
            view.ui.remove(timeSlider);
            timeSlider = null;
            $("body").append("<div id='timeSliderDiv'></div>");
        }
        timeSlider = new TimeSlider({
            container: "timeSliderDiv",
            view: view,
            mode: "time-window",
            fullTimeExtent: {
                start: new Date(startDate),
                end: new Date(endDate)
            },
            values: [
                new Date(startDate),
                new Date(endDate),
            ],
            loop: false,
            playRate: 5000,
            stops: {
                interval: {
                    value: 1,
                    unit: "days"
                }
            }
        });
        view.ui.add(timeSlider, "manual");

        timeSlider.watch("timeExtent", function (timeExtent) {

            var startDate = new Date(timeExtent.start).format("yyyy-MM-dd");
            var endDate = new Date(timeExtent.end).format("yyyy-MM-dd");

            cancelFill();
            createClustering(keyword, area, startDate, endDate);
            if (area != "武汉市")
                fillProvince(area);
            else
                fillCity(area);
            dataVisualize(keyword, area, startDate, endDate);
            getNews(keyword, area, startDate, endDate);
        });
    }

    setSingleDate = singleDate;
    setDates = setDate;
})