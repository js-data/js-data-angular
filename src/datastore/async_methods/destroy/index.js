var utils = require('utils'),
	errors = require('errors'),
	services = require('services'),
	errorPrefix = 'DS.destroy(resourceName, id): ';

/**
 * @doc method
 * @id DS.async_methods:destroy
 * @name destroy
 * @description
 * Delete the item of the type specified by `resourceName` with the primary key specified by `id` from the data store
 * and the server.
 *
 * ## Signature:
 * ```js
 * DS.destroy(resourceName, id);
 * ```
 *
 * ## Example:
 *
 * ```js
 * DS.destroy('document', 'aab7ff66-e21e-46e2-8be8-264d82aee535')
 *  .then(function (id) {
 *      id; // 'aab7ff66-e21e-46e2-8be8-264d82aee535'
 *
 *      // The document is gone
 *      DS.get('document', 'aab7ff66-e21e-46e2-8be8-264d82aee535'); // undefined
 *  }, function (err) {
 *      // Handle error
 *  });
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to remove.
 * @returns {Promise} Promise produced by the `$q` service.
 *
 * ## Resolves with:
 *
 * - `{string|number}` - `id` - The primary key of the destroyed item.
 *
 * ## Rejects with:
 *
 * - `{IllegalArgumentError}`
 * - `{RuntimeError}`
 * - `{UnhandledError}`
 */
function destroy(resourceName, id) {
	var deferred = services.$q.defer(),
		promise = deferred.promise;

	if (!services.store[resourceName]) {
		deferred.reject(new errors.RuntimeError(errorPrefix + resourceName + ' is not a registered resource!'));
	} else if (!utils.isString(id) && !utils.isNumber(id)) {
		deferred.reject(new errors.IllegalArgumentError(errorPrefix + 'id: Must be a string or a number!', { id: { actual: typeof id, expected: 'string|number' } }));
	} else {
		var resource = services.store[resourceName],
			_this = this;

		promise = promise
			.then(function (attrs) {
				return services.$q.promisify(resource.beforeDestroy)(resourceName, attrs);
			})
			.then(function () {
				return _this.DEL(utils.makePath(resource.baseUrl, resource.endpoint, id), null);
			})
			.then(function () {
				return services.$q.promisify(resource.afterDestroy)(resourceName, resource.index[id]);
			})
			.then(function () {
				_this.eject(resourceName, id);
				return id;
			});

		deferred.resolve(resource.index[id]);
	}

	return promise;
}

module.exports = destroy;
