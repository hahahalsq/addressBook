$(function () {
  var cityWrapper = document.querySelector('.city-wrapper-hook');
  var cityScroller = document.querySelector('.scroller-hook');
  var cities = document.querySelector('.cities-hook');
  var shortcut = document.querySelector('.shortcut-hook');
  var scroll;

  var shortcutList = [];
  var anchorMap = {};
  //渲染城市
  initCities(cityData,hotData,localData);

  bindEvent();
  //点击点击城市后
  clickAction()
  //城市列表初始化
  function initCities(cityData,hotData,localData) {
    var headHtml = ''
    headHtml = '<div class="localCity">' + '当前位置' + '</div>';
    headHtml += '<div class="localCityDiv">' +'<div class="localCityItem">' + localData + '</div>' +'</div>';
    headHtml += '<div class="localCity">' + '热门城市' + '</div>';
    headHtml += '<div class="localCityDiv">';
    if(hotData){
      hotData.forEach(function(hotCity){
        var aItem = '<div class="localCityItemBorder">' + '<div class="localCityItem">' + hotCity + '</div>' +'</div>';
        headHtml += aItem;
      })
    }
    headHtml += '</div>';
    var y = 0;
    var titleHeight = 28;
    var itemHeight = 44;
    var lists = '';
    lists += headHtml;
    var en = '<ul>';
    /////////////////////////////////////////////////////////////////////////////
    /// 在侧边栏添加上热门和当前的两个选项,同时添加点击滑动到顶部的处理事件
    en+= '<li data-anchor="' + 'local' + '" class="itemB">' + '当前' + '</li>';
    en+= '<li data-anchor="' + 'hot' + '" class="itemB">' + '热门' + '</li>';
    anchorMap['local'] = 0;
    anchorMap['hot'] = 0;
    ///////////////////////////////////////////////////////////////////////////
    cityData.forEach(function (group) {
      var name = group.name;
      lists += '<div class="title">' + name + '</div>';
      lists += '<ul>';
      group.cities.forEach(function (g) {
        lists += '<li class="item" data-name="' + g.name + '" data-id="' + g.cityid + '"  id="listId" >' + g.name + '</li>';
      });
      lists += '</ul>';


      var name = group.name.substr(0, 1);
      en += '<li data-anchor="' + name + '" class="item">' + name + '</li>';
      var len = group.cities.length;
      anchorMap[name] = y;
      y -= titleHeight + len * itemHeight + 10;
    });
    // console.log(anchorMap)
    en += '</ul>';

    cities.innerHTML = lists;

    shortcut.innerHTML = en;
    shortcut.style.top = (cityWrapper.clientHeight - shortcut.clientHeight) / 2 + 'px';

    scroll = new window.BScroll(cityWrapper, {
      probeType: 3
    });

    // scroll.on('scroll', function (pos) {
    //   console.log(Math.round(pos.y));
    // });

    scroll.scrollTo(0, 0);
  }


  //滑动城市右边的字母
  function bindEvent() {
    var touch = {};
    var firstTouch;

    shortcut.addEventListener('touchstart', function (e) {

      var anchor = e.target.getAttribute('data-anchor');

      firstTouch = e.touches[0];
      touch.y1 = firstTouch.pageY;
      touch.anchor = anchor;

      scrollTo(anchor);

    });

    shortcut.addEventListener('touchmove', function (e) {

      firstTouch = e.touches[0];
      touch.y2 = firstTouch.pageY;

      var anchorHeight = 16;

      var delta = (touch.y2 - touch.y1) / anchorHeight | 0;

      var anchor = shortcutList[shortcutList.indexOf(touch.anchor) + delta];

      scrollTo(anchor);

      e.preventDefault();
      e.stopPropagation();

    });

    function scrollTo(anchor) {
      var maxScrollY = cityWrapper.clientHeight - cityScroller.clientHeight;

      var y = Math.min(0, Math.max(maxScrollY, anchorMap[anchor]));

      if (typeof y !== 'undefined') {
        scroll.scrollTo(0, y);
      }
    }
  }


  //点击后的操作
  function clickAction(){
   var touchFlag=false;
  cities.addEventListener('touchstart',function(){
    touchFlag = false;
    $('#findcityInp').blur();
  },false)
  cities.addEventListener('touchmove',function(){
    touchFlag = true;
  },false)
  cities.addEventListener('touchend',function(e){
    if(!touchFlag){
      console.log(e.target.getAttribute('data-id'));
    }
    touchFlag=false
  },false)
  }
  ////////////////////////////////////////////////////////////////
  //输入城市查询
  var key = false;
  $('#findcityInp').on('compositionstart', function () {
    key = true;
    console.log('不搜索')
  });
  $('#findcityInp').on('compositionend', function (e) {
    var keyWord = $.trim(e.target.value);
   if(keyWord.length>0){
    var result = findCity(keyWord, cityData);
    initCities(result,hotData,localData);
   }else{
    initCities(cityData,hotData,localData);
   }
  });

  $('#findcityInp').on('input', function (e) {
    var keyWord = $.trim(e.target.value);
    var result = findCity(keyWord, cityData);
    // console.log(result)
    initCities(result,hotData,localData);
  });
  ////////////////////////////////////////////////////////////////
  //城市查询
  function findCity(keyWord, data) {
    if (!(data instanceof Array)) return;

    var reg = new RegExp(keyWord);
    var arr = [];
    // console.log(keyWord)
    // console.log(data)
    if(keyWord.length>0 && checkCh(keyWord)==false){
      data.forEach((item, index) => {
        var obj = {
          name:'',
          cities:[]
        }
        item.cities.forEach((childItem, childIndex) => {
          if (childItem.tags.match(reg)) {
            obj.cities.push(childItem)
          }
        })
        if(obj.cities.length != 0){
          obj.name = item.name
          arr.push(obj)
        }
      })
    }else if(keyWord.length ==1 && checkCh(keyWord)==true){
      data.forEach((item,index)=>{
        if(item.name == keyWord){
          // console.log(item)
          arr.push(item)
        }
      })
    }
    else{
      arr = data
    }
    // console.log(arr);
    return arr;
  }
  //判断英文和汉字
function count(str) {

  var arr = str.split(''),

      len = arr.length,

      count = 0;

  for (var i = 0; i < len; i++) {

      var s = escape(arr[i]);    //例如：s='你';escape(a) ;   "%u4F60"

      if (s.indexOf('%u')) {

          count = count + 2;

      } else {

          count++;

      }

  }

  return count;

}
//判读输入的字符是否是英文
function checkCh(str){
  var RegExp = /^[a-zA-Z]{1}$/;
  return RegExp.test(str);       
}

})