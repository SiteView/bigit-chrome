// 插件
var PluginServices = angular.module('Plugin.services', []);
//管理App 相关
PluginServices.factory('appPluginService',function(){
    var plugin = chrome.extension.getBackgroundPage().document.getElementById("AppPlugin"); //获取plugin
    // Initialize ProtoBuf.js
    var ProtoBuf = dcodeIO.ProtoBuf;
    var PhoneProtoBuilder = ProtoBuf.loadProtoFile("phone/phone.proto").build('bigit');
    var getAppList = function(){
        var message = plugin.GetAppList('');
        PhoneProtoBuilder.AppList.decode64(message);
        var list =  PhoneProtoBuilder.AppList.decode64(message);
        if(list && list.app){
            return list.app
        }
        return [];
    }
    return {
        'getAppList':getAppList
    }
});
//管理手机基本信息相关
PluginServices.factory('basicPluginService',function(){
    var plugin = chrome.extension.getBackgroundPage().document.getElementById("AppPlugin"); //获取plugin
    // Initialize ProtoBuf.js
    var ProtoBuf = dcodeIO.ProtoBuf;
    var PhoneProtoBuilder = ProtoBuf.loadProtoFile("phone/phone.proto").build('bigit');

    //获取设备信息
    var getDeviceInfo = function(){
        var message = plugin.GetDeviceInfo('');
        message = btoa(message);
        return PhoneProtoBuilder.DeviceInfo.decode64(message);
    }
    return {
        'getDeviceInfo':getDeviceInfo
    }
});



//该Service与 插件Service通讯 。
var PhoneManageService  = angular.module('PhoneManage.services', ['Plugin.services']);
//管理App Service
PhoneManageService.factory('phoneManageAppService',['appPluginService',function($appPluginService){ //手机管理服务
        var service = {};
        //获取App列表
        var getAppList = function(){
            var appList = $appPluginService.getAppList();  //    Test  ----------
            console.log(appList);
            return appList;
        }
        //获取App数量
        var getAppCount = function(){
            // appPlugin do some thing
            return service.appList.length;
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
            var appList = service.appList;
            console.log('uninstall :' + appId)
            //模拟卸载
            for(var index = 0; index < appList.length; index++ ){
                var app = appList[index];
                if(app.id == appId){
                    console.log(app)
                    appList.splice(index,1);
                    service.appsCount = appList.length;//更新 值域
                    break;
                }
            }
        }
        //刷新AppList
        var refreshAppList = function(){
            service.appList = getAppList();
            service.appsCount = service.appList.length;
        }
        //...  其他函数待定义
        service = {
            'refreshAppList':refreshAppList,
            'getAppList':getAppList,
            'getAppDetail':getAppDetail,
            'getAppCount':getAppCount,
            'uninstall':uninstall,
            'appsCount':0,
            'appList':[]
        }
        
        return service;
    }]);

//管理基本状态 Service
PhoneManageService.factory('phoneBasicService',['basicPluginService',function($basicPluginService){ //手机状态服务
        var service;
        var device = false;
        //获取设备信息
        var getDeviceInfo = function(){
            return $basicPluginService.getDeviceInfo();
        }
        //获取手机连接状态
        var getPhoneConnectStatus = function(){
            device = getDeviceInfo();
            if(!device || device.name === "nofound"){
                console.log("手机未连接");
                return false;
            }
            return device;
        }
        //刷新手机状态
        var refreshPhoneStatus = function(){
            var connectStatus = getPhoneConnectStatus();
            if(!connectStatus){
                return;
            }
            console.log(connectStatus);
            service.DeviceInfo = connectStatus;
        }
        service = {
            'refreshPhoneStatus':refreshPhoneStatus,
            'getPhoneConnectStatus':getPhoneConnectStatus,
            'getDeviceInfo':getDeviceInfo,
            'DeviceInfo':device
        }
        return service;
    }]);

//手机的基本状态 Controller
var PhoneMangeController = angular.module('PhoneManage.controller', ['PhoneManage.services']);
//手机连接状态
PhoneMangeController.controller("PhoneMangeConnectStatusCtrl",
    [
        '$scope',
        'phoneBasicService',
        function($scope,$phoneBasicService) {
            $scope.status = false;
            $scope.phoneBasicService = $phoneBasicService;        
            $scope.refreshPhoneStatus = function(){
                $phoneBasicService.refreshPhoneStatus();
                $scope.$apply();
            }
        }
    ]);


//应用管理
var AppsManagerModule = angular.module('AppsManagerModule',['PhoneManage.services']);
AppsManagerModule.controller("AppsManagerModuleCtrl",
    [
        '$scope',
        '$routeParams',
        'phoneManageAppService',
        function($scope,$routeParams,$phoneManageAppService) {
            $scope.phoneManageAppService = $phoneManageAppService;
            $scope.uninstall = function(appId){
                $phoneManageAppService.uninstall(appId);
            };
            //刷新
            $scope.refreshAppList = function(){
                //刷新Apps数据
                $phoneManageAppService.refreshAppList();
                $scope.$apply();
            } 
            //获取某个App的信息
            $scope.appDetails = $phoneManageAppService.getAppDetail($routeParams.appid);

        }
    ]);

//侧边栏 服务。dom click listener //注入AppsManagerModule给router使用
var SideNavModule = angular.module('SideNavModule', ['ngRoute','PhoneManage.services','AppsManagerModule']);

//侧边栏 服务的 小通知，如 应用数量等
SideNavModule.controller("SideNavModuleController",
    [
        '$scope',
        '$location',
        'phoneManageAppService', // PhoneManage services
        function($scope,$location,$phoneManageAppService) {
            $scope.phoneManageAppService = $phoneManageAppService;
            //根据路径判断当前侧边栏选中项
            $scope.isActive =function(viewLocation){
                return viewLocation == $location.path();
            }
        }
    ]);

//路由功能
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
        .when('/',{
            templateUrl:'phone/DeviceInfo.html',
            controller:'PhoneMangeConnectStatusCtrl'
        })
  }]);

//程序入口  主ng-app
var PhoneManage = angular.module('PhoneManage',
    [
        'PhoneManage.controller',
        'SideNavModule',
        'ManagePhoneFilter'
    ]);

//自定义指令
PhoneManage.directive('bigitSidenavbar', function() { //展示侧边导航栏
        return {
            restrict: 'E',
            templateUrl: 'phone/ManagePhoneSideNavBar.html'
        };
    });
PhoneManage.directive('bigitTopnavbar',function(){ //展示顶部导航栏
        return {
            restrict: 'E',
            templateUrl: 'phone/ManagePhoneTopNavBar.html'
        };
    });


$(function(){
    var  refreshAppList = function(){
        var t1 = new Date().getTime();
        console.log('正在加载AppList...')
        var scope = $('div[ng-controller=AppsManagerModuleCtrl]').scope();
        scope.refreshAppList();
        console.log('加载完毕')
        console.log('耗时:' + (new Date().getTime() - t1)/1000);
    }
    var refreshPhoneStatus = function(){
        console.log('正在刷新手机状态...');
        var scope = $('div[ng-controller=PhoneMangeConnectStatusCtrl]').scope();
        scope.refreshPhoneStatus();
        console.log('刷新完成');
    }
    function __init(){
        refreshPhoneStatus();
        refreshAppList();
    }
    setTimeout(__init,1000);
});

function testAppList(){
    var scope = $('div[ng-controller=AppsManagerModuleCtrl]').scope();
    scope.phoneManageAppService.getAppList();
}