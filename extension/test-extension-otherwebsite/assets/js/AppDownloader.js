var AppDownloader = function(){};
//定义字符串常量：
Object.defineProperties(AppDownloader,{
	"WaitForDownloadStack":{//等待下载的apk队列
		value:"_apkWaitForDownloadStack_"
	},
	"WaitForInstallStack":{//等待安装队列
		value:"_apkWaitForInstallStack_"
	}
});

//判断元素是否存在于数组，存在返回index，不存在返回-1
Object.defineProperty(AppDownloader,"isExistInArray",{
	value:function(arr,item){
		var index = -1;
		if(!arr || !arr.length){
			return index;
		}
		var length = arr.length;
		for(var i = 0; i < length ; i++){
			if(arr[i] == item){
				index = i;
				break;
			}
		}
		return index;
	}
});

//添加等待下载的任务
Object.defineProperty(AppDownloader,"addApkToDownloadStorge",{
	value:function(downloadId){
		chrome.storage.local.get(AppDownloader.WaitForDownloadStack,function(item){
			var apkStack = item[AppDownloader.WaitForDownloadStack];
			apkStack = apkStack ? apkStack : [];
			apkStack.push(downloadId);
			var storage = {};
			storage[AppDownloader.WaitForDownloadStack]=apkStack;
			chrome.storage.local.set(storage);
		});
	}
});

///删除等待下载的任务 
Object.defineProperty(AppDownloader,"removeApkFormDownloadStorge",{
	value:function(downloadId){
		chrome.storage.local.get(AppDownloader.WaitForDownloadStack,function(item){
			var apkStack = item[AppDownloader.WaitForDownloadStack];
			var index = AppDownloader.isExistInArray(apkStack,downloadId);
			if(index === -1){
				return ;
			}
			apkStack.splice(index,1);
			var storage = {};
			storage[AppDownloader.WaitForDownloadStack]=apkStack;
			chrome.storage.local.set(storage);
		});
	}
});

//添加需要安装的任务到队列
Object.defineProperty(AppDownloader,"addApkToInstallStorge",{
	value:function(downloadId){
		 //判断是否为apk下载

		chrome.storage.local.get(AppDownloader.WaitForDownloadStack,function(item){


			var apkStack = item[AppDownloader.WaitForDownloadStack];
			var index  = AppDownloader.isExistInArray(apkStack,downloadId);
			if(index == -1){
				return;
			}
			//寻找下载文件信息
			chrome.downloads.search({id:downloadId}, function(items){
				console.log("下载完成:");
				console.log(items[0]);
			    var item = items[0]
			    chrome.storage.local.get(AppDownloader.WaitForInstallStack,function(stack){
					var apkStack = stack[AppDownloader.WaitForInstallStack];
					apkStack = apkStack ? apkStack : [];
					apkStack.push(item);
					var storage = {};
					storage[AppDownloader.WaitForInstallStack]  = apkStack
					chrome.storage.local.set(storage);
			   	});
				AppDownloader.removeApkFormDownloadStorge(downloadId);
			});
		});
	}
});

//初始化本地数据仓库
Object.defineProperty(AppDownloader,"initLocalStorage",{
	value:function(){
		chrome.storage.local.clear();
	}
});

//清空安装队列
Object.defineProperty(AppDownloader,"clearApkToInstallStorge",{
	value:function(){
		var storage = {};
		storage[AppDownloader.WaitForInstallStack] = [];
		chrome.storage.local.set(storage);
	}
});
//安装app
Object.defineProperty(AppDownloader,"installApp",{
	value:function(items){
	 	var length = items.length;
	    var plugin = new PluginForPhone();
	    for(var i=0;i<length;i++){
	        var item = items[i];
	        if(!item.exists){
	            continue;
	        }
	        plugin.install(item.filename,function(flag){
	            if(flag){
	               AppNotifications.tip("success",item.filename)
	            }else{
	                AppNotifications.tip("fail",item.filename)
	            }
	        })
	    }
	}
});
/*
*下载完成： data{endTime:{current:"200--xxx"},id:xxx,state:{current:"complete"}}
下载终止：data{canResume:{current:false},id:"",error}
*/
chrome.downloads.onChanged.addListener(function(data){
        //下载完成
        if(data && data.endTime && data.state && data.state.current == "complete"){
            AppDownloader.addApkToInstallStorge(data.id);
        }else if(data.canResume && data.canResume.current && data.error){ //下载失败
            AppDownloader.removeApkFormDownloadStorge(data.id);
        }
});

chrome.storage.onChanged.addListener(function(changes,areaname){
    //当安装队列发生变化时才进行app安装
    if(areaname != "local" || !changes[AppDownloader.WaitForInstallStack]){
        return;
    }
    var stack = changes[AppDownloader.WaitForInstallStack].newValue;
    if(!stack || !stack.length){//如果新值对列为空 
        return;
    }
    AppDownloader.installApp(stack);
    AppDownloader.clearApkToInstallStorge();
});

AppDownloader.initLocalStorage();