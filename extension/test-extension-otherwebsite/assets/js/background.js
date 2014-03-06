var  storelist = {
    OneMobile:"http://package.1mobile.com/d.php?pkg=@appName@&channel=304",
    wangdoujia:"http://apps.wandoujia.com/apps/@appName@/download"
}

var _defaultStore_ = "wangdoujia";

function getDownloadAppUrl(appid){
    var storeurl = storelist[_defaultStore_];
    return storeurl.replace(/\@appName\@/,appid);
}
//添加等待下载的任务
function addApkToDownloadStorge(downloadId){
    chrome.storage.local.get('apkWaitForDownloadStack',function(item){
        apkStack = item.apkWaitForDownloadStack;
        apkStack = apkStack ? apkStack : [];
        apkStack.push(downloadId);
        chrome.storage.local.set({"apkWaitForDownloadStack":apkStack});
    });
}
///删除等待下载的任务 
function removeApkFormDownloadStorge(downloadId){
    chrome.storage.local.get('apkWaitForDownloadStack',function(item){
        apkStack = item.apkWaitForDownloadStack;
        if(!apkStack || !apkStack.length){
            return;
        }
        var length = apkStack.length;
        for(var i = 0 ; i < length ; i++){
            if(apkStack[i] == downloadId){
                 apkStack.splice(i,1);
                 break;
            }
        }
        chrome.storage.local.set({"apkWaitForDownloadStack":apkStack});
    });
}

//安装已下载完成的任务
function installApk(downloadId){
    chrome.downloads.search({id:downloadId}, function(item){
        console.log("下载完成:");
        console.log(item);
    });
}

function downloadApp(appId){
    var downloaURL = getDownloadAppUrl(appId);
    var filename = appId + ".apk";
    chrome.downloads.download({
        url:downloaURL,
        filename:filename
    }, function(downloadId){
         console.log("download item's id is " + downloadId);
         addApkToDownloadStorge(downloadId);
    })
}
/*
*下载完成： 
data{
    endTime:{
        current:"200--xxx"
    }
    id:xxx
    state:{
        current:"complete"
    }
}
下载终止：
data{
    canResume:{current:false}
    id:
    error
}
*/
chrome.downloads.onChanged.addListener(function(data){
        console.log("download:");
        console.log(data);
        //下载完成
        if(data && data.endTime && data.state && data.state.current == "complete"){
            removeApkFormDownloadStorge(data.id);
            installApk(data.id);
        }else if(data.canResume && data.canResume.current && data.error){ //下载失败
            removeApkFormDownloadStorge(data.id);
        }
});
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