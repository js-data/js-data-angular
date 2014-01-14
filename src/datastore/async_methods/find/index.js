var utils = require('utils'),
	errors = require('errors'),
	store = require('store'),
	services = require('services'),
	GET = require('../../HTTP').GET,
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
	var deferred = $q.defer();
	if (!store[resourceName]) {
		deferred.reject(new errors.RuntimeError(errorPrefix + resourceName + ' is not a registered resource!'));
	} else if (!utils.isString(id) && !utils.isNumber(id)) {
		deferred.reject(new errors.IllegalArgumentError(errorPrefix + 'id: Must be a string or a number!', { id: { actual: typeof id, expected: 'string|number' } }));
	} else if (!utils.isObject(options)) {
		deferred.reject(new errors.IllegalArgumentError(errorPrefix + 'options: Must be an object!', { options: { actual: typeof options, expected: 'object' } }));
	} else {
		var _this = this;

		try {
			var resource = store[resourceName];

			if (id in resource.index && !options.bypassCache) {
				deferred.resolve(_this.get(resourceName, id));
			} else {
				var url = utils.makePath(resource.baseUrl || services.$config.baseUrl, resource.endpoint || resource.name, id),
					config = null;

				if (options.bypassCache) {
					config = {
						headers: {
							'Last-Modified': new Date(resource.modified[id])
						}
					};
				}
				GET(url, config).then(function (data) {
					try {
						_this.inject(resourceName, data);
						deferred.resolve(_this.get(resourceName, id));
					} catch (err) {
						deferred.reject(err);
					}
				}, deferred.reject);
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

module.exports = find;
