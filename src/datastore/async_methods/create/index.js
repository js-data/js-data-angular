var utils = require('utils'),
	errors = require('errors'),
	store = require('store'),
	services = require('services'),
	errorPrefix = 'DS.create(resourceName, attrs): ';

/**
 * @doc method
 * @id DS.async_methods:create
 * @name create
 * @description
 * Create a new resource and save it to the server.
 *
 * ## Signature:
 * ```js
 * DS.create(resourceName, attrs)
 * ```
 *
 * ## Example:
 *
 * ```js
 * DS.create('document', { author: 'John Anderson' })
 *  .then(function (document) {
 *      document; // { id: 'aab7ff66-e21e-46e2-8be8-264d82aee535', author: 'John Anderson' }
 *
 *      // The new document is already in the data store
 *      DS.get('document', document.id); // { id: 'aab7ff66-e21e-46e2-8be8-264d82aee535', author: 'John Anderson' }
 *  }, function (err) {
 *      // handle error
 *  });
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {object} attrs The attributes with which to update the item of the type specified by `resourceName` that has
 * the primary key specified by `id`.
 * @returns {Promise} Promise produced by the `$q` service.
 *
 * ## Resolves with:
 *
 * - `{object}` - `item` - A reference to the newly created item.
 *
 * ## Rejects with:
 *
 * - `{IllegalArgumentError}`
 * - `{RuntimeError}`
 * - `{UnhandledError}`
 */
function create(resourceName, attrs) {
	var deferred = $q.defer();
	if (!store[resourceName]) {
		deferred.reject(new errors.RuntimeError(errorPrefix + resourceName + ' is not a registered resource!'));
	} else if (!utils.isObject(attrs)) {
		deferred.reject(new errors.IllegalArgumentError(errorPrefix + 'attrs: Must be an object!', { attrs: { actual: typeof attrs, expected: 'object' } }));
	}

	try {
		var resource = store[resourceName],
			_this = this,
			url = utils.makePath(resource.baseUrl || services.$config.baseUrl, resource.endpoint || resource.name);

		if (resource.validate) {
			resource.validate(attrs, null, function (err) {
				if (err) {
					deferred.reject(err);
				} else {

					_this.POST(url, attrs, null).then(function (data) {
						try {
							deferred.resolve(_this.inject(resource.name, data));
						} catch (err) {
							deferred.reject(err);
						}
					}, deferred.reject);
				}
			});
		} else {
			_this.POST(url, attrs, null).then(function (data) {
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
