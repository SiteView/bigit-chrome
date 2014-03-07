(function(){
var ContextMenuBuilder = function(){};

Object.defineProperty(ContextMenuBuilder,"menulist",{
	value: [
		{"name":"Search \"%s\"","id":"searchWord","contexts":"selection",
			"searchKinds":[
				{"title":"Search baidu","id":"searchbaidu","contexts":"selection"},
				{"title":"Search APK","id":"searchapk","contexts":"selection"}
			]
		},
		{"name":"Send image to","id":"searchImg","contexts":"image",
			"searchKinds":[
				{"title":"Phone","id":"downloadImg","contexts":"image"},
				{"title":"DLNA","id":"showWlan","contexts":"image"},
				{"title":"Personal","id":"savetocloud","contexts":"image"}
			]
		},
		{"name":"Share URL  to ","id":"searchUrl","contexts":"link","searchKinds":[]}
	]
});

Object.defineProperty(ContextMenuBuilder,'onClickMenu',{
	value:function(info, tab){
		var url = "";
		var searchId = info.menuItemId;
		console.log(searchId);
		if(searchId == "searchbaidu"){
			url = "http://www.baidu.com/s?wd="+info.selectionText;
		}else if(searchId == "searchapk"){
			url = "https://play.google.com/store/search?q="+info.selectionText;
		}else if(searchId == "searchUrl"){
			//console.log("search url");
			//console.log(info.linkUrl);
			url = info.linkUrl;
		}else{
			return;	
		}
		chrome.tabs.create({"url":url,"index":tab.index + 1});
	}
});

Object.defineProperty(ContextMenuBuilder,"createContextMenu",{
	value:function(){
		console.log("create context menus");
		var menulist = ContextMenuBuilder.menulist;
		var onClickMenu = ContextMenuBuilder.onClickMenu;
		//创建菜单
		for(var i = 0;i < menulist.length;i++){
			var menus = menulist[i];
			//console.log(menus);
			var id = "";
			var menusKindsLength = menus.searchKinds.length;
			if(!menusKindsLength){
				chrome.contextMenus.create({
					"title":menus.name,
					"id":menus.id,
					"contexts":[menus.contexts],
					"onclick":onClickMenu
				});
				break;	
			}
			console.log("for kinds");
			id = chrome.contextMenus.create({
				"title":menus.name,
				"id":menus.id,
				"contexts":[menus.contexts]
			});
			for(var j = 0;j < menusKindsLength;j++){
				var menukind = menus.searchKinds[j];
				var t = chrome.contextMenus.create({
					"title":menukind.title,
					"id":menukind.id,
					"parentId":id,
					"contexts":[menukind.contexts],
					"onclick":onClickMenu
				});
			}	
		}
	}
})

Object.defineProperty(ContextMenuBuilder,"init",{
	value:function(){
		chrome.contextMenus.removeAll();
		ContextMenuBuilder.createContextMenu();
		console.log("test");
		// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
			// console.log("request is :");
			// console.log(request);	
			// if(request.order == "get_options"){
				// sendResponse({reponse:"good"});
			// }
		// });
	}
});
ContextMenuBuilder.init();

})();