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

