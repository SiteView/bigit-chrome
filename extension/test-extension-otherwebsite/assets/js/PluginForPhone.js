var PluginForPhone = function(){
	this.pluginId = "__AppPlugin";
	this.protoFilePath = 'phone/phone.proto';
	this.plugin =  chrome.extension.getBackgroundPage().document.getElementById(this.pluginId); //获取plugin
	this.PhoneProtoBuilder =dcodeIO.ProtoBuf.loadProtoFile(this.protoFilePath).build('bigit');
};
/*
获取AppList
*/
PluginForPhone.prototype.getAppList = function(callback){
	var self = this;
	var message = self.plugin.GetAppList('');
	var result =  self.PhoneProtoBuilder.AppList.decode64(message);	
	var  appList = result && result.app ? result.app : [];
	if(!callback){
	    return appList;
	}
	callback(appList);
}
/*
    卸载应用
    appid：应用id  必须
    callback：回调函数，接受一个参数 0或1，表示卸载是否成功 。可选
    若 callback 不存在，则函数返回 卸载标志，否则不返回。
*/
PluginForPhone.prototype.uninstall = function(appId,callback){
	var self = this;
	var command = "uninstall @appId";
	command = command.replace(/\@appId/,appId);
	var flag = self.plugin.DoUninstall(command);
	if(!callback){
	    return flag; 
	}
	callback(flag);
}

/**
安装应用*/
PluginForPhone.prototype.install = function(apkPath,callback){
	var self = this;
	var command = ' install "@apkPath@"';
	command = command.replace("@apkPath@",apkPath);
	command = command.replace(/\\/g,"/");
	console.log(command);
	var uuid = self.plugin.DoInstall(command);
	console.log(uuid);
	if(!callback){
	    return uuid; 
	}
	callback(uuid);
}

/**
获取设备信息
*/
PluginForPhone.prototype.getDeviceInfo = function(callback){
	var self = this;
	var result = self.plugin.GetDeviceInfo('');
       	result = btoa(result);
        	var message = self.PhoneProtoBuilder.DeviceInfo.decode64(result);
        	if(!callback){
	    return message; 
	}
	callback(message);
}

//获取文件列表 默认为根目录 /sdcard
PluginForPhone.prototype.getFilelist  = function(path){
	var self =this;
	if(!path){
		path = "";
	}
	var result = self.plugin.GetFilelist(path);
	return self.PhoneProtoBuilder.FileList.decode64(result)
}

//GetPictureList
PluginForPhone.prototype.getPictureList = function(){
	var result = self.plugin.GetPictureList(path);
	return self.PhoneProtoBuilder.ResList.decode64(result)
}

//GetVideoList
PluginForPhone.prototype.getVideoList = function(){
	var result = self.plugin.GetVideoList(path);
	return self.PhoneProtoBuilder.ResList.decode64(result)
}

//GetMusicList
PluginForPhone.prototype.getMusicList = function(){
	var result = self.plugin.GetVideoList(path);
	return self.PhoneProtoBuilder.ResList.decode64(result)
}
//PushFile(const std::string& localFile,const std::string& remoteFile);
PluginForPhone.prototype.pushFile = function(localFile,remoteFile){
	var result = self.plugin.PushFile(localFile,remoteFile); 
	console.log(result);
}

//PullFile(const std::string& remoteFile,const std::string& localFile);
PluginForPhone.prototype.pushFile = function(remoteFile,localFile){
	var result = self.plugin.PullFile(remoteFile,localFile); 
	console.log(result);
}
//GetStorageInfo(const std::string& arg);
PluginForPhone.prototype.getStorageInfo = function(){
	var result = self.plugin.GetStorageInfo('');
	return self.PhoneProtoBuilder.StorageInfo.decode64(result)
}


//检查连接usb连接状态 连接 1 ，未连接 0
PluginForPhone.prototype.checkDeviceStatus = function(callback){
	var self = this;
	return self.plugin.CheckDevice('');
}

//检查app列表是否已经完成 完成 1 ，否则 0
PluginForPhone.prototype.checkAppListPrepareStatus = function(callback){
	return this.plugin.CheckApplist('');
}
