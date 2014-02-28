angular.module('ManagePhoneFilter', []).filter('checkPhoneConnectStatus', function() {
  return function(status) {
    return status ? '已连接' : '未连接';
  };
});