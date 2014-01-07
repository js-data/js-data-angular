var utils = require('utils'),
	errors = require('errors'),
	store = require('store');

/**
 * @doc method
 * @id DS.sync_methods:previous
 * @name previous
 * @description
 * `previous(resourceName, id)`
 *
 * Synchronously return the previous attributes of the item of the type specified by `resourceName` that has the primary key
 * specified by `id`. This object represents the state of the item the last time it was saved via an async adapter.
 *
 * Example:
 *
 * ```js
 * TODO: previous(resourceName, id) example
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}` - Argument `id` must be a string or a number.
 * - `{RuntimeError}` - Argument `resourceName` must refer to an already registered resource.
 * - `{UnhandledError}` - Thrown for any uncaught exception.
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item whose previous attributes are to be retrieved.
 * @returns {object} The previous attributes of the item of the type specified by `resourceName` with the primary key specified by `id`.
 */
function previous(resourceName, id) {
	if (!store[resourceName]) {
		throw new errors.IllegalArgumentError('DS.previous(resourceName, id): ' + resourceName + ' is not a registered resource!');
	} else if (!utils.isString(id) && !utils.isNumber(id)) {
		throw new errors.IllegalArgumentError('DS.previous(resourceName, id): id: Must be a string or a number!', { id: { actual: typeof id, expected: 'string|number' } });
	}

	try {
		// return resource from cache
		return angular.copy(store[resourceName].previous_attributes[id]);
	} catch (err) {
		throw new errors.UnhandledError(err);
	}
}

module.exports = previous;
