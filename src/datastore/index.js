var utils = require('../utils'),
	services = require('./services');

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

		return DS;
	}];
}

module.exports = DSProvider;
