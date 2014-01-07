var utils = require('utils'),
	errors = require('errors'),
	store = require('store'),
	services = require('services'),
	PUT = require('../../HTTP').PUT;

function _save(deferred, resource, id, attrs) {
	var _this = this;
	PUT(utils.makePath(resource.url, id), attrs, null).then(function (data) {
		var saved = _this.inject(resource.name, data);
		resource.saved[saved[resource.idAttribute]] = utils.saveTimestamp(resource.saved[saved[resource.idAttribute]]);
		deferred.resolve(saved);
	}, deferred.reject);
}

/**
 * @doc method
 * @id DS.async_methods:save
 * @name save
 * @description
 * `save(resourceName, id)`
 *
 * save the item of the type specified by `resourceName` that has the primary key specified by `id`.
 *
 * Example:
 *
 * ```js
 * TODO: save(resourceName, id) example
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to retrieve.
 * @returns {Promise} Promise produced by the `$q` service.
 *
 * ## ResolvesWith:
 *
 * - `{object}` - `item` - A reference to the newly saved item.
 *
 * ## RejectsWith:
 *
 * - `{IllegalArgumentError}` - `err` - Argument `id` must be a string or a number.
 * - `{RuntimeError}` - `err` - Argument `resourceName` must refer to an already registered resource.
 * - `{UnhandledError}` - `err` - Thrown for any uncaught exception.
 */
function save(resourceName, id) {
	var deferred = $q.defer();
	if (!store[resourceName]) {
		deferred.reject(new errors.RuntimeError('DS.save(resourceName, id, attrs): ' + resourceName + ' is not a registered resource!'));
	} else if (!utils.isString(id) && !utils.isNumber(id)) {
		deferred.reject(new errors.IllegalArgumentError('DS.save(resourceName, id, attrs): id: Must be a string or a number!', { id: { actual: typeof id, expected: 'string|number' } }));
	}

	var _this = this;

	try {
		var resource = store[resourceName];

		if (resource.validate) {
			resource.validate(resource.index[resource.idAttribute || 'id'], function (err) {
				if (err) {
					deferred.reject(err);
				} else {
					_save.call(_this, deferred, resource, id);
				}
			});
		} else {
			_save.call(_this, deferred, resource, id);
		}
	} catch (err) {
		deferred.reject(new errors.UnhandledError(err));
	}

	return deferred.promise;
}

module.exports = save;
