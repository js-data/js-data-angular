var utils = require('../../../utils'),
	errors = require('../../../errors'),
	store = require('../../store'),
	services = require('../../services'),
	PUT = require('../../HTTP').PUT;

function _update(deferred, resource, id, attrs) {
	PUT(utils.makePath(resource.url, id), attrs, null).then(function (data) {
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
}

/**
 * @doc method
 * @id DS.async_methods:update
 * @name update
 * @description
 * `update(resourceName, id, attrs)`
 *
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
		var resource = store[resourceName],
			validate = resource.updateValidate || resource.validate;

		if (validate) {
			validate(attrs, resource.index[resource.idAttribute || 'id'], function (err) {
				if (err) {
					deferred.reject(err);
				} else {
					_update(deferred, resource, id, attrs);
				}
			});
		} else {
			_update(deferred, resource, id, attrs);
		}
	} catch (err) {
		deferred.reject(new errors.UnhandledError(err));
	}

	return deferred.promise;
}

module.exports = update;
