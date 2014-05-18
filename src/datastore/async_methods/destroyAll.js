var errorPrefix = 'DS.destroyAll(resourceName, params[, options]): ';

/**
 * @doc method
 * @id DS.async_methods:destroyAll
 * @name destroyAll
 * @description
 * Asynchronously return the resource from the server filtered by the query. The results will be added to the data
 * store when it returns from the server.
 *
 * ## Signature:
 * ```js
 * DS.destroyAll(resourceName, params[, options])
 * ```
 *
 * ## Example:
 *
 * ```js
 *  var query = {
 *      where: {
 *          author: {
 *              '==': 'John Anderson'
 *          }
 *      }
 *  };
 *
 *  DS.destroyAll('document', {
 *      query: query
 *  }).then(function (documents) {
 *      // The documents are gone from the data store
 *      DS.filter('document', {
 *          query: query
 *      }); // []
 *
 *  }, function (err) {
 *      // handle error
 *  });
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {object} params Parameter object that is serialized into the query string. Properties:
 *
 * - `{object=}` - `query` - The query object by which to filter items of the type specified by `resourceName`. Properties:
 *      - `{object=}` - `where` - Where clause.
 *      - `{number=}` - `limit` - Limit clause.
 *      - `{skip=}` - `skip` - Skip clause.
 *      - `{orderBy=}` - `orderBy` - OrderBy clause.
 *
 * @param {object=} options Optional configuration. Properties:
 * - `{boolean=}` - `bypassCache` - Bypass the cache. Default: `false`.
 *
 * @returns {Promise} Promise produced by the `$q` service.
 *
 * ## Rejects with:
 *
 * - `{IllegalArgumentError}`
 * - `{RuntimeError}`
 * - `{UnhandledError}`
 */
function destroyAll(resourceName, params, options) {
	var deferred = this.$q.defer(),
		promise = deferred.promise,
		_this = this;

	options = options || {};

	if (!this.definitions[resourceName]) {
		deferred.reject(new this.errors.RuntimeError(errorPrefix + resourceName + ' is not a registered resource!'));
	} else if (!this.utils.isObject(params)) {
		deferred.reject(new this.errors.IllegalArgumentError(errorPrefix + 'params: Must be an object!'));
	} else if (!this.utils.isObject(options)) {
		deferred.reject(new this.errors.IllegalArgumentError(errorPrefix + 'options: Must be an object!'));
	} else {
		try {
			var definition = this.definitions[resourceName];

			promise = promise
				.then(function () {
					return _this.adapters[options.adapter || definition.defaultAdapter].destroyAll(definition, params, options);
				})
				.then(function () {
					return _this.ejectAll(resourceName, params);
				});
			deferred.resolve();
		} catch (err) {
			deferred.reject(new this.errors.UnhandledError(err));
		}
	}

	return promise;
}

module.exports = destroyAll;
