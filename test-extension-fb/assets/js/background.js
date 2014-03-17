var PluginForPhone = function(){
    this.pluginId = "__AppPlugin";
    this.protoFilePath = 'phone.proto';
    this.plugin =  document.getElementById(this.pluginId); //获取plugin
    this.PhoneProtoBuilder =dcodeIO.ProtoBuf.loadProtoFile(this.protoFilePath).build('bigit');
};

PluginForPhone.prototype.getPlugin = function(){
    return this.plugin;
}
PluginForPhone.prototype.uninstall = function(appId,callback){
    var self = this;
    var command = "uninstall @appId";
    command = command.replace(/\@appId/,appId);
    var startTime = new Date().getTime();
    var flag = +self.plugin.DoUninstall(command);
    console.log("卸载耗时:"+(new Date().getTime() - startTime )/1000);
    console.log(flag);
    if(!callback){
        return flag; 
    }
    callback(flag);
}

PluginForPhone.prototype.getDeviceInfo = function(callback){
    var self = this;
    var result = self.plugin.GetDeviceInfo('');
    console.log("获取的设备信息是：");
    console.log(result)
    result = btoa(result);
        var message = self.PhoneProtoBuilder.DeviceInfo.decode64(result);
        console.log("获取的设备信息完成");
        if(!callback){
        return message; 
    }
    callback(message);
      /* */
}
//net.andchat

PluginForPhone.prototype.install = function(apkPath,callback){
    var self = this;
    var command = ' install "c://a.apk"';
   // command = command.replace("@apkPath@",apkPath);
    var startTime = new Date().getTime();
    //command = command.replace(/\\/g,"/");
//    console.log(command);
    var result = self.plugin.DoInstall(command);
    console.log(result);
    return;
    var flag = +result;
    console.log("安装耗时:"+(new Date().getTime() - startTime )/1000);
    if(flag){
        console.log("安装成功")
    }else{
        console.log("安装失败")
    }
    if(!callback){
        return flag; 
    }
    callback(flag);
}

/*
plugin.addEventListener('onResult',function(uuid,ret){console.log(uuid);console.log(ret)});
*/