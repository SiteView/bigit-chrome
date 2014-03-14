var ManagePhoneStorage = function(){}

//定义字符串常量：
Object.defineProperties(ManagePhoneStorage,{
	"AppList":{//等待下载的apk队列
		value:"_BIGIT_PhoneManage_AppList_"
	},
	"DeviceInfo":{//等待安装队列
		value:"_BIGIT_PhoneManage_DeviceInfo_"
	},
	"WaitForUninstallStack":{ //等待卸载的队列
		value:"_BIGIT_PHONEMANAGE_WaitForUninstallStack_"
	},
	"FlagForIsUninstalling":{ //正在卸载的标志
		value:"_BIGIT_PHONEMANAGE_FlagForIsUninstalling"
	}
});

Object.defineProperty(ManagePhoneStorage,"clearAll",{
	value:function(){
		AppNotifications.connect(false);
		var storage = {};
		storage[ManagePhoneStorage.AppList] = [];
		storage[ManagePhoneStorage.DeviceInfo] = [];
		chrome.storage.local.set(storage);
	}
});

Object.defineProperty(ManagePhoneStorage,"saveAppList",{
	value:function(appList){
		var storage = {};
		storage[ManagePhoneStorage.AppList] = appList;
		chrome.storage.local.set(storage);
	}
});

Object.defineProperty(ManagePhoneStorage,"getAppListFormStorage",{
	value:function(callback){
		chrome.storage.local.get(ManagePhoneStorage.AppList,function(item){
			var list = ManagePhoneStorage.AppList in item ? item[ManagePhoneStorage.AppList] : [];
			callback(list)
		});
	}
});

Object.defineProperty(ManagePhoneStorage,"saveDeviceInfo",{
	value:function(deviceInfo){
		AppNotifications.connect(true);
		var storage = {};
		storage[ManagePhoneStorage.DeviceInfo] = deviceInfo;
		chrome.storage.local.set(storage);
	}
});

Object.defineProperty(ManagePhoneStorage,"getDeviceInfo",{
	value:function(callback){
		chrome.storage.local.get(ManagePhoneStorage.DeviceInfo,function(item){
			var info = ManagePhoneStorage.DeviceInfo in item ? item[ManagePhoneStorage.DeviceInfo] : null;
			callback(info)
		});
	}
});
//刷新设备包括设备信息和设备上的应用列表
//只有当手机处于连接状态时，此方法才会执行。
Object.defineProperty(ManagePhoneStorage,'refreshDevice',{
	value:function(){
		var plugin = new PluginForPhone();
		var checkDeviceStatus  = +plugin.checkDeviceStatus(); 
		var checkAppListPrepareStatus = +plugin.checkAppListPrepareStatus(); 
		if(checkDeviceStatus && checkAppListPrepareStatus){
			var list = plugin.getAppList();
			ManagePhoneStorage.saveAppList(list);
			var deviceInfo = plugin.getDeviceInfo();
			ManagePhoneStorage.saveDeviceInfo(deviceInfo);
		}
	}
});
//刷新设备应用列表
Object.defineProperty(ManagePhoneStorage,'refreshAppList',{
	value:function(){
		var plugin = new PluginForPhone();
		console.log("执行 刷新 手机应用");
		var checkAppListPrepareStatus = +plugin.checkAppListPrepareStatus(); 
		if( checkAppListPrepareStatus){
			var list = plugin.getAppList();
			console.log(list.length);
			ManagePhoneStorage.saveAppList(list);
		}
	}
});

Object.defineProperty(ManagePhoneStorage,"init",{
	value:function(){
		//初始化卸载标志位
		ManagePhoneStorage.setFlagForIsUninstalling(false);

		var plugin = new PluginForPhone();
		var flag = 0;
		var refreshTime = 2*1000; //刷新时间
		var checkAppListPrepareStatus = function(){
			var status = +plugin.checkAppListPrepareStatus();//转string 0为 number 0
			if(!status){
				setTimeout(checkAppListPrepareStatus,500);
				return;
			}
			var list = plugin.getAppList();
			ManagePhoneStorage.saveAppList(list);
		}
		var checkPhoneConnectStatus = function(){
			var status  = +plugin.checkDeviceStatus(); //转string 0为 number 0
			//如果两次状态相同
			if(flag === status){
				setTimeout(checkPhoneConnectStatus,refreshTime);
				return;
			}
			//两次状态不同，则usb连接或断开
			flag = status; //记录本次usb状态

			if(!status){ //如果连接 -> 断开 状态，清空本地数据
				console.log("usb disconnect");
				ManagePhoneStorage.clearAll();
			}else{ //断开 -> 连接状态，设置本地数据
				var deviceInfo = plugin.getDeviceInfo();
				ManagePhoneStorage.saveDeviceInfo(deviceInfo);
				checkAppListPrepareStatus();
			}
			setTimeout(checkPhoneConnectStatus,refreshTime)
		};
		checkPhoneConnectStatus();
	}
})

