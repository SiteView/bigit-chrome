//该Service与 插件Service通讯 。
var PhoneManageService  = angular.module('PhoneManage.services', []);
//管理App Service
PhoneManageService.factory('phoneManageAppService',function(){ //手机管理服务
        var service = {};
        var plugin = new PluginForPhone();
        //刷新AppList
        var refreshAppListAtStorage = function(callback){
            ManagePhoneStorage.getAppListFormStorage(function(appList){
                service.appList = appList;
                service.appsCount = appList.length;
                callback && callback();
            });
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
        var uninstall  = function(appId,callback){
            console.log('uninstall :' + appId);
            ManagePhoneStorage.addAppToUninstallStack(appId);
        }
        service = {
            'refreshAppListAtStorage':refreshAppListAtStorage,
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
                 }else{
                    service.DeviceInfo = DeviceInfo;
                 } 
                  callback && callback();
            });
        }
        service = {
            'refreshPhoneStatus':refreshPhoneStatus,
            'DeviceInfo':false
        }
        return service;
    });

//程序入口  主ng-app
var PhoneManage = angular.module('PhoneManage',[ 'ngRoute','pascalprecht.translate' ,'PhoneManage.services' ]);

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
PhoneManage.directive('bigitContent',function(){ //展示顶部导航栏
        return {
            restrict: 'E',
            templateUrl: 'phone/ManagePhoneContent.html'
        };
    });

PhoneManage.directive('bigitAppinfo',function($http){ //展示顶部导航栏
    return function(scope, element, attr){
        var url = "http://down.bigit.com/bigit/appinfo";
        var params = {
            "params":{
                "id":scope.app.id
            }
        }
        //比较版本大小
        var compareVersion = function(currentVersion,targetVersion){
             currentVersion = currentVersion.match(/(\d(\.)?)*/)[0];
             targetVersion = targetVersion.match(/(\d(\.)?)*/)[0];
          //   var mainCurrentVersion = currentVersion.
        }
        $http.get(url, params)
            .success(function(data, status, headers, config) {
                     scope.app.name = data.name;
                     scope.app.imagesrc = data.logo;
                     //function a(s){return s.match(/(\d(\.)?)*/)}
            }).error(function(data, status, headers, config){
                    console.log(scope.app.name+"获取失败：错误代码"+status);
            });
        }
    });


//应用管理
PhoneManage.controller("AppsManagerModuleCtrl",
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
            $scope.refreshAppListAtStorage = function(){
                //刷新Apps数据
                $phoneManageAppService.refreshAppListAtStorage(function(){
                    $scope.$apply();
                });        
            } 
            //获取某个App的信息
            $scope.appDetails = $phoneManageAppService.getAppDetail($routeParams.appid);


            $scope.getImgSrc  = function(id){
                console.log(id);
            }

            //初始化数据
            ManagePhoneStorage.getAppListFormStorage(function(appList){
                $scope.phoneManageAppService.appList = appList;
                $scope.phoneManageAppService.appsCount = appList.length;
                $scope.$apply();
            });
        }
    ]);

//手机连接状态
PhoneManage.controller("PhoneMangeConnectStatusCtrl",
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

//侧边栏 服务的 小通知，如 应用数量等
PhoneManage.controller("SideNavModuleController",
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

//顶部导航
PhoneManage.controller('TopNavModuleCtrl',['$scope','$translate', function($scope,$translate) {
    $scope.setLang = function(langKey) {
    // You can change the language during runtime
        $translate.use(langKey);
    };
    $scope.language = $translate('language');
    $scope.languages = [{key:"en_US",value:"English"},{key:"zh_CN",value:"中文"}];
}]);

// 手机状态 装文字 文字
PhoneManage.filter('checkPhoneConnectStatus', function() { 
  return function(status) {
    return status ? '已连接' : '未连接';
  };
});
//angular安全限制
PhoneManage.config( [
    '$compileProvider',
    function( $compileProvider )
    {   
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|http|chrome-extension):/);
    }
]);
//空字符串转默认图片
PhoneManage.filter("emptyToImageSrc",function(){
    return function(src){
        var defualtSrc = "assets/images/icon_19.png";
         if(!src || !src.length){
            src =  defualtSrc;
         }
         return src
    }
})

//路由功能
PhoneManage.config(['$compileProvider','$routeProvider',
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


//配置 多国语言
PhoneManage.config(function($translateProvider) {
    $translateProvider.translations('en_US',en_US).translations('zh_CN', zh_CN);
    $translateProvider.preferredLanguage('zh_CN');

});

var DefineAppTools = function(){};
Object.defineProperty(DefineAppTools,"plugin",{
    value:new PluginForPhone()
});


//刷新应用列表
Object.defineProperty(DefineAppTools,"refreshAppListAtStorage",{
    value:function(){
        var scope = $('div[ng-controller=AppsManagerModuleCtrl]').scope();
         scope.refreshAppListAtStorage();
    }
});
//刷新手机状态
Object.defineProperty(DefineAppTools,"refreshPhoneStatus",{
    value:function(){
        var scope = $('div[ng-controller=PhoneMangeConnectStatusCtrl]').scope();
        scope.refreshPhoneStatus();
    }
});

chrome.storage.onChanged.addListener(function(changes,areaname){
    if(areaname != "local" ){
        return;
    }
    //监听应用列表数据变化
    if(changes[ManagePhoneStorage.AppList]){
        DefineAppTools.refreshAppListAtStorage();
    }
    //监听手机状态变化
    if(changes[ManagePhoneStorage.DeviceInfo]){
        DefineAppTools.refreshPhoneStatus();
    }
    //监听 卸载应用堆栈变化
    if(changes[ManagePhoneStorage.WaitForUninstallStack]){
        ManagePhoneStorage.uninstall();
    }

    //监听 卸载应用标志变化
    if(changes[ManagePhoneStorage.FlagForIsUninstalling]){
        var newValue = changes[ManagePhoneStorage.FlagForIsUninstalling].newValue;
        var oldValue = changes[ManagePhoneStorage.FlagForIsUninstalling].oldValue;
        if(newValue != oldValue){
             ManagePhoneStorage.uninstall();
        }
    }
});