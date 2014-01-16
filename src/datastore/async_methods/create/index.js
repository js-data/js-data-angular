var utils = require('utils'),
	errors = require('errors'),
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
	var deferred = services.$q.defer(),
		promise = deferred.promise;

	if (!services.store[resourceName]) {
		deferred.reject(new errors.RuntimeError(errorPrefix + resourceName + ' is not a registered resource!'));
	} else if (!utils.isObject(attrs)) {
		deferred.reject(new errors.IllegalArgumentError(errorPrefix + 'attrs: Must be an object!', { attrs: { actual: typeof attrs, expected: 'object' } }));
	} else {
		try {
			var resource = services.store[resourceName],
				_this = this;

			promise = promise
				.then(function (attrs) {
					return services.$q.promisify(resource.beforeValidate)(resourceName, attrs);
				})
				.then(function (attrs) {
					return services.$q.promisify(resource.validate)(resourceName, attrs);
				})
				.then(function (attrs) {
					return services.$q.promisify(resource.afterValidate)(resourceName, attrs);
				})
				.then(function (attrs) {
					return services.$q.promisify(resource.beforeCreate)(resourceName, attrs);
				})
				.then(function (attrs) {
					return _this.POST(utils.makePath(resource.baseUrl, resource.endpoint), attrs, null);
				})
				.then(function (data) {
					return services.$q.promisify(resource.afterCreate)(resourceName, data);
				})
				.then(function (data) {
					return _this.inject(resource.name, data);
				});

			deferred.resolve(attrs);
		} catch (err) {
			deferred.reject(new errors.UnhandledError(err));
		}
	}

	return promise;
}

module.exports = create;
