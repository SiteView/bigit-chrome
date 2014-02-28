//该Service与 插件通讯 。
angular.module('PhoneManageApp.services', [])
    .factory('phoneManageService',function(){ //手机管理服务
        var appCount = 10;
        //获取App列表
        var getAppList = function(){}
        //获取文件列表
        var getFileList = function(){}
        //获取App数量
        var getAppCount = function(){
            return appCount;
        }
        //
        var setAppCount = function(num){
            console.log('setAppCount' + num);
            appCount = num;
        }
        //...  其他函数待定义
        return {
            'getAppList':getAppList,
            'getFileList':getFileList,
            'getAppCount':getAppCount,
            'setAppCount':setAppCount
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

//应用管理
var AppsManagerModule = angular.module('AppsManagerModule',['PhoneManageApp.services']);
AppsManagerModule.controller("AppsManagerModuleCtrl",
    [
        '$scope',
        'phoneManageService',
        function($scope,phoneManageService) {
            $scope.delete = function(){
                console.log(123);
                phoneManageService.setAppCount(phoneManageService.getAppCount()-1);
            } 
        }
    ]);

//侧边栏的 小通知，如 应用数量等。dom click listener
var SideNavModule = angular.module('SideNavModule',['PhoneManageApp.services','ngRoute','AppsManagerModule']);
SideNavModule.controller("SideNavModuleController",
	[
		'$scope',
        'phoneManageService',
        'navButtonActionService',
		function($scope,phoneManageService,navButtonActionService) {
        	$scope.appCounts = phoneManageService.getAppCount();
            $scope.changeNavStyle = navButtonActionService.changeNavStyle;
    	}
    ]);

SideNavModule.factory('navButtonActionService',function(){ //手机管理服务
    var changeNavStyle = function(e){
        $(e.currentTarget).parent().find(".active").removeClass('active');
        $(e.currentTarget).addClass('active');
    }
    return {'changeNavStyle':changeNavStyle};
});

SideNavModule.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider
        .when('/MyApps/:appId', {
            templateUrl: 'phone/MyApps.html'
            ,controller: 'AppsManagerModuleCtrl'
        })
        .when('/MyFiles', {
            templateUrl: 'phone/MyFiles.html'
        })
  }]);

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
