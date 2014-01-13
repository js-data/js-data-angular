var utils = require('utils'),
	errors = require('errors'),
	store = require('store'),
	errorPrefix = 'DS.get(resourceName, id): ';

/**
 * @doc method
 * @id DS.sync_methods:get
 * @name get
 * @description
 * Synchronously return the resource with the given id. The data store will forward the request to the server if the
 * item is not in the cache.
 *
 * ## Signature:
 * ```js
 * DS.get(resourceName, id)
 * ```
 *
 * ## Example:
 *
 * ```js
 * TODO: get(resourceName, id) example
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{RuntimeError}`
 * - `{UnhandledError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to retrieve.
 * @returns {object} The item of the type specified by `resourceName` with the primary key specified by `id`.
 */
function get(resourceName, id) {
	if (!store[resourceName]) {
		throw new errors.RuntimeError(errorPrefix + resourceName + ' is not a registered resource!');
	} else if (!utils.isString(id) && !utils.isNumber(id)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'id: Must be a string or a number!', { id: { actual: typeof id, expected: 'string|number' } });
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
