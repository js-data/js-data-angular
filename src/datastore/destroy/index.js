var utils = require('../../utils'),
	errors = require('../../errors'),
	store = require('../store');

/**
 * @doc method
 * @id DS.async_methods:destroy
 * @name destroy(resourceName, id)
 * @description
 * Delete the item of the type specified by `resourceName` with the primary key specified by `id` from the data store
 * and the server.
 *
 * Example:
 *
 * ```js
 * TODO: destroy(name, id) example
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
		var resource = store[resourceName];

		this.DEL(resource.baseUrl + '/' + (resource.endpoint || resourceName + '/' + id), null).then(function (data) {
			try {
				delete resource.index[id];
				delete resource.modified[id];

				for (var i = 0; i < resource.collection.length; i++) {
					if (resource.collection[i][resource.idAttribute || 'id'] == id) {
						break;
					}
				}
				resource.collection.splice(i, 1);
				resource.collectionModified = utils.updateTimestamp(resource.collectionModified);
				deferred.resolve(id);
			} catch (err) {
				deferred.reject(new errors.UnhandledError(err));
			}
		}, deferred.reject);
	} catch (err) {
		deferred.reject(new errors.UnhandledError(err));
	}

	return deferred.promise;
}

module.exports = destroy;
