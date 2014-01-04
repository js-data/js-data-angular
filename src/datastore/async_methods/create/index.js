var utils = require('../../../utils'),
	errors = require('../../../errors'),
	store = require('../../store'),
	services = require('../../services'),
	POST = require('../../HTTP').POST;

function _create(deferred, resource, attrs) {
	POST(resource.url, attrs, null).then(function (data) {
		try {
			var idAttribute = resource.idAttribute || 'id';
			if (!data[idAttribute]) {
				deferred.reject(new errors.RuntimeError('DS.create(resourceName, attrs): The server must return an object that has the idAttribute specified by the resource definition!'));
			} else {
				resource.index[data[idAttribute]] = data;
				resource.modified[data[idAttribute]] = utils.updateTimestamp(resource.modified[data[idAttribute]]);
				resource.collection.push(resource.index[data[idAttribute]]);
				resource.collectionModified = utils.updateTimestamp(resource.collectionModified);
				deferred.resolve(resource.index[data[idAttribute]]);
			}
		} catch (err) {
			deferred.reject(new errors.UnhandledError(err));
		}
	}, deferred.reject);
}

/**
 * @doc method
 * @id DS.async_methods:create
 * @name create
 * @description
 * `create(resourceName, attrs)`
 *
 * Create a new resource.
 *
 * Example:
 *
 * ```js
 * TODO: create(resourceName, attrs)
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {object} attrs The attributes with which to update the item of the type specified by `resourceName` that has
 * the primary key specified by `id`.
 * @returns {Promise} Promise produced by the `$q` service.
 *
 * ## ResolvesWith:
 *
 * - `{object}` - `item` - A reference to the newly created item.
 *
 * ## RejectsWith:
 *
 * - `{IllegalArgumentError}` - `err` - Argument `attrs` must be an object.
 * - `{RuntimeError}` - `err` - Argument `resourceName` must refer to an already registered resource.
 * - `{UnhandledError}` - `err` - Thrown for any uncaught exception.
 */
function create(resourceName, attrs) {
	var deferred = $q.defer();
	if (!store[resourceName]) {
		deferred.reject(new errors.RuntimeError('DS.create(resourceName, attrs): ' + resourceName + ' is not a registered resource!'));
	} else if (!utils.isObject(attrs)) {
		deferred.reject(new errors.IllegalArgumentError('DS.create(resourceName, attrs): attrs: Must be an object!', { attrs: { actual: typeof attrs, expected: 'object' } }));
	}

	try {
		var resource = store[resourceName];

		if (resource.validate) {
			resource.validate(attrs, null, function (err) {
				if (err) {
					deferred.reject(err);
				} else {
					_create(deferred, resource, attrs);
				}
			});
		} else {
			_create(deferred, resource, attrs);
		}
	} catch (err) {
		deferred.reject(new errors.UnhandledError(err));
	}

	return deferred.promise;
}

module.exports = create;
