var utils = require('utils'),
	errors = require('errors'),
	store = require('store'),
	services = require('services'),
	GET = require('../../HTTP').GET;

/**
 * @doc method
 * @id DS.async_methods:find
 * @name find
 * @description
 * `find(resourceName, id[, forceRefresh])`
 *
 * Asynchronously return the resource with the given id from the server. The result will be added to the data
 * store when it returns from the server.
 *
 * Example:
 *
 * ```js
 * TODO: find(resourceName, id[, forceRefresh]) example
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to retrieve.
 * @param {boolean=} forceRefresh Bypass the cache.
 * @returns {Promise} Promise produced by the `$q` service.
 *
 * ## ResolvesWith:
 *
 * - `{array}` - `item` - The item with the primary key specified by `id`.
 *
 * ## RejectsWith:
 *
 * - `{IllegalArgumentError}` - `err` - Argument `id` must be a string or a number.
 * - `{RuntimeError}` - `err` - Argument `resourceName` must refer to an already registered resource.
 * - `{UnhandledError}` - `err` - Thrown for any uncaught exception.
 */
function find(resourceName, id, forceRefresh) {
	var deferred = $q.defer();
	if (!store[resourceName]) {
		deferred.reject(new errors.RuntimeError('DS.find(resourceName, id[, forceRefresh]): ' + resourceName + ' is not a registered resource!'));
	} else if (!utils.isString(id) && !utils.isNumber(id)) {
		deferred.reject(new errors.IllegalArgumentError('DS.find(resourceName, id[, forceRefresh]): id: Must be a string or a number!', { id: { actual: typeof id, expected: 'string|number' } }));
	}

	var _this = this;

	try {
		var resource = store[resourceName];

		if (id in resource.index && !forceRefresh) {
			deferred.resolve(_this.get(resourceName, id));
		} else {
			GET(utils.makePath(resource.url, id), null).then(function (data) {
				try {
					_this.inject(resourceName, data);
					deferred.resolve(_this.get(resourceName, id));
				} catch (err) {
					deferred.reject(err);
				}
			}, deferred.reject);
		}
	} catch (err) {
		deferred.reject(new errors.UnhandledError(err));
	}

	return deferred.promise;
}

module.exports = find;
