var utils = require('../utils')[0]();

function lifecycleNoop(resourceName, attrs, cb) {
	cb(null, attrs);
}

function BaseConfig() {
}

BaseConfig.prototype.idAttribute = 'id';
BaseConfig.prototype.defaultAdapter = 'DSHttpAdapter';
BaseConfig.prototype.filter = function (resourceName, where, attrs) {
	var keep = true;
	utils.forOwn(where, function (clause, field) {
		if (utils.isString(clause)) {
			clause = {
				'===': clause
			};
		}
		if ('==' in clause) {
			keep = keep && (attrs[field] == clause['==']);
		} else if ('===' in clause) {
			keep = keep && (attrs[field] === clause['===']);
		} else if ('!=' in clause) {
			keep = keep && (attrs[field] != clause['!=']);
		} else if ('>' in clause) {
			keep = keep && (attrs[field] > clause['>']);
		} else if ('>=' in clause) {
			keep = keep && (attrs[field] >= clause['>=']);
		} else if ('<' in clause) {
			keep = keep && (attrs[field] < clause['<']);
		} else if ('<=' in clause) {
			keep = keep && (attrs[field] <= clause['<=']);
		} else if ('in' in clause) {
			keep = keep && utils.contains(clause['in'], attrs[field]);
		}
	});
	return keep;
};
BaseConfig.prototype.baseUrl = '';
BaseConfig.prototype.endpoint = '';
BaseConfig.prototype.beforeValidate = lifecycleNoop;
BaseConfig.prototype.validate = lifecycleNoop;
BaseConfig.prototype.afterValidate = lifecycleNoop;
BaseConfig.prototype.beforeCreate = lifecycleNoop;
BaseConfig.prototype.afterCreate = lifecycleNoop;
BaseConfig.prototype.beforeUpdate = lifecycleNoop;
BaseConfig.prototype.afterUpdate = lifecycleNoop;
BaseConfig.prototype.beforeDestroy = lifecycleNoop;
BaseConfig.prototype.afterDestroy = lifecycleNoop;

/**
 * @doc function
 * @id DSProvider
 * @name DSProvider
 */
function DSProvider() {

	/**
	 * @doc property
	 * @id DSProvider.properties:defaults
	 * @name defaults
	 * @description
	 * See the [configuration guide](/documentation/guide/configure/global).
	 *
	 * Properties:
	 *
	 * - `{string}` - `baseUrl`
	 * - `{string}` - `idAttribute` - Default: `"id"`
	 * - `{string}` - `defaultAdapter` - Default: `"DSHttpAdapter"`
	 * - `{function}` - `filter` - Default: See [angular-data query language](/documentation/guide/queries/custom).
	 * - `{function}` - `beforeValidate` - See [](). Default: No-op
	 * - `{function}` - `validate` - See [](). Default: No-op
	 * - `{function}` - `afterValidate` - See [](). Default: No-op
	 * - `{function}` - `beforeCreate` - See [](). Default: No-op
	 * - `{function}` - `afterCreate` - See [](). Default: No-op
	 * - `{function}` - `beforeUpdate` - See [](). Default: No-op
	 * - `{function}` - `afterUpdate` - See [](). Default: No-op
	 * - `{function}` - `beforeDestroy` - See [](). Default: No-op
	 * - `{function}` - `afterDestroy` - See [](). Default: No-op
	 */
	var defaults = this.defaults = new BaseConfig();

	this.$get = [
		'$rootScope', '$log', '$q', 'DSHttpAdapter', 'DSUtils', 'DSErrors',
		function ($rootScope, $log, $q, DSHttpAdapter, DSUtils, DSErrors) {

			var syncMethods = require('./sync_methods'),
				asyncMethods = require('./async_methods');

			/**
			 * @doc interface
			 * @id DS
			 * @name DS
			 * @description
			 * Public data store interface. Consists of several properties and a number of methods. Injectable as `DS`.
			 *
			 * See the [guide](/documentation/guide/overview/index).
			 */
			var DS = {
				$rootScope: $rootScope,
				$log: $log,
				$q: $q,

				/**
				 * @doc property
				 * @id DS.properties:defaults
				 * @name defaults
				 * @description
				 * Reference to [DSProvider.defaults](/documentation/api/api/DSProvider.properties:defaults).
				 */
				defaults: defaults,

				/*!
				 * @doc property
				 * @id DS.properties:store
				 * @name store
				 * @description
				 * Meta data for each registered resource.
				 */
				store: {},

				/*!
				 * @doc property
				 * @id DS.properties:definitions
				 * @name definitions
				 * @description
				 * Registered resource definitions available to the data store.
				 */
				definitions: {},

				/**
				 * @doc property
				 * @id DS.properties:adapters
				 * @name adapters
				 * @description
				 * Registered adapters available to the data store. Object consists of key-values pairs where the key is
				 * the name of the adapter and the value is the adapter itself.
				 */
				adapters: {
					DSHttpAdapter: DSHttpAdapter
				},

				/**
				 * @doc property
				 * @id DS.properties:errors
				 * @name errors
				 * @description
				 * References to the various [error types](/documentation/api/api/errors) used by angular-data.
				 */
				errors: DSErrors,

				/*!
				 * @doc property
				 * @id DS.properties:utils
				 * @name utils
				 * @description
				 * Utility functions used internally by angular-data.
				 */
				utils: DSUtils
			};

			DSUtils.deepFreeze(syncMethods);
			DSUtils.deepFreeze(asyncMethods);

			DSUtils.deepMixIn(DS, syncMethods);
			DSUtils.deepMixIn(DS, asyncMethods);

			DSUtils.deepFreeze(DS.errors);
			DSUtils.deepFreeze(DS.utils);

			var $dirtyCheckScope = $rootScope.$new();

			$dirtyCheckScope.$watch(function () {
				// Throttle angular-data's digest loop to tenths of a second
				// TODO: Is this okay?
				return new Date().getTime() / 100 | 0;
			}, function () {
				DS.digest();
			});

			return DS;
		}];
}

module.exports = DSProvider;
