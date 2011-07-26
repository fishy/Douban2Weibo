// ==UserScript==
// @name         Share Douban Item to Sina Weibo
// @namespace    https://github.com/JamesXiao/Douban2Weibo
// @include       http://movie.douban.com/subject/*
// @include       http://music.douban.com/subject/*
// @include       http://book.douban.com/subject/*
// @include       http://www.douban.com/photos/photo/*
// @include       http://www.douban.com/note/*
// @description  分享豆瓣条目至新浪微博
// @author 	xydonkey, +C
// @version	0.5.5
// under GPL 3.0 Lisence.
// ==/UserScript==

url = location.href;
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
    if (/movie|music|book/.test(url)) return $("/h1")[0].firstElementChild.innerHTML;
    else if (/photos/.test(url) && $('.photo_descri')[0].children[0].textContent) {
	return $('.photo_descri')[0].children[0].textContent;
    } else
	return document.title.replace(/\ \(豆瓣\)/, "");
}

//评分：力荐、推荐、还行、较差、很差、默认值是空(句号)
function getRating(){
    var ratingTable ={'5':'，力荐。','4':'，推荐。','3':'，还行。','2':'，较差。','1':'，很差。','':'。'};
    if ($("#n_rating")){
        var rate=$("#n_rating").value;
        return rateword=ratingTable[rate];
    }
    else
        return '';
}

//短评
function getComment(){
    if ($("#interest_sect_level")) {
	comment = $("#interest_sect_level").firstChild.lastChild.textContent.replace(/^\s+|\s+$/g,"");  //regular expression use to right trim
    if(comment=='')
        return '';
    return '「' + comment + '」';
  }
  else return '';
}

//状态，想读、在读、读过
function getState(){
    if ($("#interest_sect_level") && $("#interest_sect_level").firstChild.tagName=="DIV")
        return $("#interest_sect_level").firstChild.firstChild.innerHTML;
    else if (/photos/.test(url)) return '分享豆瓣相册：';
    else if (/note/.test(url)) return '分享豆瓣日记：';
    else 
        return '';
}

//组装微博内容
function generateWeiBo(){
    return getState() + '「' + getTitle() + '」' + getRating() + getComment();
}

