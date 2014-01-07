var utils = require('utils'),
	errors = require('errors'),
	store = require('store'),
	PUT = require('../../HTTP').PUT;

/**
 * @doc method
 * @id DS.async_methods:refresh
 * @name refresh
 * @description
 * `refresh(resourceName, id)`
 *
 * Like find(), except the resource is only refreshed from the server if it already exists in the data store.
 *
 * Example:
 *
 * ```js
 * TODO: refresh(resourceName, id) example
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}` - Argument `id` must be a string or a number.
 * - `{RuntimeError}` - Argument `resourceName` must refer to an already registered resource.
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to refresh from the server.
 * @returns {false|Promise} `false` if the item doesn't already exist in the data store. A `Promise` if the item does
 * exist in the data store and is being refreshed.
 *
 * ## ResolvesWith:
 *
 * - `{object}` - `item` - A reference to the refreshed item.
 *
 * ## RejectsWith:
 *
 * - `{IllegalArgumentError}` - `err` - Argument `id` must be a string or a number.
 * - `{RuntimeError}` - `err` - Argument `resourceName` must refer to an already registered resource.
 * - `{UnhandledError}` - `err` - Thrown for any uncaught exception.
 */
function refresh(resourceName, id) {
	if (!store[resourceName]) {
		throw new errors.RuntimeError('DS.refresh(resourceName, id): ' + resourceName + ' is not a registered resource!');
	} else if (!utils.isString(id) && !utils.isNumber(id)) {
		throw new errors.IllegalArgumentError('DS.refresh(resourceName, id): id: Must be a string or a number!', { id: { actual: typeof id, expected: 'string|number' } });
	}

	if (id in store[resourceName].index) {
		return this.find(resourceName, id, true);
	} else {
		return false;
	}
}

module.exports = refresh;
