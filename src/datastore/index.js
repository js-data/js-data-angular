var utils = require('utils'),
	errors = require('errors'),
	services = require('services'),
	HttpAdapter = require('HttpAdapter'),
	configErrorPrefix = 'DSProvider.config(options): ',
	registerAdapterErrorPrefix = 'DSProvider.registerAdapter(name, adapter): ';

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
 *      idAttribute: '_id',
 *      validate: function (resourceName, attrs, cb) {
 *          console.log('looks good to me');
 *          cb(null, attrs);
 *      }
 *  });
 * ```
 *
 * ## Throws:
 *
 * - `{IllegalArgumentError}`
 *
 * @param {object} options Global configuration for the data store. Properties:
 * - `{string=}` - `baseUrl` - The default base url to be used by the data store. Can be overridden via `DS.defineResource`.
 * - `{string=}` - `idAttribute` - The default property that specifies the primary key of an object. Default: `"id"`.
 * - `{function=}` - `beforeValidate` - Global lifecycle hook. Signature: `beforeValidate(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `validate` - Global lifecycle hook. Signature: `validate(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `afterValidate` - Global lifecycle hook. Signature: `afterValidate(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `beforeCreate` - Global lifecycle hook. Signature: `beforeCreate(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `afterCreate` - Global lifecycle hook. Signature: `afterCreate(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `beforeUpdate` - Global lifecycle hook. Signature: `beforeUpdate(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `afterUpdate` - Global lifecycle hook. Signature: `afterUpdate(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `beforeDestroy` - Global lifecycle hook. Signature: `beforeDestroy(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `afterDestroy` - Global lifecycle hook. Signature: `afterDestroy(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 */
function config(options) {
	options = options || {};

	if (!utils.isObject(options)) {
		throw new errors.IllegalArgumentError(configErrorPrefix + 'options: Must be an object!', { actual: typeof options, expected: 'object' });
	} else if ('baseUrl' in options && !utils.isString(options.baseUrl)) {
		throw new errors.IllegalArgumentError(configErrorPrefix + 'options.baseUrl: Must be a string!', { baseUrl: { actual: typeof options.baseUrl, expected: 'string' } });
	} else if ('idAttribute' in options && !utils.isString(options.idAttribute)) {
		throw new errors.IllegalArgumentError(configErrorPrefix + 'options.idAttribute: Must be a string!', { idAttribute: { actual: typeof options.idAttribute, expected: 'string' } });
	} else if ('mergeStrategy' in options && !utils.isString(options.mergeStrategy)) {
		throw new errors.IllegalArgumentError(configErrorPrefix + 'options.mergeStrategy: Must be a string!', { mergeStrategy: { actual: typeof options.mergeStrategy, expected: 'string' } });
	} else if ('beforeValidate' in options && !utils.isFunction(options.beforeValidate)) {
		throw new errors.IllegalArgumentError(configErrorPrefix + 'options.beforeValidate: Must be a function!', { beforeValidate: { actual: typeof options.beforeValidate, expected: 'function' } });
	} else if ('validate' in options && !utils.isFunction(options.validate)) {
		throw new errors.IllegalArgumentError(configErrorPrefix + 'options.validate: Must be a function!', { validate: { actual: typeof options.validate, expected: 'function' } });
	} else if ('afterValidate' in options && !utils.isFunction(options.afterValidate)) {
		throw new errors.IllegalArgumentError(configErrorPrefix + 'options.afterValidate: Must be a function!', { afterValidate: { actual: typeof options.afterValidate, expected: 'function' } });
	} else if ('beforeCreate' in options && !utils.isFunction(options.beforeCreate)) {
		throw new errors.IllegalArgumentError(configErrorPrefix + 'options.beforeCreate: Must be a function!', { beforeCreate: { actual: typeof options.beforeCreate, expected: 'function' } });
	} else if ('afterCreate' in options && !utils.isFunction(options.afterCreate)) {
		throw new errors.IllegalArgumentError(configErrorPrefix + 'options.afterCreate: Must be a function!', { afterCreate: { actual: typeof options.afterCreate, expected: 'function' } });
	} else if ('beforeUpdate' in options && !utils.isFunction(options.beforeUpdate)) {
		throw new errors.IllegalArgumentError(configErrorPrefix + 'options.beforeUpdate: Must be a function!', { beforeUpdate: { actual: typeof options.beforeUpdate, expected: 'function' } });
	} else if ('afterUpdate' in options && !utils.isFunction(options.afterUpdate)) {
		throw new errors.IllegalArgumentError(configErrorPrefix + 'options.afterUpdate: Must be a function!', { afterUpdate: { actual: typeof options.afterUpdate, expected: 'function' } });
	} else if ('beforeDestroy' in options && !utils.isFunction(options.beforeDestroy)) {
		throw new errors.IllegalArgumentError(configErrorPrefix + 'options.beforeDestroy: Must be a function!', { beforeDestroy: { actual: typeof options.beforeDestroy, expected: 'function' } });
	} else if ('afterDestroy' in options && !utils.isFunction(options.afterDestroy)) {
		throw new errors.IllegalArgumentError(configErrorPrefix + 'options.afterDestroy: Must be a function!', { afterDestroy: { actual: typeof options.afterDestroy, expected: 'function' } });
	} else if ('defaultAdapter' in options && !utils.isString(options.defaultAdapter)) {
		throw new errors.IllegalArgumentError(configErrorPrefix + 'options.defaultAdapter: Must be a function!', { defaultAdapter: { actual: typeof options.defaultAdapter, expected: 'string' } });
	}

	services.config = new services.BaseConfig(options);
}

/**
 * @doc method
 * @id DSProvider.methods:registerAdapter
 * @name registerAdapter
 * @description
 * Register a new adapter.
 *
 * ## Signature:
 * ```js
 * DSProvider.registerAdapter(name, adapter);
 * ```
 *
 * ## Example:
 * ```js
 *  DSProvider.registerAdapter('IndexedDBAdapter', {...});
 * ```
 *
 * ## Throws:
 *
 * - `{IllegalArgumentError}`
 * - `{RuntimeError}`
 *
 * @param {string} name The name of the new adapter.
 * @param {object} adapter New adapter.
 */
function registerAdapter(name, adapter) {

	if (!utils.isString(name)) {
		throw new errors.IllegalArgumentError(registerAdapterErrorPrefix + 'name: Must be a string!', { actual: typeof name, expected: 'string' });
	} else if (!utils.isObject(adapter)) {
		throw new errors.IllegalArgumentError(registerAdapterErrorPrefix + 'adapter: Must be an object!', { actual: typeof adapter, expected: 'object' });
	} else if (services.adapters[name]) {
		throw new errors.RuntimeError(registerAdapterErrorPrefix + name + ' is already registered!');
	}

	services.adapters[name] = adapter;
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

	config({});

	/**
	 * @doc method
	 * @id DSProvider.methods:registerAdapter
	 * @name config
	 * @methodOf DSProvider
	 * @description
	 * See [DSProvider.registerAdapter](/documentation/api/api/DSProvider.methods:registerAdapter).
	 */
	this.registerAdapter = registerAdapter;

	this.$get = ['$rootScope', '$log', '$http', '$q', function ($rootScope, $log, $http, $q) {

		services.$rootScope = $rootScope;
		services.$log = $log;
		services.$http = $http;
		services.$q = $q;
		services.store = {};
		services.adapters = {};

		registerAdapter('HttpAdapter', HttpAdapter);

		/**
		 * @doc interface
		 * @id DS
		 * @name DS
		 * @description
		 * Data store
		 */
		var DS = {
			HttpAdapter: HttpAdapter,
			errors: errors
		};

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
