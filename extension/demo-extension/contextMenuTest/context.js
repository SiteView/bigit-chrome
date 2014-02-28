//划词

//首先创建搜索菜单
var contextMenuId = "menu_id";

function createContextMenus(x, y){
	//获取选中的文本
	var text = document.getSelection.toString();
	if(text == ""){
		return;
	}
	
	//传送消息请求
	chrome.runtime.sendMessage({order:"encode_text",text:text},function(encText){
		console.log(encText);
		
		//创建菜单Div
		var contextMenu = document.createElement("div");
		contextMenu.id = contextMenuId;
		contextMenu.align = left;
		with(contextMenu.style){
			position = "absolute";
			left = x + "px";
			top = (y + menuOffset) + "px";
			zIndex = 0xffffffff;
			backgroundColor = "#F6F6F6";
			border = "1px solid #666";
			padding = "4px";
			lineHeight = "normal";
		}
		document.body.appendChild(contextMenu);
	});
}

document.addEventListener("mouseup",function(){
	//处理鼠标左键
	console.log("mouseup----------------");
	console.log(contextMenuId);
	var contextMenu = document.getElementById(contextMenuId);
	console.log(contextMenu);
	if(event.botton != 0){
		if(contextMenu){
			document.body.removeChild(contextMenu);
		}
		return;
	}
	
	//鼠标点击的坐标位置
	var x = event.pageX;
	var y = event.pageY;
	console.log(contextMenu);
	if(contextMenu){
		if(x >= contextMenu.offserLeft && x <= (contextMenu.offsetLeft + contextMenu.offsetWidth)
		   && y >= contextMenu.offsetTop && y <= (contextMenu.offsetTop + contextMenu.offsetHeight) )
		{
			// 如果鼠标在菜单中点击，则等待click事件处理
			return;
		}
		else
		{
			document.body.removeClild(contextMenu);
		}
	}
	console.log("6666");
	chrome.runtime.sendMessage({order:"get_options"},function(options){
		console.log("88888888888");
		console.log(options);
		createContextMenus(x, y);
	});
}, false);