// 插件
var AppPluginServices = angular.module('AppPlugin.services', []);

AppPluginServices.factory('appPluginService',function(){
    var plugin = chrome.extension.getBackgroundPage().document.getElementById("AppPlugin"); //获取plugin
    var getPlugin = function(){
        return plugin;
    }
    // Initialize ProtoBuf.js
    var ProtoBuf = dcodeIO.ProtoBuf;
    var PhoneProtoBuilder = ProtoBuf.loadProtoFile("phone/phone.proto");
   
    var testPlugin = function(){
        // console.log( plugin.GetDeviceInfo("shell ls   /storage/sdcard0").toString());
        var AppListMessage = PhoneProtoBuilder.build('bigit');
       
       // var message = plugin.DoTest('');
      // var message = plugin.GetDeviceInfo('');
        var message = plugin.GetAppList('');

        console.log('message is:');
        console.log(message);
        console.log('builder is: ');
        // console.log(encodeURIComponent(message))
        //   return;encodeURIComponent(message)
        message = btoa(message);
        var msg = AppListMessage.AppList.decode64(message);
        //    var msg = AppListMessage.test.decode64(message);
        //var msg = AppListMessage.DeviceInfo.decode64(message);
        console.log('decode message  is:');
        console.log(msg);
    }
    /* */
    return {
        'testPlugin':testPlugin,
        'getPlugin':getPlugin
    }
});

//该Service与 插件Service通讯 。
angular.module('PhoneManageApp.services', ['AppPlugin.services'])
    .factory('phoneManageService',['appPluginService',function(appPluginService){ //手机管理服务
        var appPlugin = appPluginService.getPlugin();//app插件
        
        var appsCount = 0; //app数量
        var appList = []; //app列表
        var service = {};
        //获取App列表
        var getAppList = function(){
            //appPlugin do some thing
            return appList;
        }
        //获取文件列表
        var getFileList = function(){
            //appPlugin do some thing
        }
        //获取App数量
        var getAppCount = function(){
            // appPlugin do some thing
            return appsCount;
        }

        //获取一个app信息
        var getAppDetail = function(appId){
            //test
            return {
                appId:appId,
                appName:appId+"_test"
            }
        }

        //卸载app
        var uninstall  = function(appId){
            //模拟卸载arrayObject.splice(index,howmany
            for(var index = 0; index < appList.length; index++ ){
                var app = appList[index];
                if(app.id == appId){
                    appList.splice(index,1);
                    break;
                }
            }
        }
        //测试添加
        var addTest = function(){
            appList.push({
                "id":"4",
                "name":"app_4", 
                "version":"0.4", 
                "size":"100", 
                "location":"sdcard", 
                "icodata":"6"
            });
        }

        var _init = function(){
            appPluginService.testPlugin();
            appList = [
                {
                    "id":"1",
                    "name":"app_1", 
                    "version":"0.1", 
                    "size":"100", 
                    "location":"sdcard", 
                    "icodata":"6"
                },
                {
                    "id":"2",
                    "name":"app_2", 
                    "version":"0.1", 
                    "size":"100", 
                    "location":"sdcard", 
                    "icodata":"6"
                },
                {
                    "id":"3",
                    "name":"app_3", 
                    "version":"1.4", 
                    "size":"100", 
                    "location":"sdcard", 
                    "icodata":"6"
                }
            ];
            //appsCount = appList.length;
        }
        _init();
        service = {
            'getAppList':getAppList,
            'getAppDetail':getAppDetail,
            'getFileList':getFileList,
            'getAppCount':getAppCount,
            'uninstall':uninstall,
            'appsCount':appsCount,
            'appList':appList,
            'addTest':addTest
        }
        //...  其他函数待定义
        return service;
    }])
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
        '$routeParams',
        'phoneManageService',
        function($scope,$routeParams,phoneManageService) {
            var refreshAppList = function(){
                //模拟刷新数据
               // phoneManageService.appsCount = phoneManageService.getAppCount();
                phoneManageService.appsList = phoneManageService.getAppList();
                phoneManageService.appsCount = phoneManageService.appsList.length;
            }
            $scope.phoneManageService = phoneManageService;
            $scope.uninstall = function(appId){
                phoneManageService.uninstall(appId);
                refreshAppList();
            };
            //刷新
            $scope.refreshAppList = function(){
                // 测试
                phoneManageService.addTest();
                refreshAppList();
            } 
            //获取某个App的信息
            $scope.appDetails = phoneManageService.getAppDetail($routeParams.appid);
        }
    ]);

//侧边栏的 小通知，如 应用数量等。dom click listener
var SideNavModule = angular.module('SideNavModule',
    ['PhoneManageApp.services','ngRoute','AppsManagerModule']);

SideNavModule.controller("SideNavModuleController",
	[
		'$scope',
        'phoneManageService', // PhoneManageApp services
        'navButtonActionService',//self service
		function($scope,phoneManageService,navButtonActionService) {
        	$scope.phoneManageService = phoneManageService;
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

SideNavModule.config(['$compileProvider','$routeProvider',
  function($compileProvider,$routeProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(chrome-extension):/);
    $routeProvider
        .when('/MyApps/AppList', {
            templateUrl: 'phone/MyApps.html',
            controller: 'AppsManagerModuleCtrl'
        })
        .when('/MyApps/AppDetails/:appid',{
            controller:'AppsManagerModuleCtrl',
            templateUrl:'phone/AppDetails.html'
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




var PhoneManageApp = angular.module('PhoneManageApp',
    [
        'PhoneConnectStatusModule',
        'SideNavModule',
        'ManagePhoneFilter'
    ]);

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
$(function(){
    function __init(){
        var scope = $('div[ng-controller=AppsManagerModuleCtrl]').scope();
        scope.refreshAppList();
        scope.$apply();
    }
    setTimeout(__init,2000);
    
});
