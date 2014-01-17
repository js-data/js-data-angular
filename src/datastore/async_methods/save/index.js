var utils = require('utils'),
	errors = require('errors'),
	services = require('services'),
	errorPrefix = 'DS.save(resourceName, id[, options]): ';

/**
 * @doc method
 * @id DS.async_methods:save
 * @name save
 * @description
 * Save the item of the type specified by `resourceName` that has the primary key specified by `id`.
 *
 * ## Signature:
 * ```js
 * DS.save(resourceName, id[, options])
 * ```
 *
 * ## Example:
 *
 * ```js
 *  var document = DS.get('document', 'ee7f3f4d-98d5-4934-9e5a-6a559b08479f');
 *
 *  document.title = 'How to cook in style';
 *
 *  DS.save('document', 'ee7f3f4d-98d5-4934-9e5a-6a559b08479f')
 *  .then(function (document) {
 *      document; // A reference to the document that's been saved to the server
 *  });
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to retrieve.
 * @param {object=} options Optional configuration. Properties:
 * - `{string=}` - `mergeStrategy` - When the updated item returns from the server, specify the merge strategy that
 * should be used when the updated item is injected into the data store. Default: `"mergeWithExisting"`.
 *
 * @returns {Promise} Promise produced by the `$q` service.
 *
 * ## Resolves with:
 *
 * - `{object}` - `item` - A reference to the newly saved item.
 *
 * ## Rejects with:
 *
 * - `{IllegalArgumentError}`
 * - `{RuntimeError}`
 * - `{UnhandledError}`
 */
function save(resourceName, id, options) {
	var deferred = services.$q.defer(),
		promise = deferred.promise;

	options = options || {};

	if (!services.store[resourceName]) {
		deferred.reject(new errors.RuntimeError(errorPrefix + resourceName + ' is not a registered resource!'));
	} else if (!utils.isString(id) && !utils.isNumber(id)) {
		deferred.reject(new errors.IllegalArgumentError(errorPrefix + 'id: Must be a string or a number!', { id: { actual: typeof id, expected: 'string|number' } }));
	} else if (!utils.isObject(options)) {
		deferred.reject(new errors.IllegalArgumentError(errorPrefix + 'options: Must be an object!', { options: { actual: typeof options, expected: 'object' } }));
	} else if (!(id in services.store[resourceName].index)) {
		deferred.reject(new errors.RuntimeError(errorPrefix + 'id: "' + id + '" not found!'));
	} else {
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
				return services.$q.promisify(resource.beforeUpdate)(resourceName, attrs);
			})
			.then(function (attrs) {
				return services.adapters[resource.defaultAdapter].PUT(utils.makePath(resource.baseUrl, resource.endpoint, id), attrs, null);
			})
			.then(function (data) {
				return services.$q.promisify(resource.afterUpdate)(resourceName, data);
			})
			.then(function (data) {
				var saved = _this.inject(resource.name, data, options);
				resource.previous_attributes[id] = utils.deepMixIn({}, data);
				resource.saved[id] = utils.updateTimestamp(resource.saved[id]);
				return saved;
			});

		deferred.resolve(resource.index[id]);
	}

	return promise;
}

module.exports = save;
