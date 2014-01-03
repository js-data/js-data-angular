var utils = require('../../utils'),
	errors = require('../../errors'),
	store = require('../store'),
	services = require('../services'),
	PUT = require('../HTTP').PUT;

/**
 * @doc method
 * @id DS.async_methods:update
 * @name update(name, id, attrs)
 * @description
 * Update the item of the type specified by `resourceName` that has the primary key specified by `id` with the given
 * attributes.
 *
 * Example:
 *
 * ```js
 * TODO: update(resourceName, id, attrs) example
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to retrieve.
 * @param {object} attrs The attributes with which to update the item of the type specified by `resourceName` that has
 * the primary key specified by `id`.
 * @returns {Promise} Promise produced by the `$q` service.
 *
 * ## ResolvesWith:
 *
 * - `{object}` - `item` - A reference to the newly updated item.
 *
 * ## RejectsWith:
 *
 * - `{IllegalArgumentError}` - `err` - Argument `id` must be a string or a number.
 * - `{RuntimeError}` - `err` - Argument `resourceName` must refer to an already registered resource.
 * - `{UnhandledError}` - `err` - Thrown for any uncaught exception.
 */
function update(resourceName, id, attrs) {
	var deferred = $q.defer();
	if (!store[resourceName]) {
		deferred.reject(new errors.RuntimeError('DS.update(resourceName, id, attrs): ' + resourceName + ' is not a registered resource!'));
	} else if (!utils.isString(id) && !utils.isNumber(id)) {
		deferred.reject(new errors.IllegalArgumentError('DS.update(resourceName, id, attrs): id: Must be a string or a number!', { id: { actual: typeof id, expected: 'string|number' } }));
	} else if (!utils.isObject(attrs)) {
		deferred.reject(new errors.IllegalArgumentError('DS.update(resourceName, id, attrs): attrs: Must be an object!', { attrs: { actual: typeof attrs, expected: 'object' } }));
	}

	try {
		var resource = store[resourceName];

		PUT(resource.baseUrl + '/' + (resource.endpoint || resourceName + '/' + id), attrs, null).then(function (data) {
			if (resource.index[id]) {
				utils.deepMixIn(resource.index[id], data);
			} else {
				resource.index[id] = attrs;
				resource.collection.push(resource.index[id]);
			}
			resource.modified[id] = utils.updateTimestamp(resource.modified[id]);
			resource.collectionModified = utils.updateTimestamp(resource.collectionModified);
			deferred.resolve(data);
		}, deferred.reject);
	} catch (err) {
		deferred.reject(new errors.UnhandledError(err));
	}

	return deferred.promise;
}

module.exports = update;
