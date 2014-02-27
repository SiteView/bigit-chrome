var SideNavModule = angular.module('SideNavModule',[]);
SideNavModule.controller("SideNavModuleController",
	[
		'$scope', 
		function($scope) {
        	$scope.appCounts = 0;
        	$scope.getAppCounts = function(){
        		$scope.appCounts = 10;
        	}
    	}
    ]);

var PhoneStatusModule = angular.module('PhoneStatusModule',[]);

PhoneStatusModule.controller("PhoneStatusCtrl",
	[
		'$scope', 
		function($scope) {
        	$scope.status = false;
    	}
    ]);