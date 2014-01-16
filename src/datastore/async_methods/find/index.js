var utils = require('utils'),
	errors = require('errors'),
	services = require('services'),
	errorPrefix = 'DS.find(resourceName, id[, options]): ';

/**
 * @doc method
 * @id DS.async_methods:find
 * @name find
 * @description
 * Asynchronously return the resource with the given id from the server. The result will be added to the data
 * store when it returns from the server.
 *
 * ## Signature:
 * ```js
 * DS.find(resourceName, id[, options])
 * ```
 *
 * ## Example:
 *
 * ```js
 *  DS.get('document', 5); // undefined
 *  DS.find('document', 5).then(function (document) {
 *      document; // { id: 5, author: 'John Anderson' }
 *
 *      DS.get('document', 5); // { id: 5, author: 'John Anderson' }
 *  }, function (err) {
 *      // Handled errors
 *  });
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to retrieve.
 * @param {object=} options Optional configuration. Properties:
 * - `{boolean=}` - `bypassCache` - Bypass the cache. Default: `false`.
 * - `{string=}` - `mergeStrategy` - If `findAll` is called, specify the merge strategy that should be used when the new
 * items are injected into the data store. Default: `"mergeWithExisting"`.
 * @returns {Promise} Promise produced by the `$q` service.
 *
 * ## Resolves with:
 *
 * - `{object}` - `item` - The item with the primary key specified by `id`.
 *
 * ## Rejects with:
 *
 * - `{IllegalArgumentError}`
 * - `{RuntimeError}`
 * - `{UnhandledError}`
 */
function find(resourceName, id, options) {
	var deferred = services.$q.defer(),
		promise = deferred.promise;

	options = options || {};

	if (!services.store[resourceName]) {
		deferred.reject(new errors.RuntimeError(errorPrefix + resourceName + ' is not a registered resource!'));
	} else if (!utils.isString(id) && !utils.isNumber(id)) {
		deferred.reject(new errors.IllegalArgumentError(errorPrefix + 'id: Must be a string or a number!', { id: { actual: typeof id, expected: 'string|number' } }));
	} else if (!utils.isObject(options)) {
		deferred.reject(new errors.IllegalArgumentError(errorPrefix + 'options: Must be an object!', { options: { actual: typeof options, expected: 'object' } }));
	} else {
		try {
			var resource = services.store[resourceName],
				_this = this;

			if (options.bypassCache) {
				delete resource.completedQueries[id];
			}

			if (!(id in resource.completedQueries)) {
				if (!(id in resource.pendingQueries)) {
					promise = resource.pendingQueries[id] = _this.GET(utils.makePath(resource.baseUrl, resource.endpoint, id), null)
						.then(function (data) {
							// Query is no longer pending
							delete resource.pendingQueries[id];
							resource.completedQueries[id] = new Date().getTime();
							return _this.inject(resourceName, data);
						});
				}

				return resource.pendingQueries[id];
			} else {
				deferred.resolve(_this.get(resourceName, id));
			}
		} catch (err) {
			deferred.reject(err);
		}
	}

	return promise;
}

module.exports = find;
