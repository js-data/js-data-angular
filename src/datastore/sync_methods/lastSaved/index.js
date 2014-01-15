var utils = require('utils'),
	errors = require('errors'),
	services = require('services');

/**
 * @doc method
 * @id DS.sync_methods:lastSaved
 * @name lastSaved
 * @description
 * `lastSaved(resourceName[, id])`
 *
 * Return the timestamp of the last time either the collection for `resourceName` or the item of type `resourceName`
 * with the given primary key was saved via an async adapter.
 *
 * Example:
 *
 * ```js
 * TODO: lastSaved(resourceName, id) example
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}` - Argument `id` must be a string or a number.
 * - `{RuntimeError}` - Argument `resourceName` must refer to an already registered resource.
 * - `{UnhandledError}` - Thrown for any uncaught exception.
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number=} id The primary key of the item to remove.
 * @returns {number} The timestamp of the last time either the collection for `resourceName` or the item of type
 * `resourceName` with the given primary key was modified.
 */
function lastSaved(resourceName, id) {
	if (!services.store[resourceName]) {
		throw new errors.RuntimeError('DS.lastSaved(resourceName[, id]): ' + resourceName + ' is not a registered resource!');
	} else if (id && !utils.isString(id) && !utils.isNumber(id)) {
		throw new errors.IllegalArgumentError('DS.lastSaved(resourceName[, id]): id: Must be a string or number!', { id: { actual: typeof id, expected: 'string|number' } });
	}
	try {
		if (id) {
			if (!(id in services.store[resourceName].saved)) {
				services.store[resourceName].saved[id] = 0;
			}
			return services.store[resourceName].saved[id];
		}
		return services.store[resourceName].collectionModified;
	} catch (err) {
		throw new errors.UnhandledError(err);
	}
}

module.exports = lastSaved;
