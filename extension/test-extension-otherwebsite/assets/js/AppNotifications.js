//消息提醒
var AppNotifications = function(){};

/*
chrome.notifications.onClosed.addListene
function testNotify(){
     var opt = {
        type: "basic",
        title: "Primary Title",
        message: "Primary message to display",
        iconUrl: "assets/images/icon_38.png"
      }
      
} */
Object.defineProperty(AppNotifications,"getOptions",{
	value:function(status,appName){
		var options = false;
		switch(status){
			case "success":
				options =  {
					type: "basic",
	        		title: "BIGIT app manager",
	        		message: appName+"安装成功",
	        		iconUrl: "assets/images/icon_38.png"
				};
				break;
			case "fail":
				options ={
					type: "basic",
	        		title: "BIGIT app manager",
	        		message: appName+"安装失败",
	        		iconUrl: "assets/images/icon_38.png"
				}
				break;
			case "connect":
				options ={
					type: "basic",
	        		title: "BIGIT app manager",
	        		message: "连接手机成功",
	        		iconUrl: "assets/images/icon_38.png"
				}
				break;
			case "disconnect":
				options ={
					type: "basic",
	        		title: "BIGIT app manager",
	        		message: "手机断开",
	        		iconUrl: "assets/images/icon_38.png"
				}
				break;
		}
		return options;
	}
});

Object.defineProperty(AppNotifications,"tip",{
	value:function(status,appName){
		var opt = AppNotifications.getOptions(status,appName);
		if(!opt)return;
		chrome.notifications.create("",opt ,function(a){console.log(a)} );
	}
});

Object.defineProperty(AppNotifications,"connect",{
	value:function(status){
		if(status){
			var opt = AppNotifications.getOptions("connect");
			
		}else{
			var opt = AppNotifications.getOptions("disconnect");
		}
		chrome.notifications.create("",opt ,function(a){console.log(a)} );
	}
})

