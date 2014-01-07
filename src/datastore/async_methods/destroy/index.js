var utils = require('utils'),
	errors = require('errors'),
	store = require('store');

/**
 * @doc method
 * @id DS.async_methods:destroy
 * @name destroy
 * @description
 * `destroy(resourceName, id)`
 *
 * Delete the item of the type specified by `resourceName` with the primary key specified by `id` from the data store
 * and the server.
 *
 * Example:
 *
 * ```js
 * TODO: destroy(type, id) example
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to remove.
 * @returns {Promise} Promise produced by the `$q` service.
 *
 * ## ResolvesWith:
 *
 * - `{string|number}` - `id` - The primary key of the destroyed item.
 *
 * ## RejectsWith:
 *
 * - `{IllegalArgumentError}` - `err` - Argument `id` must be a string or a number.
 * - `{RuntimeError}` - `err` - Argument `resourceName` must refer to an already registered resource.
 * - `{UnhandledError}` - `err` - Thrown for any uncaught exception.
 */
function destroy(resourceName, id) {
	var deferred = $q.defer();
	if (!store[resourceName]) {
		deferred.reject(new errors.RuntimeError('DS.destroy(resourceName, id): ' + resourceName + ' is not a registered resource!'));
	} else if (!utils.isString(id) && !utils.isNumber(id)) {
		deferred.reject(new errors.IllegalArgumentError('DS.destroy(resourceName, id): id: Must be a string or a number!', { id: { actual: typeof id, expected: 'string|number' } }));
	}

	try {
		var resource = store[resourceName],
			_this = this;

		_this.DEL(utils.makePath(resource.url, id), null).then(function () {
			try {
				_this.eject(resourceName, id);
				deferred.resolve(id);
			} catch (err) {
				deferred.reject(err);
			}
		}, deferred.reject);
	} catch (err) {
		deferred.reject(new errors.UnhandledError(err));
	}

	return deferred.promise;
}

module.exports = destroy;
