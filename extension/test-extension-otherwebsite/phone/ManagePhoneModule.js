// 插件
var PluginServices = angular.module('Plugin.services', []);
//管理App 相关
PluginServices.factory('appPluginService',function(){
    var plugin = chrome.extension.getBackgroundPage().document.getElementById("AppPlugin"); //获取plugin
    // Initialize ProtoBuf.js
    var ProtoBuf = dcodeIO.ProtoBuf;
    var PhoneProtoBuilder = ProtoBuf.loadProtoFile("phone/phone.proto").build('bigit');
    return {}
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
        var appsCount = 0; //app数量
        var appList = []; //app列表
        var service = {};
        //获取App列表
        var getAppList = function(){
            //appPlugin do some thing
           // appPluginService.testPlugin();  //    Test  ----------
            return appList;
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
            service.appsCount = appList.length;//更新 值域
        }

        var _init = function(){
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
        }
        _init();
        service = {
            'refreshAppList':refreshAppList,
            'getAppList':getAppList,
            'getAppDetail':getAppDetail,
            'getAppCount':getAppCount,
            'uninstall':uninstall,
            'appsCount':appsCount,
            'appList':appList,
            'addTest':addTest
        }
        //...  其他函数待定义
        return service;
    }]);

//管理基本状态 Service
PhoneManageService.factory('phoneBasicService',['basicPluginService',function($basicPluginService){ //手机状态服务
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
        return {
            'getPhoneConnectStatus':getPhoneConnectStatus,
            'getDeviceInfo':getDeviceInfo,
            'DeviceInfo':device
        }
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
                var connectStatus = $phoneBasicService.getPhoneConnectStatus();
                if(!connectStatus){
                    return;
                }
                console.log(connectStatus);
                $phoneBasicService.DeviceInfo = connectStatus;
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
            var refreshAppList = function(){
                
            }
            $scope.phoneManageAppService = $phoneManageAppService;
            $scope.uninstall = function(appId){
                $phoneManageAppService.uninstall(appId);
            };
            //刷新
            $scope.refreshAppList = function(){
                //刷新Apps数据
               // $phoneManageAppService.refreshAppList();
                // 测试
                $phoneManageAppService.addTest();
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
        console.log('正在加载AppList...')
        var scope = $('div[ng-controller=AppsManagerModuleCtrl]').scope();
        scope.refreshAppList();
        console.log('加载完毕')
    }
    var refreshPhoneStatus = function(){
        console.log('正在刷新手机状态...');
        var scope = $('div[ng-controller=PhoneMangeConnectStatusCtrl]').scope();
        scope.refreshPhoneStatus();
        console.log('刷新完成');
    }
    function __init(){
        refreshAppList();
        refreshPhoneStatus();
    }
    setTimeout(__init,1000);
});
