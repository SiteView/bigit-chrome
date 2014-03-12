//该Service与 插件Service通讯 。
var PhoneManageService  = angular.module('PhoneManage.services', []);
//管理App Service
PhoneManageService.factory('phoneManageAppService',function(){ //手机管理服务
        var service = {};
        var plugin = new PluginForPhone();

        //获取一个app信息
        var getAppDetail = function(appId){
            //test
            return {
                appId:appId,
                appName:appId+"_test"
            }
        }

        //卸载app
        var uninstall  = function(appId,callback){
            console.log('uninstall :' + appId);
            plugin.uninstall(appId,function(flag){
                if(!flag){
                    console.log("卸载失败");
                    callback && callback();
                    return;
                }
                var appList = service.appList;
                //删除显示条目
                for(var index = 0; index < appList.length; index++ ){
                    var app = appList[index];
                    if(app.id == appId){
                        appList.splice(index,1);
                        service.appsCount = appList.length;//更新 值域
                        break;
                    }
                }
                callback && callback();
            });
        }
        //刷新AppList
        var refreshAppList = function(callback){
            ManagePhoneStorage.getAppList(function(appList){
                service.appList = appList;
                service.appsCount = appList.length;
                callback && callback();
            });
        }
   //    refreshAppList(); 
        //...  其他函数待定义
        service = {
            'refreshAppList':refreshAppList,
            'getAppDetail':getAppDetail,
            'uninstall':uninstall,
            'appsCount':0,
            'appList':[]
        }
        
        return service;
    });

//管理基本状态 Service
PhoneManageService.factory('phoneBasicService',function(){ //手机状态服务
        var service;
        var plugin = new PluginForPhone();
       
        //刷新手机状态
        var refreshPhoneStatus = function(callback){
            ManagePhoneStorage.getDeviceInfo(function(DeviceInfo){
                if(!DeviceInfo || DeviceInfo.name === "nofound"){
                    service.DeviceInfo = false;
                    console.log("手机未连接");
                 }else{
                     console.log(DeviceInfo);
                    service.DeviceInfo = DeviceInfo;
                    callback && callback();
                 }     
            });
        }
        service = {
            'refreshPhoneStatus':refreshPhoneStatus,
            'DeviceInfo':false
        }
        return service;
    });

//手机的基本状态 Controller
var PhoneMangeController = angular.module('PhoneManage.controller', ['PhoneManage.services']);
//手机连接状态
PhoneMangeController.controller("PhoneMangeConnectStatusCtrl",
    [
        '$scope',
        'phoneBasicService',
        function($scope,$phoneBasicService) {
            //$scope.status = false;
            $scope.phoneBasicService = $phoneBasicService;        
            $scope.refreshPhoneStatus = function(){
                $phoneBasicService.refreshPhoneStatus(function(){
                      $scope.$apply();
                });
            }
            //初始化数据
            ManagePhoneStorage.getDeviceInfo(function(DeviceInfo){
                    if(!DeviceInfo || DeviceInfo.name === "nofound"){
                        $scope.phoneBasicService.DeviceInfo = false;
                        console.log("手机未连接");
                    }else{
                        $scope.phoneBasicService.DeviceInfo = DeviceInfo;
                    }
                     $scope.$apply();
            });
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
                $phoneManageAppService.refreshAppList(function(){
                    $scope.$apply();
                });        
            } 
            //获取某个App的信息
            $scope.appDetails = $phoneManageAppService.getAppDetail($routeParams.appid);
            //初始化数据
            ManagePhoneStorage.getAppList(function(appList){
                $scope.phoneManageAppService.appList = appList;
                $scope.phoneManageAppService.appsCount = appList.length;
                $scope.$apply();
            });
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

var DefineAppTools = function(){};
Object.defineProperty(DefineAppTools,"refreshAppList",{
    value:function(){
        var scope = $('div[ng-controller=AppsManagerModuleCtrl]').scope();
         scope.refreshAppList();
    }
});
Object.defineProperty(DefineAppTools,"refreshPhoneStatus",{
    value:function(){
        var scope = $('div[ng-controller=PhoneMangeConnectStatusCtrl]').scope();
        scope.refreshPhoneStatus();
    }
});
Object.defineProperty(DefineAppTools,"refreshAll",{
    value:function(){
        DefineAppTools.refreshAppList();
        DefineAppTools.refreshPhoneStatus();
    }
});

chrome.storage.onChanged.addListener(function(changes,areaname){
    if(areaname != "local" || !changes[ManagePhoneStorage.AppList]){
        return;
    }
    DefineAppTools.refreshAppList();
});

chrome.storage.onChanged.addListener(function(changes,areaname){
    if(areaname != "local" || !changes[ManagePhoneStorage.DeviceInfo]){
        return;
    }
    DefineAppTools.refreshPhoneStatus();
});