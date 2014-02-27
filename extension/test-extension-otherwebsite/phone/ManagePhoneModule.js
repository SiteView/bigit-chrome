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

//侧边栏的 小通知，如 应用数量等。
var SideNavModule = angular.module('SideNavModule',['PhoneManageApp.services']);
SideNavModule.controller("SideNavModuleController",
	[
		'$scope',
        'phoneManageService',
		function($scope,phoneManageService) {
        	$scope.appCounts = phoneManageService.getAppCount();
    	}
    ]);

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



var PhoneManageApp = angular.module('PhoneManageApp',['PhoneConnectStatusModule','SideNavModule','ManagePhoneFilter']);