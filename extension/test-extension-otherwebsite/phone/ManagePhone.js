//侧边导航栏事件处理
var SideNavAction = {
	"changeNavStyle":function(did){ // dom id
		did = "#"+did;
		$(did).parent().find(".active").removeClass('active');
		$(did).addClass('active');
	},
	"doNavigtion":function(e){ //
		var did = e.currentTarget.id;
		SideNavAction.changeNavStyle(did);
		var action = did.replace("nav_","goto")
		SideNavAction[action]();
	},
	"gotoHome":function(){
		console.log("gotoHome");
	},
	"gotoAppStore":function(){
		console.log("gotoAppStore");
	},
	"gotoMyApp":function(){
		console.log("gotoMyApp");
	},
	"gotoMyContacts":function(){
		console.log("gotoMyContacts");
	},
	"gotoMyMusic":function(){
		console.log("gotoMyMusic");
	},
	"gotoMyPictures":function(){
		console.log("gotoMyPictures");
	},
	"gotoMyVideo":function(){
		console.log("gotoMyVideo");
	},
	"gotoMyMySms":function(){
		console.log("gotoMyMySms");
	},
	"gotoMyFiles":function(){
		console.log("gotoMyFiles");
	}
};


//初始化 侧边导航栏 监听事件
var __initSideNavLisenter = function(){
	$("ul#side_nav li").each(function(){
		$(this).click(SideNavAction.doNavigtion);
	});
}

//初始化
var __initLisenter = function(){
	__initSideNavLisenter();
}

$(function(){
	__initLisenter();
});
