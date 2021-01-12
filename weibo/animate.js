function animate(obj, target, callback) {
    //先清除之前的定时器，只保留当前定时器操作
    clearInterval(obj.timer);
    obj.timer = setInterval(function () {
        //移动步长值限定整数
        var step = (target - obj.offsetLeft) / 10;
        step = step > 0 ? Math.ceil(step) : Math.floor(step);  //上取整|下取整
        if (obj.offsetLeft == target) {
            //停止移动，本质是停止计时器
            clearInterval(obj.timer);
            //回调函数
            // if (callback) callback();
            callback && callback();
        }
        //步长公式：（目标值-现在位置）/10，实现缓动效果（越来越慢）
        obj.style.left = obj.offsetLeft + step + 'px';
    }, 15)
}