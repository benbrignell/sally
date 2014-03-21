importio.init(ioconfig);
var io = angular.module("io", ["importicles"]);

var website = io.controller("Website", ["$scope", "safeApply",
	function($scope, safeApply) {

	// login, list, link, recommend
	$scope.page = "login";

}]);