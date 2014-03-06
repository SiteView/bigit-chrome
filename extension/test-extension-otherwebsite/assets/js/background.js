var  storelist = {
    OneMobile:"http://package.1mobile.com/d.php?pkg=@appName@&channel=304",
    wangdoujia:"http://apps.wandoujia.com/apps/@appName@/download"
}

var _defaultStore_ = "wangdoujia";

function getDownloadAppUrl(appid){
    var storeurl = storelist[_defaultStore_];
    return storeurl.replace(/\@appName\@/,appid);
}

function downloadApp(appId){
	var downloaURL = getDownloadAppUrl(appId);
	var filename = appId + ".apk";
	chrome.downloads.download({
                url:downloaURL,
                filename:filename
 	}, function(downloadId){
      	     console.log("download item's id is " + downloadId);
	})
}

//获取google play 页面下载按钮发送的消息
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var url = sender.tab.url;
        var query = url.replace("https://play.google.com/store/apps/details?id=","");
        if(query == url){
        	console.log("the message come from error url");
        	return;
        }
        var appId = query.split("\&")[0];
       	downloadApp(appId);
    }
);