importio.init(ioconfig);
var io = angular.module("io", ["importicles"]);
var website = io.controller("Website", ["$scope", "safeApply", "importicleAuthTwo",
	function($scope, safeApply, auth) {

	$scope.current = auth.current;
	$scope.initialised = auth.initialised;
	$scope.justCurrent = auth.justCurrent;

	$scope.$on("onAuthEvent", function() {
		safeApply($scope);
	});
	$scope.$on("onAuthInitialised", function() {
		safeApply($scope);
	});

}]);