//封面地址
function getCover(){
    if ($('#mainpic'))
	return $('#mainpic').children[0].innerHTML.replace(/^\s*.*src=\"(.*?)\".*\s*$/,"$1").replace("/mpic/","/lpic/");
    else if (/photos/.test(url))
	return $('.mainphoto')[0].children[0].innerHTML.replace(/^\s*.*src=\"(.*?)\".*\s*$/,"$1");
    else
	return '';
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


text = generateWeiBo();
pic = getCover();

var param = {
	url:	url,
	type:	'3',
	title:	text,
	pic:   	pic,
	appkey: '3273825921',
	rnd:	new Date().valueOf()
};

var share2Weibo = document.createElement('div');
// 新浪微博
// http://www.sinaimg.cn/blog/developer/wiki/16x16.png
share2Weibo.innerHTML = getSharingHtml("http://service.weibo.com/share/share.php?", "分享至新浪微博", "data:image/png;base64,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%3D%3D");

// Google Buzz 
// http://code.google.com/apis/buzz/images/google-buzz-16x16.png
param = {
	url:		url,
	message:	text,
	imageurl:   	pic
};
share2Weibo.innerHTML +=getSharingHtml("https://www.google.com/buzz/post?", "分享至Google Buzz", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAArlJREFUOMulk3tMDVAcx4/urYwor40srN3tllXUwkJXFGGFzdCibpFoRbdSbtR1K7WeHsMIeU7TrAez5jFr/IF57DITZYmyrIeFrNZafZx7RwibzW/77vy2c36f32/nfI8QP8X0sCoHKaOUSYohMn3bcxB/CrkR4Rp+pVMVdw/nva04FfUwLucztmntKFOaGBVrwkl7C9fQK53ms78VqyOrmZzWjPOhfiYW9WGT2Y3S8BHlrnYUyU2I2DeIqMesya7AZ2sFgxCZ+LlvKMcu+S1jCvsZmd2LlbEHa2MX1ukfUKa+R+ikNteRXHKKvpYsbt/YxpyoMjPEzwyoNATHo404jEjrRuzpwcb4GWtL9zasdrQiYhrYfqIY2vXwWgPPXDhaHGUGVJoBPF+qoW2tL4aDNQjjF4S+A6W+RRY3y9EbWFFwkt6mcHilBtMEKXu67o22XK4FUL8qgKZFbvTp13Pk/H1s9e9k11pE9FNUhjJa6xKhwRMeCHisgIfDZK74Aaj19+HFHDXvlrjTn64lP78KZWgNjknniLhZyPqrgXx8sQpqJeS+YODuCAZuTxgENF6bu5BnM1W89HXjfYAHX2JXE7o7j5DqfKZeWIk4toDF5WF01Blkd1/6r6tpKA0wAxrNAOOmZek88XSl3m0ade5TOB7mh7Z6Jw5nAxl+TIPisA8i3xPf4/503IkDOVFSao4ZYPz+lKYsv2geTRrP/iAvAi+noChegNjnjTgwW65SBVIZXiwv9CI3O8HizKEWNsVExhN0Jg7FoXmIHA/ZVRblzZK5VJY3yjQNjlsN3239q6XtddoD1lnB2OZqEOke0kzzsdOvw2FHFGMTYpiypQBV5OlPg2P/HKOiQ0qHxXshEmfIt/fGXheBamNJs1p78bxL+KVM17DyDIvr/vKJdH/4dTrxrwH8l74Cv8f2nGjE3jMAAAAASUVORK5CYII%3D");

// Twitter
// https://si0.twimg.com/images/dev/cms/intents/bird/bird_blue/bird_16_blue.pn
param={
	url: url,
	text: text
};
share2Weibo.innerHTML +=getSharingHtml("https://twitter.com/share?", "分享至Twitter", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowNTgwMTE3NDA3MjA2ODExQTQxQUNFN0NCOEMyNEMzNiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo3NUYyNkE5MDQ5QzYxMUUwQTJGN0YyQzFDMzFCQjZCMyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3NUYyNkE4RjQ5QzYxMUUwQTJGN0YyQzFDMzFCQjZCMyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkFGREYyRDc2MTIyMDY4MTFBNDFBQ0U3Q0I4QzI0QzM2IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjA1ODAxMTc0MDcyMDY4MTFBNDFBQ0U3Q0I4QzI0QzM2Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+6mUHuwAAAmhJREFUeNqkU0toU0EUvTPz8j5JXkhMGvMRE1riSmw3NQZE0pUfNAvFRVeNIChWrJ+FK6laijs/WHVTWhBx4aZFkEIXWnGpmLqo+AFJqzSBQBOtTdN83njnJSlRuhByeffNe8Pce+459w7hnEM7RqFNI77B2/9xiuLDkkBZGLgBvFa9LtZGBUQcCOPLuXWNDKhinWQO96Ti6rhyPLanislaKBACkaB3N7Xqearap4gkJwViE5nKWpI5PUlpmw9Ad9uff8mNgEWOm8BozB49DAujp8t+t8v1JlNMcEk+CZReBA4aYWxOc7lfEN2jU80GIFnMIDvjgY3S+hNBg4JhQODyo/Tiyu9xyaZTgWTxBJ2SyzuMZadqqiNAFK2pA4hEFcW2H/fiwKQks+89CCLJ9PnEry6n6nj5Y62by5pEZEVw96EDYRIIqiYrXA0OFuA8GQ13pOpkcRYClx4WcoXVByEbfFMYLSF3E42IshvBDWHAqdsKXTt86XwZAlJ9kwOvVmAgGlkaiMJI/PHb0e/r0LkpZotx5J3odM3c6IvM4m+a+C/cv4PTeA+MWlq0jFl1OLqv++lsptxvlv53NOhQKcyfifUFr07M83IJ6PCJ+FeLzfEa25iiivYKheEzn7P9zUFpNRmM0s0D4XERbBRXgVc2gCC6bym/durs1LtjC7lijFhk7L2K3GWcErqJ7FVp9los+OzIru23AkNjWV6r1BXxD43B8t1BFb8PvV/+GZ/4kOn5uFIKmcJhYMghZ3t99sVzvTvn8Mw0ip3llbKpm5ngn9soxrkHPdyylxVioX/a8pq0e53/CDAAjXrI68wuXKYAAAAASUVORK5CYII%3D");

// Follow5
// http://www.follow5.com/f5/scfe/common/imgs/plugin/5button/16.gif
param = {
    url: url,
    title: text,
    picurl: pic
};
share2Weibo.innerHTML +=getSharingHtml("http://www.follow5.com/f5/discuz/sharelogin.jsp?", "分享至Follow5", "data:image/gif;base64,R0lGODlhEAAQAPcAANXW1vz8/GtlV4+LgLWzq+jo6NHR0G1oWkpGOvr6+pGNg1JMPd7d3YmFeeXk4sHBwWhiVMvJxaWhmVpWS/b29mJdTlpUREI+M4SEgvT09MzMzHl5d5eTiSolGnJuYJeXl1JPRI6Ninp2akU+LK2trTk2LWFbTV1aUdrZ1qOjokQ9K01IPX56bTQtHbq6uuLi4vDw8ElCMXFrXoyIfWhnYlZQQEtJQXZ1dF5YSt3c2GReTz02JdnZ2fPy8729ve7u7pqamkI7Ke3t61ROPsHBvrGxsUA5J+Hg3b67tYJ9ckxFNIaCdmtmV7q3sKmoplBKOcXExPT08ru5sqGdlD87Mebm5cG+uOTk5GpmW6uookVBNl5YSNLQzLW1tkE6KJSQhfb29J2dnDgyITYwIOzs7D84JkhBL5+emp6bkXNybjcxH1VTTGxqZsXDvurq63t7eNnX0z45LnVwY2VgVJKRkPHw76qpqkM8KUZCOtDOycfFv1pXU2FcTUE8MF1YSbGvp1ZRQ2VgUDIuJGllXU5IN19ZSlBKPTozIzw1I1lTQ/7+/mVfUGZhUlhSQmJcTWNdTmNeT2BaS2ReUGZgUWBbS1tVRlxWRl1XR1tWRmdgUl1YR/n5+WRfUEpDMmdiU2dhUlxWR/j4+FhRQWNfT11WR+Hi4vn5+ICAfpuXjl5cV+np6WZhU////urp5/7+/2dhU+3t7l9aTODf3Pv7+/n4+Pn5+nBva1dSQ/79/nlzZtfX11lURvPz81tWRZaVk2NeUGFeV8nGwdzc3GVfUVhSQfX19SQfE/X19FhSQ1lSQllTQri3t6+vsJyYj8fGwOrp6Orp6uvr6mhhUy8qHGZgUmJgWt/f4Hp3cL+9uPf392FcTklEOFdSRPHx8fLx8Kilno+Pjr68tf39/cvKyufn58vLzFxXRsPAu7OztFZPP0A5KM/P0EI7KqysrFlXUGFbTFlTRdTU02xnXIiHg+/u7ODg4OPi4K2rp6ypoWBeWGZkYk1GNV5YSVdRQf///0M8KiwAAAAAEAAQAAAImwBrCBxIsGCNRAgRlljIkFDCRJgiYurjz5+iihUtSOTHkV81jBiddeT3ruQ7Zv6wmVxZEpJLTi8UNUBAZdcvlzgn6fw0S9ELjER0CmVCNBZGKXkqoiBK9J/TfxGQeHE6p+KIp1hVYD1UkRBWpx16GHraomKNr/+2KRI39d+GikbQ/rNYDAOJigPk/utkCmQDvU/LdPoXBLDhpwEBADs%3D");

// add sharing link to page
if ($('#rating')){
    var add = $('#rating')
}
else if ($('.sns-bar-fav')[0]){
    var add = $('.sns-bar-fav')[0];
}
else if ($('#interest_sect_level')){
    var add = $('#interest_sect_level');
}
var htmlContent =  add.appendChild(share2Weibo);
