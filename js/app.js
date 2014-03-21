importio.init(ioconfig);
var io = angular.module("io", ["importicles"]);

var website = io.controller("Website", ["$scope", "safeApply", "importicleOauthState",
	function($scope, safeApply, state) {

	// login, list, link, recommend
	$scope.page = "login";

	// Current user
	$scope.user = false;

	// Ew ew ew
	$scope.paypal = function() {
		paypal.use( ["login"], function(login) {
			login.render ({
				"appid": "AVti7hDMEIMf2rIWCOw3IqPnf5uk7-WD5YqTbHcli9Ph-Dpucy3wWA8J7w5u",
				"authend": "sandbox",
				"scopes": "openid",
				"containerid": "loginWithPaypal",
				"locale": "en-gb",
				"theme": "neutral",
				"returnurl": "http://pp.chris-alexander.co.uk/who.php"
			});
			state.await(function(d, done) {
				if (d.hasOwnProperty("code") && d.code) {
					$scope.user = d.code;
					$scope.page = "list";
				}
				done();
				safeApply($scope);
			});
		});
	}
	setTimeout($scope.paypal, 1000);

}]);

var login = io.controller("Login", ["$scope", "safeApply", "importicleOauthState", "windowUtils",
	function($scope, safeApply, state, windowUtils) {

	$scope.init = function() {
		state.provideResult({ "code": windowUtils.getParameters()["code"] }, function() {
			window.close();
		});
	}
	$scope.init();

}]);