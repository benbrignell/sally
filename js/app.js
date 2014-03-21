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

	$scope.konami = function() {
		var easter_egg = new Konami();
		easter_egg.code = function() {
			$scope.user = true;
			$scope.page = "link";
			safeApply($scope);
		}
		easter_egg.load();
	}
	$scope.konami();

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

	$scope.recommendedCreditCards = [];

	$scope.creditCards = function get_best_creditcard_deal(dataset) {
		$scope.recommendedCreditCards = [];
		var banks = [];
		var card_names = [];
		var aprs = [];
		var purchase_interest_free_periods = [];
		var balance_transfer_interest_free_periods = [];
		for (var x = 0; x < dataset.data.length; x++) {
			banks.push(dataset.data[x]["bank_name"]);
			card_names.push(dataset.data[x]["card_name"]);
			aprs.push(parseFloat(dataset.data[x]["apr"]));
			if (dataset.data[x].hasOwnProperty("purchase_interest_free_period")) {
				purchase_interest_free_periods.push(parseFloat(dataset.data[x]["purchase_interest_free_period"]));
			} else {
				purchase_interest_free_periods.push(0);
			}
			balance_transfer_interest_free_periods.push(parseFloat(dataset.data[x]["balance_transfer_interest_free_period"]));
		}

		var max_purchase_free_period = Math.max.apply(null, purchase_interest_free_periods);

		var array_banks=[];
		var array_cards=[];
		var array_aprs=[];
		for (var y = 0; y < purchase_interest_free_periods.length; y++) {
			z = purchase_interest_free_periods[y];
			if (z == max_purchase_free_period) {
				array_banks.push(banks[y]);
				array_cards.push(card_names[y]);
				array_aprs.push(aprs[y]);
			}
		}

		var min_apr = Math.min.apply(null,array_aprs)

		var best_bank; var best_card;
		for (var w = 0; w < array_aprs.length; w++) {
			k = array_aprs[w]
			if (k == min_apr) {
				best_bank = array_banks[w];
				best_card = array_cards[w];
			}
		}

		$scope.recommendedCreditCards.push({
			"bank": best_bank,
			"card": best_card,
			"apr": min_apr,
			"purchase": max_purchase_free_period
		});
		safeApply($scope);
	}

	$scope.queryProgress = 0;

	$scope.getCreditCard = function() {
		$scope.queryProgress = 0;
		importio.query({
			"connectorGuids": [
				"d0c5b81a-01a6-4c6b-9781-e609d0941974"
			],
			"input": {
				"cc_allcards": "cc_allcards#pg9"
			},
			"maxPages": 4
		}, {
			"progress": function(percent) {
				$scope.queryProgress = percent;
				safeApply($scope);
			},
			"done": function(data) {
				var processedData = [];
				data.map(function(row) {
					processedData.push(row.data);
				});
				$scope.creditCards({ "data": processedData });
			}
		});
	}
	$scope.getCreditCard();

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