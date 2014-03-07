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
        var apkStack = item.apkWaitForDownloadStack;
        apkStack = apkStack ? apkStack : [];
        apkStack.push(downloadId);
        chrome.storage.local.set({"apkWaitForDownloadStack":apkStack});
    });
}
///删除等待下载的任务 
function removeApkFormDownloadStorge(downloadId){
    chrome.storage.local.get('apkWaitForDownloadStack',function(item){
        var apkStack = item.apkWaitForDownloadStack;
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
//清空安装任务队列
function clearApkToInstallStorge(){
    chrome.storage.local.set({"apkWaitForInstallStack":[]});
}
//添加需要安装的任务到队列
function addApkToInstallStorge(downloadId){
    //判断是否为apk下载
     chrome.storage.local.get('apkWaitForDownloadStack',function(item){
        var apkStack = item.apkWaitForDownloadStack;
        if(!apkStack || !apkStack.length){
            return;
        }
        var flag = false;
        var length = apkStack.length;
        for(var i = 0 ; i < length ; i++){
            if(apkStack[i] == downloadId){
                flag = true;
                break;
            }
        }
        if(!flag){
            return;
        }
        //寻找下载文件信息
        chrome.downloads.search({id:downloadId}, function(items){
            console.log("下载完成:");
            console.log(items[0]);
            var item = items[0]
            chrome.storage.local.get('apkWaitForInstallStack',function(stack){
                var apkStack = stack.apkWaitForInstallStack;
                apkStack = apkStack ? apkStack : [];
                apkStack.push(item);
                chrome.storage.local.set({"apkWaitForInstallStack":apkStack});
            });
            removeApkFormDownloadStorge(downloadId);
        });
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

function installApp(items){
    var length = items.length;
    var plugin = new PluginForPhone();
    for(var i=0;i<length;i++){
        var item = items[i];
        if(!item.exists){
            continue;
        }
        plugin.install(item.filename,function(flag){
            if(flag){
                console.log(item.filename+" 安装完成");
            }else{
                console.log(item.filename+" 安装失败");
            }
        })
    }
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
        //下载完成
        if(data && data.endTime && data.state && data.state.current == "complete"){
            addApkToInstallStorge(data.id);
        }else if(data.canResume && data.canResume.current && data.error){ //下载失败
            removeApkFormDownloadStorge(data.id);
        }
});

chrome.storage.onChanged.addListener(function(changes,areaname){
    //当安装队列发生变化时才进行app安装
    if(areaname != "local" || !changes.apkWaitForInstallStack){
        return;
    }
    var stack = changes.apkWaitForInstallStack.newValue;
    if(!stack.length){//如果新值对列为空 
        return;
    }
    installApp(stack);
    clearApkToInstallStorge();
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

function initLocalStorage(){
    chrome.storage.local.clear();
}