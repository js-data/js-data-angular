var utils = require('../../../utils'),
	errors = require('../../../errors'),
	store = require('../../store');

/**
 * @doc method
 * @id DS.sync_methods:get
 * @name get
 * @description
 * `get(resourceName, id)`
 *
 * Synchronously return the resource with the given id. The data store will forward the request to the server if the
 * item is not in the cache.
 *
 * Example:
 *
 * ```js
 * TODO: get(resourceName, id) example
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}` - Argument `id` must be a string or a number.
 * - `{RuntimeError}` - Argument `resourceName` must refer to an already registered resource.
 * - `{UnhandledError}` - Thrown for any uncaught exception.
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to retrieve.
 * @returns {object} The item of the type specified by `resourceName` with the primary key specified by `id`.
 */
function get(resourceName, id) {
	if (!store[resourceName]) {
		throw new errors.IllegalArgumentError('DS.get(resourceName, id): ' + resourceName + ' is not a registered resource!');
	} else if (!utils.isString(id) && !utils.isNumber(id)) {
		throw new errors.IllegalArgumentError('DS.get(resourceName, id): id: Must be a string or a number!', { id: { actual: typeof id, expected: 'string|number' } });
	}

	try {
		// cache miss, request resource from server
		if (!(id in store[resourceName].index)) {
			this.find(resourceName, id);
		}

		// return resource from cache
		return store[resourceName].index[id];
	} catch (err) {
		throw new errors.UnhandledError(err);
	}
}

module.exports = get;
