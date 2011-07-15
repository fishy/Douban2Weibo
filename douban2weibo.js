// ==UserScript==
// @name         Share Douban Item to Sina Weibo
// @namespace    https://github.com/JamesXiao/Douban2Weibo
// @include       http://movie.douban.com/subject/*
// @include       http://music.douban.com/subject/*
// @include       http://book.douban.com/subject/*
// @description  分享豆瓣条目至新浪微博
// @author 	xydonkey, +C
// @version	0.5.4
// under GPL 3.0 Lisence.
// ==/UserScript==

// 自造 selector
function $$(w){
	return document.querySelectorAll(w);
};
function $(select){
	var name = select.substring(1);
	switch(select.charAt(0)){
		case '#':
			return document.getElementById(name);
		case '.':
			return document.getElementsByClassName(name);
		case '/':
			return document.getElementsByTagName(name);
		default:
			return document.getElementsByName(select);
	}
};

//题目
function getTitle(){
	return $("/h1")[0].firstElementChild.innerHTML;
}

//评分：力荐、推荐、还行、较差、很差、默认值是空(句号)
function getRating(){
    var ratingTable ={'5':'，力荐。','4':'，推荐。','3':'，还行。','2':'，较差。','1':'，很差。','':'。'};
    if ($("#n_rating")){
        var rate=$("#n_rating").value;
        return rateword=ratingTable[rate];
    } else
        return '';
}

//短评
function getComment(){
    comment = $("#interest_sect_level").firstChild.lastChild.textContent.replace(/^\s+|\s+$/g,"");  //regular expression use to right trim
    if(comment=='')
        return '';
    return '「' + comment + '」';
}

//状态，想读、在读、读过
function getState(){
    if ($("#interest_sect_level").firstChild.tagName=="DIV")
        return $("#interest_sect_level").firstChild.firstChild.innerHTML;
    else
        return "";
}

//组装微博内容
function generateWeiBo(){
    return getState() + '「' + getTitle() + '」' + getRating() + getComment();
}

//封面地址
function getCover(){
    return $('#mainpic').children[0].innerHTML.replace(/^\s*.*src=\"(.*?)\".*\s*$/,"$1").replace("/mpic/","/lpic/");
}

//组成参数串
function addParam(param){
    var temp=[];
    for( var p in param ){
        temp.push(p + '=' + encodeURIComponent( param[p] || '' ) )
    }
    return temp;
}

//分享的链接
function getLink(link){
    return link + addParam(param).join('&');
}

//分享按钮的html代码
function getSharingHtml(url, alt, img){
    return '<a target="_blank" href=\"' +getLink(url)+ '"> <img src="' + img + '" alt="' + alt + '" title="'+alt+'" rel="v:image"></a>&nbsp;';
}

url = location.href;
text = generateWeiBo();
pic = getCover();

var param = {
	url:	url,
	type:	'3',
	title:	text,
	pic:   	pic,
	appkey: '3273825921',
	rnd:	new Date().valueOf()
}
var share2Weibo = document.createElement('div');
share2Weibo.innerHTML =getSharingHtml("http://service.weibo.com/share/share.php?", "分享至新浪微博", "http://www.sinaimg.cn/blog/developer/wiki/16x16.png");

// Google Buzz 
param = {
	url:		url,
	message:	text,
	imageurl:   	pic
}
share2Weibo.innerHTML +=getSharingHtml("https://www.google.com/buzz/post?", "分享至Google Buzz", "http://code.google.com/apis/buzz/images/google-buzz-16x16.png");

// Twitter
param={
	url: url,
	text: text
}
share2Weibo.innerHTML +=getSharingHtml("http://twitter.com/share?", "分享至Twitter", "https://si0.twimg.com/images/dev/cms/intents/bird/bird_blue/bird_16_blue.png");

// Follow5
param = {
    url: url,
    title: text,
    picurl: pic
}
share2Weibo.innerHTML +=getSharingHtml("http://www.follow5.com/f5/discuz/sharelogin.jsp?", "分享至Follow5", "http://www.follow5.com/f5/scfe/common/imgs/plugin/5button/16.gif");

// add sharing link to page
if ($('#rating')){
    var add = $('#rating')
} else
    var add = $('#interest_sect_level');
var htmlContent =  add.appendChild(share2Weibo);
