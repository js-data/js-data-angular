var errorPrefix = 'DS.updateAll(resourceName, attrs, params[, options]): ';

/**
 * @doc method
 * @id DS.async_methods:updateAll
 * @name updateAll
 * @description
 * Update items of type `resourceName` with `attrs` according to the criteria specified by `params`. This is useful when
 * you want to update multiple items with the same attributes that aren't already in the data store, or you don't want
 * to update the items that are in the data store until the server-side operation succeeds.
 *
 * ## Signature:
 * ```js
 * DS.updateAll(resourceName, attrs, params[, options])
 * ```
 *
 * ## Example:
 *
 * ```js
 *  DS.filter('document'); // []
 *
 *  DS.updateAll('document', 5, { author: 'Sally' }, {
 *      query: {
 *          where: {
 *              author: {
 *                  '==': 'John Anderson'
 *              }
 *          }
 *      }
 *  })
 *  .then(function (documents) {
 *      documents; // The documents that were updated on the server
 *                 // and now reside in the data store
 *
 *      documents[0].author; // "Sally"
 *  });
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {object} attrs The attributes with which to update the items.
 * @param {object} params Parameter object that is serialized into the query string. Properties:
 *
 * - `{object=}` - `query` - The query object by which to filter items of the type specified by `resourceName`. Properties:
 *      - `{object=}` - `where` - Where clause.
 *      - `{number=}` - `limit` - Limit clause.
 *      - `{skip=}` - `skip` - Skip clause.
 *      - `{orderBy=}` - `orderBy` - OrderBy clause.
 *
 * @param {object=} options Optional configuration. Properties:
 * - `{boolean=}` - `cacheResponse` - Inject the data returned by the server into the data store. Default: `true`.
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
function save(resourceName, attrs, params, options) {
	var deferred = this.$q.defer(),
		promise = deferred.promise;

	options = options || {};

	if (!this.definitions[resourceName]) {
		deferred.reject(new this.errors.RuntimeError(errorPrefix + resourceName + ' is not a registered resource!'));
	} else if (!this.utils.isObject(attrs)) {
		deferred.reject(new this.errors.IllegalArgumentError(errorPrefix + 'attrs: Must be an object!'));
	} else if (!this.utils.isObject(params)) {
		deferred.reject(new this.errors.IllegalArgumentError(errorPrefix + 'params: Must be an object!'));
	} else if (!this.utils.isObject(options)) {
		deferred.reject(new this.errors.IllegalArgumentError(errorPrefix + 'options: Must be an object!'));
	} else {
		var definition = this.definitions[resourceName],
			resource = this.store[resourceName],
			_this = this;

		if (!('cacheResponse' in options)) {
			options.cacheResponse = true;
		} else {
			options.cacheResponse = !!options.cacheResponse;
		}

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
				return _this.adapters[options.adapter || definition.defaultAdapter].updateAll(definition, attrs, params, options);
			})
			.then(function (data) {
				return _this.$q.promisify(definition.afterUpdate)(resourceName, data);
			})
			.then(function (data) {
				if (options.cacheResponse) {
					return _this.inject(definition.name, data, options);
				} else {
					return data;
				}
			});

		deferred.resolve(attrs);
	}
	return promise;
}

module.exports = save;
