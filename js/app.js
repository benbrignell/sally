importio.init(ioconfig);
var io = angular.module("io", ["importicles"]);

var website = io.controller("Website", ["$scope", "safeApply", "importicleOauthState", "cacookie",
	function($scope, safeApply, state, cookie) {

	// login, list, link, recommend
	$scope.page = "login";

	// Current user
	$scope.user = false;

	// Whether paypal has been initialised
	$scope.paypalInitialised = false;

	// Ew ew ew
	$scope.paypal = function() {
		paypal.use( ["login"], function(login) {
			if (!$scope.paypalInitialised) {
				$scope.paypalInitialised = true;
				login.render ({
					"appid": "AVti7hDMEIMf2rIWCOw3IqPnf5uk7-WD5YqTbHcli9Ph-Dpucy3wWA8J7w5u",
					"authend": "sandbox",
					"scopes": "openid",
					"containerid": "loginWithPaypal",
					"locale": "en-gb",
					"theme": "neutral",
					"returnurl": "http://pp.chris-alexander.co.uk/who.php"
				});
			}
			state.await(function(d, done) {
				if (d.hasOwnProperty("code") && d.code) {
					$scope.user = d.code;
					$scope.page = "link";
					cookie.create("user", d.code, 1000*60*60);
				}
				done();
				safeApply($scope);
			});
		});
	}

	$scope.init = function() {
		var c = cookie.read("user");
		if (c) {
			$scope.page = "list";
			$scope.user = c;
			safeApply($scope);
			return;
		} else {
			setTimeout($scope.paypal, 1000);
		}
	}
	$scope.init();

	$scope.logout = function() {
		cookie.create("user", false, -1);
		$scope.user = false;
		$scope.page = "login";
		$scope.paypal();
	}

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