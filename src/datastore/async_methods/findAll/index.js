var errorPrefix = 'DS.findAll(resourceName, params[, options]): ';

function processResults(utils, data, resourceName, queryHash) {
	var resource = this.store[resourceName];

	data = data || [];

	// Query is no longer pending
	delete resource.pendingQueries[queryHash];
	resource.completedQueries[queryHash] = new Date().getTime();

	// Merge the new values into the cache
	for (var i = 0; i < data.length; i++) {
		this.inject(resourceName, data[i]);
	}

	// Update the data store's index for this resource
	resource.index = utils.toLookup(resource.collection, this.definitions[resourceName].idAttribute);

	// Update modified timestamp of collection
	resource.collectionModified = utils.updateTimestamp(resource.collectionModified);
	return data;
}

function _findAll(utils, resourceName, params, options) {
	var definition = this.definitions[resourceName],
		resource = this.store[resourceName],
		_this = this,
		queryHash = utils.toJson(params);

	if (options.bypassCache) {
		delete resource.completedQueries[queryHash];
	}

	if (!(queryHash in resource.completedQueries)) {
		// This particular query has never been completed

		if (!(queryHash in resource.pendingQueries)) {

			// This particular query has never even been made
			resource.pendingQueries[queryHash] = _this.adapters[options.adapter || definition.defaultAdapter].findAll(definition, { params: params }, options)
				.then(function (data) {
					if (options.cacheResponse) {
						try {
							return processResults.apply(_this, [utils, data, resourceName, queryHash]);
						} catch (err) {
							throw new _this.errors.UnhandledError(err);
						}
					} else {
						return data;
					}
				});
		}

		return resource.pendingQueries[queryHash];
	} else {
		return this.filter(resourceName, params, options);
	}
}

/**
 * @doc method
 * @id DS.async_methods:findAll
 * @name findAll
 * @description
 * Asynchronously return the resource from the server filtered by the query. The results will be added to the data
 * store when it returns from the server.
 *
 * ## Signature:
 * ```js
 * DS.findAll(resourceName, params[, options])
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
 *  DS.findAll('document', {
 *      query: query
 *  }).then(function (documents) {
 *      documents;  // [{ id: 'aab7ff66-e21e-46e2-8be8-264d82aee535', author: 'John Anderson', title: 'How to cook' },
 *                  //  { id: 'ee7f3f4d-98d5-4934-9e5a-6a559b08479f', author: 'John Anderson', title: 'How NOT to cook' }]
 *
 *      // The documents are now in the data store
 *      DS.filter('document', {
 *          query: query
 *      }); // [{ id: 'aab7ff66-e21e-46e2-8be8-264d82aee535', author: 'John Anderson', title: 'How to cook' },
 *          //  { id: 'ee7f3f4d-98d5-4934-9e5a-6a559b08479f', author: 'John Anderson', title: 'How NOT to cook' }]
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
 * - `{boolean=}` - `cacheResponse` - Inject the data returned by the server into the data store. Default: `true`.
 *
 * @returns {Promise} Promise produced by the `$q` service.
 *
 * ## Resolves with:
 *
 * - `{array}` - `items` - The collection of items returned by the server.
 *
 * ## Rejects with:
 *
 * - `{IllegalArgumentError}`
 * - `{RuntimeError}`
 * - `{UnhandledError}`
 */
function findAll(resourceName, params, options) {
	var deferred = this.$q.defer(),
		promise = deferred.promise,
		_this = this;

	options = options || {};

	if (!this.definitions[resourceName]) {
		deferred.reject(new this.errors.RuntimeError(errorPrefix + resourceName + ' is not a registered resource!'));
	} else if (!this.utils.isObject(params)) {
		deferred.reject(new this.errors.IllegalArgumentError(errorPrefix + 'params: Must be an object!', { params: { actual: typeof params, expected: 'object' } }));
	} else if (!this.utils.isObject(options)) {
		deferred.reject(new this.errors.IllegalArgumentError(errorPrefix + 'options: Must be an object!', { options: { actual: typeof options, expected: 'object' } }));
	} else {
		if (!('cacheResponse' in options)) {
			options.cacheResponse = true;
		} else {
			options.cacheResponse = !!options.cacheResponse;
		}
		try {
			promise = promise.then(function () {
				return _findAll.apply(_this, [_this.utils, resourceName, params, options]);
			});
			deferred.resolve();
		} catch (err) {
			deferred.reject(new this.errors.UnhandledError(err));
		}
	}

	return promise;
}

module.exports = findAll;
