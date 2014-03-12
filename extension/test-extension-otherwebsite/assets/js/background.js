(function(){

var  storelist = {
    OneMobile:"http://package.1mobile.com/d.php?pkg=@appName@&channel=304",
    wangdoujia:"http://apps.wandoujia.com/apps/@appName@/download"
}

var _defaultStore_ = "wangdoujia";
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
        var storeurl = storelist[_defaultStore_];
        var downloaURL = storeurl.replace(/\@appName\@/,appId);
        var filename = appId + ".apk";
        chrome.downloads.download({
            url:downloaURL,
            filename:filename
        }, function(downloadId){
            console.log("download item's id is " + downloadId);
            //添加文件到安装队列
            AppDownloader.addApkToDownloadStorge(downloadId);
        })
    }
);

//启动 监听usb进程
function __startUsbListener(){
    console.log("启动usb监听进程");
    var p = new PluginForPhone();
    p.startProcess();
}
__startUsbListener();

})()

