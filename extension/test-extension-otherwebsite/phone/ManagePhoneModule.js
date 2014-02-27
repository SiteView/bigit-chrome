//该Service与 插件通讯 。
angular.module('PhoneManageApp.services', [])
    .factory('phoneManageService',function(){ //手机管理服务
        //获取App列表
        var getAppList = function(){}
        //获取文件列表
        var getFileList = function(){}
        //获取App数量
        var getAppCount = function(){
            return 10;
        }
        //...  其他函数待定义
        return {
            'getAppList':getAppList,
            'getFileList':getFileList,
            'getAppCount':getAppCount
        }
    })
    .factory('phoneConnectService',function(){ //手机状态服务
        //获取手机连接状态
        var getPhoneConnectStatus = function(){ 
            //do something
            return false;
        }
        return {
            'getPhoneConnectStatus':getPhoneConnectStatus
        }
    });

//侧边栏的 小通知，如 应用数量等。dom click listener
var SideNavModule = angular.module('SideNavModule',['PhoneManageApp.services']);
SideNavModule.controller("SideNavModuleController",
	[
		'$scope',
        'phoneManageService',
        'navButtonActionService',
		function($scope,phoneManageService,navButtonActionService) {
        	$scope.appCounts = phoneManageService.getAppCount();
            $scope.navAction = navButtonActionService.navAction;
    	}
    ]);

SideNavModule.factory('navButtonActionService',function(){ //手机管理服务
    var SideNavAction = {
        "changeNavStyle":function(did){ // dom id
            did = "#"+did;
            $(did).parent().find(".active").removeClass('active');
            $(did).addClass('active');
        },
        "doNavigtion":function(did){
            SideNavAction.changeNavStyle(did);
            var action = did.replace("nav_","goto");
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
        "gotoMySms":function(){
            console.log("gotoMyMySms");
        },
        "gotoMyFiles":function(){
            console.log("gotoMyFiles");
        }
    };

    var navAction = function(domId){
        SideNavAction.doNavigtion(domId);
    }

    return {
        'navAction':navAction
    }
});

//连接手机的状态
var PhoneConnectStatusModule = angular.module('PhoneConnectStatusModule',['PhoneManageApp.services']);

PhoneConnectStatusModule.controller("PhoneConnectStatusModuleCtrl",
	[
		'$scope',
        'phoneConnectService',
		function($scope,phoneConnectService) {
        	$scope.status = phoneConnectService.getPhoneConnectStatus();
    	}
    ]);



var PhoneManageApp = angular.module('PhoneManageApp',[
    'PhoneConnectStatusModule',
    'SideNavModule',
    'ManagePhoneFilter']);

//自定义指令
PhoneManageApp.directive('bigitSidenavbar', function() { //侧边导航栏
        return {
            restrict: 'E',
            templateUrl: 'phone/ManagePhoneSideNavBar.html'
        };
    })
    .directive('bigitTopnavbar',function(){ //顶部导航栏
        return {
            restrict: 'E',
            templateUrl: 'phone/ManagePhoneTopNavBar.html'
        };
    });
