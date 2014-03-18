/**
整体安装流程如下：
	1.backgroup.js检测到app下载事件，将下载id 传给 AppDownloader
	2.AppDownloader将下载Id 存储添加 到本地数据仓库 中WaitForDownloadStack的队列
	
	3. 利用浏览器下载任务完成的事件通知，将下载完成后的apk 添加到 本地数据仓库 中 WaitForInstallStack
	 的队列。（需要判断这个任务是否属于apk下载任务）
	4 -1. 利用本地数据仓库 值变化时 触发的事件onchange事件 监听 WaitForInstallStack的数值变化。
	一旦发生变化，则启动 安装进程（pop出一个安装文件）。这里涉及到一个是否正在安装的标志位
	4-2. 本地数据仓库中的FlagForApkInstalling数值变化时 也启动安装进程

	5.安装完成后使用 ManagePhoneStorage.js的refreshAppList 刷新应用列表
*/

var AppDownloader = function(){};
//定义字符串常量：
Object.defineProperties(AppDownloader,{
	"WaitForDownloadStack":{//等待下载的apk队列
		value:"_apkWaitForDownloadStack_"
	},
	"WaitForInstallStack":{//等待安装队列
		value:"_apkWaitForInstallStack_"
	},
	"FlagForApkInstalling":{//正在安装应用的标志
		value:"_flagForApkInstalling_"
	},
	'InstallingApk':{//正在安装的队列
		value:"_apkInstallingApk_"
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

//通过 callback 获取下载的队列
Object.defineProperty(AppDownloader,"getApkDownloadStorage",{
	value:function(callback){
		chrome.storage.local.get(AppDownloader.WaitForDownloadStack,function(storage){
			var stack = AppDownloader.WaitForDownloadStack in storage 
						?  storage[AppDownloader.WaitForDownloadStack]
						:  [];
			callback(stack)
		});
	}
});

//设置 下载任务堆栈
Object.defineProperty(AppDownloader,"setStackToDownloadStorage",{
	value:function(stack){
		var storage = {};
		storage[AppDownloader.WaitForDownloadStack]=stack;
		chrome.storage.local.set(storage);
	}
});

//添加等待下载的任务
Object.defineProperty(AppDownloader,"addApkToDownloadStorage",{
	value:function(downloadId){
		AppDownloader.getApkDownloadStorage(function(apkStack){
			apkStack.push(downloadId);
			AppDownloader.setStackToDownloadStorage(apkStack);
		});
	}
});

///下载完成后 需要删除等待下载的任务 
Object.defineProperty(AppDownloader,"removeApkFormDownloadStorage",{
	value:function(downloadId){
		AppDownloader.getApkDownloadStorage(function(apkStack){
			var index = AppDownloader.isExistInArray(apkStack,downloadId);
			if(index === -1){
				return ;
			}
			apkStack.splice(index,1);
			AppDownloader.setStackToDownloadStorage(apkStack);
		});

	}
});

//清空安装队列
Object.defineProperty(AppDownloader,"clearApkToInstallStorage",{
	value:function(){
		var storage = {};
		storage[AppDownloader.WaitForInstallStack] = [];
		chrome.storage.local.set(storage);
	}
});

//设置 安装任务堆栈
Object.defineProperty(AppDownloader,"setStackToInstallStorage",{
	value:function(stack,callback){
		var storage = {};
		storage[AppDownloader.WaitForInstallStack]=stack;
		chrome.storage.local.set(storage,function(){
			callback && callback();
		});
	}
});
//获取 安装任务堆栈
Object.defineProperty(AppDownloader,"getApkInstallStorage",{
	value:function(callback){
		chrome.storage.local.get(AppDownloader.WaitForInstallStack,function(storage){
	    		var stack  = AppDownloader.WaitForInstallStack in storage
	    				? storage[ AppDownloader.WaitForInstallStack]
	    				:  []
	    		callback(stack);
		});
	}
})

//下载完成后 添加需要安装的任务到队列
Object.defineProperty(AppDownloader,"addApkToInstallStorage",{
	value:function(downloadId){
		AppDownloader.getApkDownloadStorage(function(apkStack){
			//判断是否下载文件 是否在下载队列
			var index  = AppDownloader.isExistInArray(apkStack,downloadId);
			if(index == -1){
				return;
			}
			//添加到安装队列
			AppDownloader.getApkInstallStorage(function(installStack){
				installStack.push(downloadId);
				AppDownloader.setStackToInstallStorage(installStack);
				AppDownloader.removeApkFormDownloadStorage(downloadId);
			});
		});
	}
});

//移除某个安装任务
Object.defineProperty(AppDownloader,"removeApkFormInstallStorage",{
	value:function(downloadId,callback){
		AppDownloader.getApkInstallStorage(function(stack){
			for(var i = 0; i < stack.length;i++){
				if(downloadId == stack[i]){
					stack.splice(i,1);
					console.log("removeApkFormInstallStorage: stack[i]" + stack[i]+"=="+ downloadId);
					AppDownloader.setStackToInstallStorage(stack,callback);
					break;
				}
			}
		});
	}
});



//获取正在安装的任务队列
Object.defineProperty(AppDownloader,"getInstallingApk",{
	value:function(callback){
		chrome.storage.local.get(AppDownloader.InstallingApk,function(storage){
	    		var apk  = AppDownloader.InstallingApk in storage
	    				? storage[ AppDownloader.InstallingApk]
	    				:  {}
	    		callback(apk);
		});
	}
});

//添加任务到正在安装队列
Object.defineProperty(AppDownloader,"setInstallingApk",{
	value:function(apk){
		var storage = {};
		storage[AppDownloader.InstallingApk] = apk;
		
		chrome.storage.local.set(storage);
	}
});

//某个安装任务完成
Object.defineProperty(AppDownloader,"finishApkInstall",{
	value:function(uuid,flag){
		AppDownloader.getInstallingApk(function(item){
			if(uuid != item.uuid){
				return;
			}
			//2. 将uuid关联的fileId 移出等待安装的installStorage队列
			AppDownloader.removeApkFormInstallStorage(item.fileId,function(){
				AppDownloader.setFlagForApkInstalling(false);//非安装
				console.log("finish install  :");
				console.log(item);
				//3.刷新应用列表
				if(flag){
					ManagePhoneStorage.refreshAppList();
					AppNotifications.tip("success",item.filename);
				}else{
					AppNotifications.tip("fail",item.filename)
				}
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

//设置 安装标志
Object.defineProperty(AppDownloader,"setFlagForApkInstalling",{
	value:function(flag){
		var storage = {};
		storage[AppDownloader.FlagForApkInstalling] = !!flag;
		chrome.storage.local.set(storage);
	}
});
//获取安装标志
Object.defineProperty(AppDownloader,"getFlagForApkInstalling",{
	value:function(callback){
		chrome.storage.local.get(AppDownloader.FlagForApkInstalling,function(item){
			var flag =  AppDownloader.FlagForApkInstalling in item 
					? item[AppDownloader.FlagForApkInstalling]
					:  false;
			callback(flag);
		});
	}
});

//安装app
Object.defineProperty(AppDownloader,"installApp",{
	value:function(){
		//第1步 判断当前安装状态，是否有应用正在安装
		AppDownloader.getFlagForApkInstalling(function(flag){
			if(flag){//如果有正在安装 这不进行下续操作
				return;
			}
			//第2步 拿到等待安装app队列
			AppDownloader.getApkInstallStorage(function(stack){
				//如果安装队列不存在
				if(!stack || !stack.length){
					AppDownloader.setFlagForApkInstalling(false);//非安装
					return;
				}
				AppDownloader.setFlagForApkInstalling(true);//正在安装
				var downloadFileId = stack.pop(); //拿到一个安装文件
				//寻找下载文件信息
				chrome.downloads.search({id:downloadFileId}, function(items){
					console.log("正在安装的文件是:");
					var item = items[0];
					console.log(items[0]);
					//if(!item.exists)console.log(item.filename);
					//如果安装文件不存在  安装结束，报错
					if(!item || !item.exists){
						AppDownloader.setFlagForApkInstalling(false);//非安装
						AppDownloader.setStackToInstallStorage(stack);//设置安装队列
						console.log("安装文件不存在");
						AppNotifications.tip("fail","文件不存在，");
						return;
					}
					var plugin = new PluginForPhone();
					var uuid = plugin.install(item.filename);
					AppDownloader.setInstallingApk({
						uuid:uuid,
						filename:item.filename,
						fileId:item.id
					});
				});
	   		});
	    	});

		
	}
});
/*
*下载完成： data{endTime:{current:"200--xxx"},id:xxx,state:{current:"complete"}}
下载终止：data{canResume:{current:false},id:"",error}
*/
chrome.downloads.onChanged.addListener(function(data){
        //下载完成
        if(data && data.endTime && data.state && data.state.current == "complete"){
            AppDownloader.addApkToInstallStorage(data.id); //保存到安装队列
        }else if(data.canResume && data.canResume.current && data.error){ //下载失败
            AppDownloader.removeApkFormDownloadStorage(data.id);
        }
});

chrome.storage.onChanged.addListener(function(changes,areaname){
	if(areaname != "local" ){
		return;
	}
	//当安装队列发生变化时才进行app安装
	if(changes[AppDownloader.WaitForInstallStack]){
		AppDownloader.installApp();
	}
	//当安装标志为变化时尝试安装App
	if(changes[AppDownloader.FlagForApkInstalling]){
		var newValue = changes[AppDownloader.FlagForApkInstalling].newValue;
		var oldValue = changes[AppDownloader.FlagForApkInstalling].oldValue;
		if(newValue != oldValue){
			AppDownloader.installApp();
		}
	}
});

AppDownloader.initLocalStorage();