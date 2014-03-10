var AppDownloder = function(){};
//定义字符串常量：
Object.defineProperties(AppDownloder,{
	"WaitForDownloadStack":{//等待下载的apk队列
		value:"_apkWaitForDownloadStack_"
	},
	"WaitForInstallStack":{//等待安装队列
		value:"_apkWaitForDownloadStack_"
	}
});

//判断元素是否存在于数组，存在返回index，不存在返回-1
Object.defineProperty(AppDownloder,"isExistInArray",{
	value:function(arr,item){
		var index = -1;
		if(!arr || !arr.length){
			return index;
		}
		var length = arr.length;
		for(var i = 0; i < length ; i++){
			if(arr[i] == time){
				index = i;
				break;
			}
		}
		return index;
	}
});

//添加等待下载的任务
Object.defineProperty(AppDownloder,"addApkToDownloadStorge",{
	value:function(downloadId){
		 chrome.storage.local.get(AppDownloder.WaitForDownloadStack,function(item){
		        var apkStack = item.apkWaitForDownloadStack;
		        apkStack = apkStack ? apkStack : [];
		        apkStack.push(downloadId);
		        var storage = {};
		        storage[AppDownloder.WaitForDownloadStack]=apkStack;
		        chrome.storage.local.set(storage);
		});
	}
});
///删除等待下载的任务 
Object.defineProperty(AppDownloder,"removeApkFormDownloadStorge",{
	value:function(downloadId){
		chrome.storage.local.get(AppDownloder.WaitForDownloadStack,function(item){
			var apkStack = item[AppDownloder.WaitForDownloadStack];
			var index = AppDownloder.isExistInArray(apkStack,downloadId);
			if(index === -1){
				return ;
			}
			apkStack.splice(index,1);
			var storage = {};
			storage[AppDownloder.WaitForDownloadStack]=apkStack;
			chrome.storage.local.set(storage);
		});
	}
}

//添加需要安装的任务到队列
Object.defineProperty(AppDownloder,"addApkToInstallStorge",{
	value:function(downloadId){
		 //判断是否为apk下载
		chrome.storage.local.get(AppDownloder.WaitForInstallStack,function(item){
			var apkStack = item[AppDownloder.WaitForInstallStack];
			var index  = AppDownloder.isExistInArray(apkStack,downloadId);
			if(index == -1){
				return;
			}
			//寻找下载文件信息
			chrome.downloads.search({id:downloadId}, function(items){
				console.log("下载完成:");
				console.log(items[0]);
			    	var item = items[0]
			    	chrome.storage.local.get(AppDownloder.WaitForInstallStack,function(stack){
				        var apkStack = stack.AppDownloder.WaitForInstallStack;
				        apkStack = apkStack ? apkStack : [];
				        apkStack.push(item);
				        var storage = {};
				        storage[stack.AppDownloder.WaitForInstallStack]  = apkStack
				        chrome.storage.local.set(storage);
			   	});
				AppDownloder.removeApkFormDownloadStorge(downloadId);
			});
		});
	}
});
