var utils = require('utils'),
	errors = require('errors'),
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
 *      baseUrl: 'http://myapp.com/api',
 *      idAttribute: '_id'
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
		throw new errors.IllegalArgumentError(errorPrefix + 'options: Must be an object!', { actual: typeof options, expected: 'object' });
	} else if ('baseUrl' in options && !utils.isString(options.baseUrl)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'options.baseUrl: Must be a string!', { baseUrl: { actual: typeof options.baseUrl, expected: 'string' } });
	} else if ('idAttribute' in options && !utils.isString(options.idAttribute)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'options.idAttribute: Must be a string!', { idAttribute: { actual: typeof options.idAttribute, expected: 'string' } });
	} else if ('mergeStrategy' in options && !utils.isString(options.mergeStrategy)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'options.mergeStrategy: Must be a string!', { mergeStrategy: { actual: typeof options.mergeStrategy, expected: 'string' } });
	} else if ('beforeValidate' in options && !utils.isFunction(options.beforeValidate)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'options.beforeValidate: Must be a function!', { beforeValidate: { actual: typeof options.beforeValidate, expected: 'function' } });
	} else if ('validate' in options && !utils.isFunction(options.validate)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'options.validate: Must be a function!', { validate: { actual: typeof options.validate, expected: 'function' } });
	} else if ('afterValidate' in options && !utils.isFunction(options.afterValidate)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'options.afterValidate: Must be a function!', { afterValidate: { actual: typeof options.afterValidate, expected: 'function' } });
	} else if ('beforeCreate' in options && !utils.isFunction(options.beforeCreate)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'options.beforeCreate: Must be a function!', { beforeCreate: { actual: typeof options.beforeCreate, expected: 'function' } });
	} else if ('afterCreate' in options && !utils.isFunction(options.afterCreate)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'options.afterCreate: Must be a function!', { afterCreate: { actual: typeof options.afterCreate, expected: 'function' } });
	} else if ('beforeUpdate' in options && !utils.isFunction(options.beforeUpdate)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'options.beforeUpdate: Must be a function!', { beforeUpdate: { actual: typeof options.beforeUpdate, expected: 'function' } });
	} else if ('afterUpdate' in options && !utils.isFunction(options.afterUpdate)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'options.afterUpdate: Must be a function!', { afterUpdate: { actual: typeof options.afterUpdate, expected: 'function' } });
	} else if ('beforeDestroy' in options && !utils.isFunction(options.beforeDestroy)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'options.beforeDestroy: Must be a function!', { beforeDestroy: { actual: typeof options.beforeDestroy, expected: 'function' } });
	} else if ('afterDestroy' in options && !utils.isFunction(options.afterDestroy)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'options.afterDestroy: Must be a function!', { afterDestroy: { actual: typeof options.afterDestroy, expected: 'function' } });
	}

	services.config = new services.BaseConfig(options);
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
