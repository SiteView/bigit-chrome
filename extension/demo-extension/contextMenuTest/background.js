var menulist = [{"name":"Search \"%s\"","id":"searchWord","contexts":"selection","searchKinds":[
		{"title":"Search baidu","id":"searchbaidu","contexts":"selection",},
		{"title":"Search APK","id":"searchapk","contexts":"selection",}
		]},
		{"name":"Search image","id":"searchImg","contexts":"image","searchKinds":[
		{"title":"download to phones","id":"downloadImg","contexts":"image",},
		{"title":"show on DLNA","id":"showWlan","contexts":"image",},
		{"title":"save to 私有云","id":"savetocloud","contexts":"image",}
		]},
		{"name":"Search url","id":"searchUrl","contexts":"link","searchKinds":[]},
]

function createContextMenu(){
	console.log("create context menus");
	
	//创建菜单
	
	for(var i = 0;i < menulist.length;i++){
		var menus = menulist[i];
		//console.log(menus);
		var id = "";
		if(menus.searchKinds.length != 0){
			console.log("for kinds");
			id = chrome.contextMenus.create({
				"title":menus.name,
				"id":menus.id,
				"contexts":[menus.contexts]
			});
			for(var j = 0;j < menus.searchKinds.length;j++){
				var menukind = menus.searchKinds[j];
				var t = chrome.contextMenus.create({
					"title":menukind.title,
					"id":menukind.id,
					"parentId":id,
					"contexts":[menukind.contexts],
					"onclick":onClickMenu
				});
			}
		}else{
			 chrome.contextMenus.create({
				"title":menus.name,
				"id":menus.id,
				"contexts":[menus.contexts],
				"onclick":onClickMenu
			});
		}
		
	}
}

function onClickMenu(info, tab){
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

function deleteContextMenu(){
	chrome.contextMenus.removeAll();
}

//初始化
function init(){
	deleteContextMenu();
	createContextMenu();
	console.log("test");
	// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
		// console.log("request is :");
		// console.log(request);
		
		// if(request.order == "get_options"){
			// sendResponse({reponse:"good"});
		// }
	// });
}

init();