//移除已经删除的app
Object.defineProperty(ManagePhoneStorage,'removeAppFromAppList',{
	value:function(appId){
		ManagePhoneStorage.getAppListFormStorage(function(list){
			var length = list.length;
			for(var i = 0 ; i < length ; i ++){
				var  app = list[i];
				if(app.id == appId){
					list.splice(i,1);
					break;
				}
			}
			if(list.length == length){
				return;
			}
			ManagePhoneStorage.saveAppList(list);
		});

	}
});
//设置卸载堆栈
Object.defineProperty(ManagePhoneStorage,"setStackToUninstallStack",{
	value:function(list){
		var storage = {};
		storage[ManagePhoneStorage.WaitForUninstallStack] = list;
		chrome.storage.local.set(storage);
	}
});
//添加app到 卸载堆栈
Object.defineProperty(ManagePhoneStorage,"addAppToUninstallStack",{
	value:function(appid){
		ManagePhoneStorage.getAppUninstallStack(function(list){
			list.push(appid);
			ManagePhoneStorage.setStackToUninstallStack(list);
		});
	}
});

//赋值卸载堆栈
Object.defineProperty(ManagePhoneStorage,"setAppUninstallStack",{
	value:function(list){
		var storage = {};
		storage[ManagePhoneStorage.WaitForUninstallStack] = list;
		chrome.storage.local.set(storage);
	}
})

//获取卸载队列
Object.defineProperty(ManagePhoneStorage,"getAppUninstallStack",{
	value:function(callback){
		chrome.storage.local.get(ManagePhoneStorage.WaitForUninstallStack,function(item){
                		var stack = ManagePhoneStorage.WaitForUninstallStack in item 
                			? item[ManagePhoneStorage.WaitForUninstallStack]
                			 : [];
                		callback(stack);
              	});
	}
})

//设置正在卸载的标志位
Object.defineProperty(ManagePhoneStorage,'setFlagForIsUninstalling',{
	value:function(flag){
		var storage = {};
		storage[ManagePhoneStorage.FlagForIsUninstalling] = !!flag;
		chrome.storage.local.set(storage);
	}
});

//获取正在卸载的标志位
Object.defineProperty(ManagePhoneStorage,'getFlagForIsUninstalling',{
	value:function(callback){
		chrome.storage.local.get(ManagePhoneStorage.FlagForIsUninstalling,function(item){
			var flag =  ManagePhoneStorage.FlagForIsUninstalling in item 
				? item[ManagePhoneStorage.FlagForIsUninstalling] 
				: false;
			callback(flag);
		})
	}
});

Object.defineProperty(ManagePhoneStorage,"uninstall",{
	value:function(){
		ManagePhoneStorage.getFlagForIsUninstalling(function(flag){
			if(flag){ // //如果有应用正在卸载，则等待。
				return;
			}
			ManagePhoneStorage.getAppUninstallStack(function(stack){
				if(!stack || !stack.length){//如果卸载堆栈为空。则重置标志位为未卸载状态
					ManagePhoneStorage.setFlagForIsUninstalling(false);
					return;
				}
				 //提取一个卸载的id
				var unistallAppid = stack.pop();
				console.log("pop appid is " + unistallAppid);
				//调用插件进行卸载
				ManagePhoneStorage.setFlagForIsUninstalling(true);//设置标志位为卸载状态
				var plugin = new PluginForPhone();
				plugin.uninstall(unistallAppid,function(uninstallSuccess){
					if(!uninstallSuccess){
						console.log("卸载失败");
					}else{
						ManagePhoneStorage.removeAppFromAppList(unistallAppid);//移除应用列表队列
					}
					ManagePhoneStorage.setFlagForIsUninstalling(false);//设置标志位为未卸载状态
					ManagePhoneStorage.setAppUninstallStack(stack);//设置卸载队列    
				});
			});
		});
	}
});