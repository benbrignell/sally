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

	$scope.creditCards = function(dataset) {
		$scope.recommendedCreditCards = [];
		for (var i = 0; i < 5; i++) {
			dataset = $scope.getCreditCardData(dataset);
		}
	}

	$scope.getCreditCardData = function (dataset) {
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

		var best_bank; var best_card; var best_number;
		for (var w = 0; w < array_aprs.length; w++) {
			k = array_aprs[w]
			if (k == min_apr) {
				best_bank = array_banks[w];
				best_card = array_cards[w];
				best_number = w;
			}
		}

		$scope.recommendedCreditCards.push({
			"bank": best_bank,
			"card": best_card,
			"apr": min_apr,
			"purchase": max_purchase_free_period
		});
		var i = dataset.data.length;
		while (i--) {
			if (dataset.data[i]["bank_name"] == best_bank && dataset.data[i]["card_name"] == best_card) {
				dataset.data.splice(i, 1);
			}
		}
		safeApply($scope);
		return dataset;
	}

	$scope.queryProgress = 0;
	$scope.creditCardStarted = false;

	$scope.getCreditCard = function() {
		$scope.creditCardStarted = true;
		$scope.queryProgress = 0;
		importio.query({
			"connectorGuids": [
				"d0c5b81a-01a6-4c6b-9781-e609d0941974"
			],
			"input": {
				"cc_allcards": "cc_allcards#pg9"
			},
			"maxPages": 2
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

	$scope.getCurrentAccountsLoading = false;

	$scope.currentAccounts = {};

	$scope.getCurrentAccountSize = function() {
		return Object.keys($scope.currentAccounts).length;
	}

	$scope.getCurrentAccounts = function(cb) {
		$scope.getCurrentAccountsLoading = true;
		$scope.currentAccounts = {};
		$scope.currentAccount = false;
		var prefix = "http://www.moneysupermarket.com/current-accounts/";
		var suffixes = [
			"Barclays",
			"First Direct",
			"Halifax",
			"HSBC",
			"Nationwide",
			"Lloyds Bank",
			"Natwest",
			"RBS",
			"Santander",
			"The Co-operative",
		];
		var futures = [];
		suffixes.map(function(suffix) {
			futures.push((function(url, name) {
				return importio.query({
					"connectorGuids": [
						"84890981-9821-4c4d-a936-da9145f4a99e"
					],
					"input": {
						"webpage/url": prefix + suffix
					}
				}, {
					"done": function(data) {
						var processedData = [];
						data.map(function(row) {
							processedData.push(row.data);
						});
						if (processedData.length) {
							$scope.currentAccounts[name] = processedData;
							safeApply($scope);
						}
					}
				});
			})(prefix + suffix.toLowerCase().replace(/ /g, "-") + "/", suffix));
		});
		$.when.apply(null, futures).done(function() {
			$scope.getCurrentAccountsLoading = false;
			if (cb) {
				cb(Array.prototype.slice.call(arguments, 0));
			}
			safeApply($scope);
		});
	}

	$scope.currentAccount = false;

	$scope.chooseAccount = function(account, name) {
		account.bank = name;
		$scope.currentAccount = account;
	}

	$scope.$watch("page", function(newValue) {
		if (newValue == "link") {
			$scope.getCurrentAccounts();
		}
	});

	$scope.bestCurrentAccounts = [];

	$scope.bestCurrentAccount = function(dataset) {
		var url_banks = [];
		var account_names = [];
		var interest_rate_aers = [];
		overdraft_rate_ears = [];
		for (var x in dataset.data) {
			url_banks.push(dataset.data[x]["_pageUrl"]);
			account_names.push(dataset.data[x]["product_name"]);
			if (dataset.data[x].hasOwnProperty("interest_rate_aer")) {
				interest_rate_aers.push(parseFloat(dataset.data[x]["interest_rate_aer"]));
			} else {
				interest_rate_aers.push(0);
			}
			overdraft_rate_ears.push(parseFloat(dataset.data[x]["overdraft_rate_ear"]));
		}
		var max_interest = Math.max.apply(null,interest_rate_aers);
		// for sorting?
		//var sorted_interests = interest_rate_aers.sort(function(a,b){return a - b});
		var array_banks=[];
		var array_accounts=[];
		var array_overdraft=[];
		for (var y = 0; y < interest_rate_aers.length; y++){
		z=interest_rate_aers[y]
			if (z==max_interest) {
				array_banks.push(url_banks[y]);
				array_accounts.push(account_names[y]);
				array_overdraft.push(overdraft_rate_ears[y]);
			}
		}
		var min_overdraft = Math.min.apply(null,array_overdraft);
		// for sorting?
		//var sorted_overdraft = array_overdraft.sort(function(a,b){return a - b});
		var best_url_bank; var best_account;
		for (var w = 0; w < array_overdraft.length; w++){
			k = array_overdraft[w];
			if (k==min_overdraft) {
				best_url_bank=array_banks[w];
				best_account=array_accounts[w];
			}
		}
		var best_url_bank_=best_url_bank.substring(0,(best_url_bank.length-1));
		var n = best_url_bank_.lastIndexOf("/");
		var best_bank=best_url_bank.substring((n+1),(best_url_bank.length-1));
		$scope.bestCurrentAccounts.push({
			"overdraft": min_overdraft,
			"interest": max_interest,
			"bank": best_bank,
			"account": best_account
		});
		$scope.currentAccountDone = true;
		$scope.currentAccountStarted = true;
	}

	$scope.currentAccountDone = false;
	$scope.currentAccountStarted = false;

	$scope.getCurrentAccountRecommendations = function() {
		$scope.currentAccountDone = false;
		$scope.currentAccountStarted = true;
		$scope.getCurrentAccounts(function(data) {
			var rows = [];
			data.map(function(result) {
				result.map(function(row) {
					row.data._pageUrl = row.pageUrl;
					rows.push(row.data);
				});
			});
			$scope.bestCurrentAccount({ "data": rows });
		});
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