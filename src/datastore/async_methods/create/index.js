var errorPrefix = 'DS.create(resourceName, attrs): ';

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
 * @param {object=} options Configuration options.
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
function create(resourceName, attrs, options) {
	var deferred = this.$q.defer(),
		promise = deferred.promise;

	options = options || {};

	if (!this.definitions[resourceName]) {
		deferred.reject(new this.errors.RuntimeError(errorPrefix + resourceName + ' is not a registered resource!'));
	} else if (!this.utils.isObject(attrs)) {
		deferred.reject(new this.errors.IllegalArgumentError(errorPrefix + 'attrs: Must be an object!', { attrs: { actual: typeof attrs, expected: 'object' } }));
	} else {
		try {
			var definition = this.definitions[resourceName],
				_this = this;

			promise = promise
				.then(function (attrs) {
					return _this.$q.promisify(definition.beforeValidate)(resourceName, attrs);
				})
				.then(function (attrs) {
					return _this.$q.promisify(definition.validate)(resourceName, attrs);
				})
				.then(function (attrs) {
					return _this.$q.promisify(definition.afterValidate)(resourceName, attrs);
				})
				.then(function (attrs) {
					return _this.$q.promisify(definition.beforeCreate)(resourceName, attrs);
				})
				.then(function (attrs) {
					return _this.adapters[options.adapter || definition.defaultAdapter].create(definition, attrs, options);
				})
				.then(function (data) {
					return _this.$q.promisify(definition.afterCreate)(resourceName, data);
				})
				.then(function (data) {
					return _this.inject(definition.name, data);
				});

			deferred.resolve(attrs);
		} catch (err) {
			deferred.reject(new this.errors.UnhandledError(err));
		}
	}

	return promise;
}

module.exports = create;
