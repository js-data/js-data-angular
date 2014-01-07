var utils = require('utils'),
	errors = require('errors'),
	store = require('store'),
	services = require('services');

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
		var resource = store[resourceName],
			_this = this;

		if (resource.validate) {
			resource.validate(attrs, null, function (err) {
				if (err) {
					deferred.reject(err);
				} else {
					_this.POST(resource.url, attrs, null).then(function (data) {
						try {
							deferred.resolve(_this.inject(resource.name, data));
						} catch (err) {
							deferred.reject(err);
						}
					}, deferred.reject);
				}
			});
		} else {
			_this.POST(resource.url, attrs, null).then(function (data) {
				try {
					deferred.resolve(_this.inject(resource.name, data));
				} catch (err) {
					deferred.reject(err);
				}
			}, deferred.reject);
		}
	} catch (err) {
		deferred.reject(new errors.UnhandledError(err));
	}

	return deferred.promise;
}

module.exports = create;
