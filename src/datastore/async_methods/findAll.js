var errorPrefix = 'DS.findAll(resourceName, params[, options]): ';

function processResults(utils, data, resourceName, queryHash) {
  var resource = this.store[resourceName];

  data = data || [];

  // Query is no longer pending
  delete resource.pendingQueries[queryHash];
  resource.completedQueries[queryHash] = new Date().getTime();

  // Update modified timestamp of collection
  resource.collectionModified = utils.updateTimestamp(resource.collectionModified);

  // Merge the new values into the cache
  return this.inject(resourceName, data);
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
      resource.pendingQueries[queryHash] = _this.adapters[options.adapter || definition.defaultAdapter].findAll(definition, params, options)
        .then(function (res) {
          var data = definition.deserialize(resourceName, res);
          if (options.cacheResponse) {
            try {
              return processResults.apply(_this, [utils, data, resourceName, queryHash]);
            } catch (err) {
              return _this.$q.reject(err);
            }
          } else {
            return data;
          }
        }, function (err) {
          delete resource.pendingQueries[queryHash];
          return _this.$q.reject(err);
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
 *  var params = {
 *      where: {
 *          author: {
 *              '==': 'John Anderson'
 *          }
 *      }
 *  };
 *
 *  DS.findAll('document', params).then(function (documents) {
 *      documents;  // [{ id: '1', author: 'John Anderson', title: 'How to cook' },
 *                  //  { id: '2', author: 'John Anderson', title: 'How NOT to cook' }]
 *
 *      // The documents are now in the data store
 *      DS.filter('document', params); // [{ id: '1', author: 'John Anderson', title: 'How to cook' },
 *                                     //  { id: '2', author: 'John Anderson', title: 'How NOT to cook' }]
 *
 *  }, function (err) {
 *      // handle error
 *  });
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {object=} params Parameter object that is serialized into the query string. Properties:
 *
 * - `{object=}` - `where` - Where clause.
 * - `{number=}` - `limit` - Limit clause.
 * - `{number=}` - `skip` - Skip clause.
 * - `{number=}` - `offset` - Same as skip.
 * - `{string|array=}` - `orderBy` - OrderBy clause.
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
 * - `{NonexistentResourceError}`
 */
function findAll(resourceName, params, options) {
  var deferred = this.$q.defer();
  var promise = deferred.promise;
  var _this = this;

  options = options || {};
  params = params || {};

  if (!this.definitions[resourceName]) {
    deferred.reject(new this.errors.NER(errorPrefix + resourceName));
  } else if (!this.utils.isObject(params)) {
    deferred.reject(new this.errors.IA(errorPrefix + 'params: Must be an object!'));
  } else if (!this.utils.isObject(options)) {
    deferred.reject(new this.errors.IA(errorPrefix + 'options: Must be an object!'));
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
      deferred.reject(err);
    }
  }

  return promise;
}

module.exports = findAll;
