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
	var flag = self.plugin.DoUninstall("");
	if(!callback){
	    return flag; 
	}
	callback(flag);
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