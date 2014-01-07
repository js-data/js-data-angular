var utils = require('utils'),
	errors = require('errors'),
	store = require('store');

function diffIsEmpty(diff) {
	return utils.isEmpty(diff.added) &&
		utils.isEmpty(diff.removed) &&
		utils.isEmpty(diff.changed);
}

/**
 * @doc method
 * @id DS.sync_methods:hasChanges
 * @name hasChanges
 * @description
 * `hasChanges(resourceName, id)`
 *
 * Synchronously return whether object of the item of the type specified by `resourceName` that has the primary key
 * specified by `id` has changes.
 *
 * Example:
 *
 * ```js
 * TODO: hasChanges(resourceName, id) example
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}` - Argument `id` must be a string or a number.
 * - `{RuntimeError}` - Argument `resourceName` must refer to an already registered resource.
 * - `{UnhandledError}` - Thrown for any uncaught exception.
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item.
 * @returns {boolean} Whether the item of the type specified by `resourceName` with the primary key specified by `id` has changes.
 */
function hasChanges(resourceName, id) {
	if (!store[resourceName]) {
		throw new errors.IllegalArgumentError('DS.hasChanges(resourceName, id): ' + resourceName + ' is not a registered resource!');
	} else if (!utils.isString(id) && !utils.isNumber(id)) {
		throw new errors.IllegalArgumentError('DS.hasChanges(resourceName, id): id: Must be a string or a number!', { id: { actual: typeof id, expected: 'string|number' } });
	}

	try {
		// return resource from cache
		return diffIsEmpty(store[resourceName].changes[id]);
	} catch (err) {
		throw new errors.UnhandledError(err);
	}
}

module.exports = hasChanges;
