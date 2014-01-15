var utils = require('utils'),
	errors = require('errors'),
	IllegalArgumentError = errors.IllegalArgumentError,
	services = require('services'),
	errorPrefix = 'DSProvider.config(options): ';

/**
 * @doc method
 * @id DSProvider.methods:config
 * @name config
 * @description
 * Configure the DS service.
 *
 * ## Signature:
 * ```js
 * DSProvider.config(options)
 * ```
 *
 * ## Example:
 * ```js
 *  DSProvider.config({
 *      baseUrl: 'http://myapp.com/api'
 *  });
 * ```
 *
 * ## Throws:
 *
 * - `{IllegalArgumentError}`
 *
 * @param {object} options Configuration for the data store.
 */
function config(options) {
	options = options || {};

	if (!utils.isObject(options)) {
		throw new IllegalArgumentError(errorPrefix + 'options: Must be an object!', { actual: typeof options, expected: 'object' });
	} else if (!utils.isString(options.baseUrl)) {
		throw new IllegalArgumentError(errorPrefix + 'options: Must be an object!', { baseUrl: { actual: typeof options, expected: 'object' } });
	}

	utils.deepMixIn(services.config, options);
}

/**
 * @doc interface
 * @id DSProvider
 * @name DSProvider
 */
function DSProvider() {

	/**
	 * @doc method
	 * @id DSProvider.methods:config
	 * @name config
	 * @methodOf DSProvider
	 * @description
	 * See [DSProvider.config](/documentation/api/api/DSProvider.methods:config).
	 */
	this.config = config;

	this.$get = ['$rootScope', '$log', '$http', '$q', function ($rootScope, $log, $http, $q) {

		services.$rootScope = $rootScope;
		services.$log = $log;
		services.$http = $http;
		services.$q = $q;
		services.store = {};

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

		DS.errors = errors;

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
