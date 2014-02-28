function createContextMenu(){
	console.log("create context menus");
	
	//创建菜单
	var context = "selection";
	var id = chrome.contextMenus.create({
		"title":"Search",
		"id":"searchId",
		"contexts":[context]
	});
	
	chrome.contextMenus.create({
		"title":"Search baidu",
		"id":"s1",
		"parentId":id,
		"contexts":[context],
		"onclick":onClickMenu
	});
	chrome.contextMenus.create({
		"title":"Search APK",
		"id":"s2",
		"parentId":id,
		"contexts":[context],
		"onclick":onClickMenu
	});
}

function onClickMenu(info, tab){
	var url = "";
	var searchId = info.menuItemId;
	console.log(searchId);
	if(searchId == "s1"){
		url = "http://www.baidu.com/s?wd="+info.selectionText;
	}else if(searchId == "s2"){
		url = "http://www.sogou.com/web?query="+info.selectionText;
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
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
		console.log("request is :");
		console.log(request);
		
		if (request.cmd == 'encode_text')
		{
			sendResponse(urlEncode(request.text));
		}
		if(request.order == "get_options"){
			sendResponse({reponse:"good"});
		}
	});
}

init();