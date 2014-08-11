function errorPrefix(resourceName) {
  return 'DS.findAll(' + resourceName + ', params[, options]): ';
}

function processResults(data, resourceName, queryHash) {
  var resource = this.store[resourceName];
  var idAttribute = this.definitions[resourceName].idAttribute;
  var date = new Date().getTime();

  data = data || [];

  // Query is no longer pending
  delete resource.pendingQueries[queryHash];
  resource.completedQueries[queryHash] = date;

  // Update modified timestamp of collection
  resource.collectionModified = this.utils.updateTimestamp(resource.collectionModified);

  // Merge the new values into the cache
  var injected = this.inject(resourceName, data);

  // Make sure each object is added to completedQueries
  if (this.utils.isArray(injected)) {
    angular.forEach(injected, function (item) {
      if (item && item[idAttribute]) {
        resource.completedQueries[item[idAttribute]] = date;
      }
    });
  } else {
    this.$log.warn(errorPrefix(resourceName) + 'response is expected to be an array!');
    resource.completedQueries[injected[idAttribute]] = date;
  }

  return injected;
}

function _findAll(resourceName, params, options) {
  var definition = this.definitions[resourceName];
  var resource = this.store[resourceName];
  var _this = this;
  var queryHash = _this.utils.toJson(params);

  if (options.bypassCache || !options.cacheResponse) {
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
              return processResults.apply(_this, [data, resourceName, queryHash]);
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
 *
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

  try {
    var IA = this.errors.IA;
    var _this = this;

    options = options || {};
    params = params || {};

    if (!this.definitions[resourceName]) {
      throw new this.errors.NER(errorPrefix(resourceName) + resourceName);
    } else if (!this.utils.isObject(params)) {
      throw new IA(errorPrefix(resourceName) + 'params: Must be an object!');
    } else if (!this.utils.isObject(options)) {
      throw new IA(errorPrefix(resourceName) + 'options: Must be an object!');
    }

    if (!('cacheResponse' in options)) {
      options.cacheResponse = true;
    }

    promise = promise.then(function () {
      return _findAll.apply(_this, [resourceName, params, options]);
    });
    deferred.resolve();
  } catch (err) {
    deferred.reject(err);
  }

  return promise;
}

module.exports = findAll;
