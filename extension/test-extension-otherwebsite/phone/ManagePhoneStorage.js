var ManagePhoneStorage = function(){}

//定义字符串常量：
Object.defineProperties(ManagePhoneStorage,{
	"AppList":{//等待下载的apk队列
		value:"_BIGIT_PhoneManage_AppList_"
	},
	"DeviceInfo":{//等待安装队列
		value:"_BIGIT_PhoneManage_DeviceInfo_"
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
Object.defineProperty(ManagePhoneStorage,"getAppList",{
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

Object.defineProperty(ManagePhoneStorage,"init",{
	value:function(){
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