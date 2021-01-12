var maxIndex;
var news ;
var currentIndex = 0;

var pgUpBtn = document.getElementById('SHANG');    //上一页按钮
var pgDownBtn = document.getElementById('XIA');    //下一页按钮

function getNews(keyword,cityName,startDate,endDate)
{
   var newsDiv = document.getElementById("newsDiv");
   newsDiv.style.display = 'none';
   news=new Array();
   var xmlhttp;
   var data=[];
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
           data = eval("(" + x + ")");
       }
   }

   xmlhttp.open("GET", "http://47.92.202.85:82/WebService1.asmx/getKeywordData?a=" + keyword + "&b=" + cityName + "&c=" + startDate+ "&d=" + endDate, false);

   xmlhttp.send();

   for(var i=0;i<data.length;i++)
   {
      news[i]=[data[i].newsLink,data[i].newsTitle];
   }
}

function inquire() {
   pgUpBtn.style.color = 'rgba(71, 73, 72, 0.575)';  //无法上一页翻动，字体颜色变浅
   pgDownBtn.style.color = '#000000';

   currentIndex = 0;
   var newsDiv = document.getElementById("newsDiv");
   newsDiv.style.display = 'block';
   /*根据查询解雇生成新闻列表，默认显示前10条*/
   var newTitle = document.getElementById("newsContainer");
   var allT = newTitle.children;
   var num = allT.length;
   if (num != 0) {
      for (var i_c = 0; i_c < num; i_c++) {
         newTitle.removeChild(allT[0]);
      }
   }
   var myp = document.createElement("p");
   myp.innerHTML = "共查询到相关新闻" + news.length + "条，结果如下：";
   newTitle.appendChild(myp);
   var total = news.length / 10;
   var i;
   for (i = 0; i < total; i++) {
      var mydiv = document.createElement("div");
      mydiv.id = "mydiv" + i;
      if (i != 0) {
         mydiv.style.display = 'none';
      }
      else {
         mydiv.style.display = 'block';
      }
      newTitle.appendChild(mydiv);
      for (var j = 0; j < 10; j++) {
         if (i * 10 + j >= news.length) {
            break;
         }
         else {
            var ht = document.createElement("a");
            var em = document.createElement("em");
            ht.appendChild(em);
            var text = document.createTextNode(news[i * 10 + j][1]);
            ht.title = news[i * 10 + j][1];
            ht.appendChild(text);
            ht.target = "_blank";
            ht.href = news[i * 10 + j][0];
            mydiv.appendChild(ht);
            var huanhang = document.createElement("br");
            huanhang.innerHTML = "<br/>";
            mydiv.appendChild(huanhang);
         }
      }
   }
   /*获取页码数*/
   maxIndex = i;
   /*设置下拉框的值*/
   var ye = document.getElementById("mouye");
   /* 下拉框重置*/
   var ops = ye.getElementsByTagName("option");
   var onum = ops.length;
   if (onum != 0) {
      for (var i_o = 0; i_o < onum; i_o++) {
         ye.removeChild(ops[0]);
      }
   }

   for (var i_ye = 0; i_ye < maxIndex; i_ye++) {
      var op = document.createElement("option");
      var start = i_ye * 10 + 1;
      var end = (1 + i_ye) * 10;
      if ((1 + i_ye) * 10 > news.length) {
         end = news.length;
      }
      op.value = i_ye;
      op.innerText = start + "-" + end + "条";
      if (start == end) {
         op.innerText = "第" + news.length + "条";
      }
      ye.appendChild(op);
   }
};


/*查看上一页的新闻*/
function n_last() {     
   var cname = "mydiv" + currentIndex;
   var titles = document.getElementById(cname);
   titles.style.display = 'none';
   currentIndex--;
   var ye = document.getElementById("mouye");

   
   if (currentIndex == -1) {
      currentIndex = 0;
   }
   else {
      ye.selectedIndex--;
   }
   cname = "mydiv" + currentIndex;
   var titlesN = document.getElementById(cname);
   titlesN.style.display = 'block';

   if(currentIndex < 1) {               //改变翻页按钮颜色
      pgDownBtn.style.color = '#000000';
      pgUpBtn.style.color = 'rgba(71, 73, 72, 0.575)';
   }
   else {
      pgUpBtn.style.color = '#000000';
      pgDownBtn.style.color = '#000000';
   }  
};

/*查看下一页的新闻*/
function n_xia() {  
   var cname = "mydiv" + currentIndex;
   var titles = document.getElementById(cname);
   titles.style.display = 'none';
   currentIndex++;
   var ye = document.getElementById("mouye");
   if (currentIndex == maxIndex) {
      currentIndex = maxIndex - 1;
   }
   else {
      ye.selectedIndex++;
   }
   cname = "mydiv" + currentIndex;
   var titlesN = document.getElementById(cname);
   titlesN.style.display = 'block';

   if(currentIndex > maxIndex - 2){       //改变翻页按钮颜色
      pgUpBtn.style.color = '#000000';
      pgDownBtn.style.color = 'rgba(71, 73, 72, 0.575)';
   }
   else {
      pgUpBtn.style.color = '#000000';
      pgDownBtn.style.color = '#000000';
   }  
};

/*查看选中页码的新闻*/
function toSelect() {
   var cname = "mydiv" + currentIndex;
   var titles = document.getElementById(cname);
   
   titles.style.display = 'none';
   var ye = document.getElementById("mouye");
   var index = ye.selectedIndex;
   var value = ye.options[index].value;
   currentIndex = Number(value);
   var cname = "mydiv" + currentIndex;
   var titlesN = document.getElementById(cname);
   titlesN.style.display = 'block';

   if(currentIndex == 0) {               //改变翻页按钮颜色，这个是根据上面的currentIndex变化的，只能放下面
      pgDownBtn.style.color = '#000000';
      pgUpBtn.style.color = 'rgba(71, 73, 72, 0.575)';
   }
   else if(currentIndex == maxIndex - 1){
      pgUpBtn.style.color = '#000000';
      pgDownBtn.style.color = 'rgba(71, 73, 72, 0.575)';
   }
   else {
      pgUpBtn.style.color = '#000000';
      pgDownBtn.style.color = '#000000';
   }  
}

//关闭按钮
var closeBtn = document.querySelector('.close');
closeBtn.addEventListener('click', function () {
   newsDiv.style.display = 'none';
});