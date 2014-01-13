var utils = require('utils'),
	services = require('services');

/**
 * @doc interface
 * @id DSProvider
 * @name DSProvider
 */
function DSProvider() {
	this.$get = ['$rootScope', '$log', '$http', '$q', function ($rootScope, $log, $http, $q) {

		services.$rootScope = $rootScope;
		services.$log = $log;
		services.$http = $http;
		services.$q = $q;

		/**
		 * @doc interface
		 * @id DS
		 * @name DS
		 * @description
		 * Data store
		 */
		var DS = {};

		utils.deepMixIn(DS, require('./http'));
		utils.deepMixIn(DS, require('./sync_methods'));
		utils.deepMixIn(DS, require('./async_methods'));

		utils.deepFreeze(DS);

		var $dirtyCheckScope = $rootScope.$new();

		$dirtyCheckScope.$watch(function () {
			// Throttle angular-data's digest loop to tenths of a second
			return new Date().getTime() / 100 | 0;
		}, function () {
			DS.digest();
		});

		return DS;
	}];
}

module.exports = DSProvider;
