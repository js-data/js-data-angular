var utils = require('utils'),
	errors = require('errors'),
	services = require('services'),
	errorPrefix = 'DS.hasChanges(resourceName, id): ';

function diffIsEmpty(diff) {
	return !(utils.isEmpty(diff.added) &&
		utils.isEmpty(diff.removed) &&
		utils.isEmpty(diff.changed));
}

/**
 * @doc method
 * @id DS.sync_methods:hasChanges
 * @name hasChanges
 * @description
 * Synchronously return whether object of the item of the type specified by `resourceName` that has the primary key
 * specified by `id` has changes.
 *
 * ## Signature:
 * ```js
 * DS.hasChanges(resourceName, id)
 * ```
 *
 * ## Example:
 *
 * ```js
 * var d = DS.get('document', 5); // { author: 'John Anderson', id: 5 }
 *
 * d.author = 'Sally';
 *
 * DS.hasChanges('document', 5); // true
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{RuntimeError}`
 * - `{UnhandledError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item.
 * @returns {boolean} Whether the item of the type specified by `resourceName` with the primary key specified by `id` has changes.
 */
function hasChanges(resourceName, id) {
	if (!services.store[resourceName]) {
		throw new errors.RuntimeError(errorPrefix + resourceName + ' is not a registered resource!');
	} else if (!utils.isString(id) && !utils.isNumber(id)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'id: Must be a string or a number!', { id: { actual: typeof id, expected: 'string|number' } });
	}

	try {
		// return resource from cache
		if (id in services.store[resourceName].changes) {
			return diffIsEmpty(services.store[resourceName].changes[id]);
		} else {
			return false;
		}
	} catch (err) {
		throw new errors.UnhandledError(err);
	}
}

module.exports = hasChanges;
