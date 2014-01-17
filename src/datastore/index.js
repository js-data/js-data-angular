var errorPrefix = 'DSProvider.registerAdapter(name, adapter): ',
	utils = require('../utils')[0]();

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
 * @doc interface
 * @id DSProvider
 * @name DSProvider
 */
function DSProvider() {


	var defaults = this.defaults = new BaseConfig(),
		adapters = this.adapters = {};

	this.$get = [
		'$rootScope', '$log', '$q', 'DSHttpAdapter', 'DSUtils', 'DSErrors',
		function ($rootScope, $log, $q, DSHttpAdapter, DSUtils, DSErrors) {

			var syncMethods = require('./sync_methods'),
				asyncMethods = require('./async_methods');

			adapters.DSHttpAdapter = DSHttpAdapter;

			/**
			 * @doc interface
			 * @id DS
			 * @name DS
			 * @description
			 * Data store
			 */
			var DS = {
				$rootScope: $rootScope,
				$log: $log,
				$q: $q,
				defaults: defaults,
				store: {},
				definitions: {},
				adapters: adapters,
				errors: DSErrors,
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
				return new Date().getTime() / 100 | 0;
			}, function () {
				DS.digest();
			});

			return DS;
		}];
}

module.exports = DSProvider;
