var utils = require('utils'),
	errors = require('errors'),
	services = require('services'),
	errorPrefix = 'DS.lastModified(resourceName[, id]): ';

/**
 * @doc method
 * @id DS.sync_methods:lastModified
 * @name lastModified
 * @description
 * Return the timestamp of the last time either the collection for `resourceName` or the item of type `resourceName`
 * with the given primary key was modified.
 *
 * ## Signature:
 * ```js
 * DS.lastModified(resourceName[, id])
 * ```
 *
 * ## Example:
 *
 * ```js
 *  DS.lastModified('document', 5); // undefined
 *
 *  DS.find('document', 5).then(function (document) {
 *      DS.lastModified('document', 5); // 1234235825494
 *  });
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{RuntimeError}`
 * - `{UnhandledError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number=} id The primary key of the item to remove.
 * @returns {number} The timestamp of the last time either the collection for `resourceName` or the item of type
 * `resourceName` with the given primary key was modified.
 */
function lastModified(resourceName, id) {
	if (!services.store[resourceName]) {
		throw new errors.RuntimeError(errorPrefix + resourceName + ' is not a registered resource!');
	} else if (id && !utils.isString(id) && !utils.isNumber(id)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'id: Must be a string or a number!', { id: { actual: typeof id, expected: 'string|number' } });
	}
	try {
		if (id) {
			if (!(id in services.store[resourceName].modified)) {
				services.store[resourceName].modified[id] = 0;
			}
			return services.store[resourceName].modified[id];
		}
		return services.store[resourceName].collectionModified;
	} catch (err) {
		throw new errors.UnhandledError(err);
	}
}

module.exports = lastModified;
