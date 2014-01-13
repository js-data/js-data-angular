var utils = require('utils'),
	errors = require('errors'),
	store = require('store'),
	services = require('services'),
	PUT = require('../../HTTP').PUT,
	errorPrefix = 'DS.save(resourceName, id[, options]): ';

function _save(deferred, resource, id, options) {
	var _this = this;
	PUT(utils.makePath(resource.url, id), resource.index[id], null).then(function (data) {
		var saved = _this.inject(resource.name, data, options);
		resource.saved[id] = utils.updateTimestamp(resource.saved[id]);
		deferred.resolve(saved);
	}, deferred.reject);
}

/**
 * @doc method
 * @id DS.async_methods:save
 * @name save
 * @description
 * Save the item of the type specified by `resourceName` that has the primary key specified by `id`.
 *
 * ## Signature:
 * ```js
 * DS.save(resourceName, id[, options])
 * ```
 *
 * ## Example:
 *
 * ```js
 * TODO: save(resourceName, id) example
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to retrieve.
 * @param {object=} options Optional configuration. Properties:
 * - `{string=}` - `mergeStrategy` - When the updated item returns from the server, specify the merge strategy that
 * should be used when the updated item is injected into the data store. Default: `"mergeWithExisting"`.
 *
 * @returns {Promise} Promise produced by the `$q` service.
 *
 * ## Resolves with:
 *
 * - `{object}` - `item` - A reference to the newly saved item.
 *
 * ## Rejects with:
 *
 * - `{IllegalArgumentError}`
 * - `{RuntimeError}`
 * - `{UnhandledError}`
 */
function save(resourceName, id, options) {
	var deferred = $q.defer();

	options = options || {};

	if (!store[resourceName]) {
		deferred.reject(new errors.RuntimeError(errorPrefix + resourceName + ' is not a registered resource!'));
	} else if (!utils.isString(id) && !utils.isNumber(id)) {
		deferred.reject(new errors.IllegalArgumentError(errorPrefix + 'id: Must be a string or a number!', { id: { actual: typeof id, expected: 'string|number' } }));
	} else if (!utils.isObject(options)) {
		deferred.reject(new errors.IllegalArgumentError(errorPrefix + 'id: Must be an object!', { options: { actual: typeof options, expected: 'object' } }));
	} else {
		var _this = this;

		try {
			var resource = store[resourceName];

			if (resource.schema) {
				resource.schema.validate(resource.index[id], function (err) {
					if (err) {
						deferred.reject(err);
					} else {
						_save.call(_this, deferred, resource, id, options);
					}
				});
			} else {
				_save.call(_this, deferred, resource, id, options);
			}
		} catch (err) {
			if (!(err instanceof errors.UnhandledError)) {
				deferred.reject(new errors.UnhandledError(err));
			} else {
				deferred.reject(err);
			}
		}
	}

	return deferred.promise;
}

module.exports = save;
