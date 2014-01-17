var errorPrefix = 'DS.save(resourceName, id[, options]): ';

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
	var deferred = this.$q.defer(),
		promise = deferred.promise;

	options = options || {};

	if (!this.definitions[resourceName]) {
		deferred.reject(new this.errors.RuntimeError(errorPrefix + resourceName + ' is not a registered resource!'));
	} else if (!this.utils.isString(id) && !this.utils.isNumber(id)) {
		deferred.reject(new this.errors.IllegalArgumentError(errorPrefix + 'id: Must be a string or a number!', { id: { actual: typeof id, expected: 'string|number' } }));
	} else if (!this.utils.isObject(options)) {
		deferred.reject(new this.errors.IllegalArgumentError(errorPrefix + 'options: Must be an object!', { options: { actual: typeof options, expected: 'object' } }));
	} else if (!(id in this.store[resourceName].index)) {
		deferred.reject(new this.errors.RuntimeError(errorPrefix + 'id: "' + id + '" not found!'));
	} else {
		var definition = this.definitions[resourceName],
			resource = this.store[resourceName],
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
				return _this.$q.promisify(definition.beforeUpdate)(resourceName, attrs);
			})
			.then(function (attrs) {
				return _this.adapters[options.adapter || definition.defaultAdapter].update(definition, attrs, options);
			})
			.then(function (data) {
				return _this.$q.promisify(definition.afterUpdate)(resourceName, data);
			})
			.then(function (data) {
				var saved = _this.inject(definition.name, data, options);
				resource.previousAttributes[id] = _this.utils.deepMixIn({}, data);
				resource.saved[id] = _this.utils.updateTimestamp(resource.saved[id]);
				return saved;
			});

		deferred.resolve(resource.index[id]);
	}

	return promise;
}

module.exports = save;
