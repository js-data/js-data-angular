function errorPrefix(resourceName) {
  return 'DS.findAll(' + resourceName + ', params[, options]): ';
}

function processResults(data, resourceName, queryHash, options) {
  var DS = this;
  var DSUtils = DS.utils;
  var resource = DS.store[resourceName];
  var idAttribute = DS.definitions[resourceName].idAttribute;
  var date = new Date().getTime();

  data = data || [];

  // Query is no longer pending
  delete resource.pendingQueries[queryHash];
  resource.completedQueries[queryHash] = date;

  // Update modified timestamp of collection
  resource.collectionModified = DSUtils.updateTimestamp(resource.collectionModified);

  // Merge the new values into the cache
  var injected = DS.inject(resourceName, data, options);

  // Make sure each object is added to completedQueries
  if (DSUtils.isArray(injected)) {
    angular.forEach(injected, function (item) {
      if (item && item[idAttribute]) {
        resource.completedQueries[item[idAttribute]] = date;
      }
    });
  } else {
    DS.$log.warn(errorPrefix(resourceName) + 'response is expected to be an array!');
    resource.completedQueries[injected[idAttribute]] = date;
  }

  return injected;
}

function _findAll(resourceName, params, options) {
  var DS = this;
  var DSUtils = DS.utils;
  var definition = DS.definitions[resourceName];
  var resource = DS.store[resourceName];
  var queryHash = DSUtils.toJson(params);

  if (options.bypassCache || !options.cacheResponse) {
    delete resource.completedQueries[queryHash];
  }

  if (!(queryHash in resource.completedQueries)) {
    // This particular query has never been completed

    if (!(queryHash in resource.pendingQueries)) {

      // This particular query has never even been made
      resource.pendingQueries[queryHash] = DS.adapters[options.adapter || definition.defaultAdapter].findAll(definition, params, options)
        .then(function (res) {
          delete resource.pendingQueries[queryHash];
          var data = options.deserialize ? options.deserialize(resourceName, res) : definition.deserialize(resourceName, res);
          if (options.cacheResponse) {
            try {
              return processResults.call(DS, data, resourceName, queryHash, options);
            } catch (err) {
              return DS.$q.reject(err);
            }
          } else {
            DSUtils.forEach(data, function (item, i) {
              data[i] = DS.createInstance(resourceName, item, options);
            });
            return data;
          }
        }, function (err) {
          delete resource.pendingQueries[queryHash];
          return DS.$q.reject(err);
        });
    }

    return resource.pendingQueries[queryHash];
  } else {
    return DS.filter(resourceName, params, options);
  }
}

/**
 * @doc method
 * @id DS.async methods:findAll
 * @name findAll
 * @description
 * The "R" in "CRUD". Delegate to the `findAll` method of whichever adapter is being used (http by default) and inject
 * the resulting collection into the data store.
 *
 * ## Signature:
 * ```js
 * DS.findAll(resourceName, params[, options])
 * ```
 *
 * ## Example:
 *
 * ```js
 * var params = {
 *   where: {
 *     author: {
 *       '==': 'John Anderson'
 *     }
 *   }
 * };
 *
 * DS.filter('document', params); // []
 * DS.findAll('document', params).then(function (documents) {
 *   documents;  // [{ id: '1', author: 'John Anderson', title: 'How to cook' },
 *               //  { id: '2', author: 'John Anderson', title: 'How NOT to cook' }]
 *
 *   // The documents are now in the data store
 *   DS.filter('document', params); // [{ id: '1', author: 'John Anderson', title: 'How to cook' },
 *                                  //  { id: '2', author: 'John Anderson', title: 'How NOT to cook' }]
 * });
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {object=} params Parameter object that is serialized into the query string. Default properties:
 *
 * - `{object=}` - `where` - Where clause.
 * - `{number=}` - `limit` - Limit clause.
 * - `{number=}` - `skip` - Skip clause.
 * - `{number=}` - `offset` - Same as skip.
 * - `{string|array=}` - `orderBy` - OrderBy clause.
 *
 * @param {object=} options Optional configuration. Also passed along to the adapter's `findAll` method. Properties:
 *
 * - `{boolean=}` - `useClass` - Whether to wrap the injected item with the resource's instance constructor.
 * - `{boolean=}` - `bypassCache` - Bypass the cache. Default: `false`.
 * - `{boolean=}` - `cacheResponse` - Inject the data returned by the adapter into the data store. Default: `true`.
 *
 * @returns {Promise} Promise produced by the `$q` service.
 *
 * ## Resolves with:
 *
 * - `{array}` - `items` - The collection of items returned by the adapter.
 *
 * ## Rejects with:
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 */
function findAll(resourceName, params, options) {
  var DS = this;
  var DSUtils = DS.utils;
  var deferred = DS.$q.defer();
  var definition = DS.definitions[resourceName];

  try {
    var IA = DS.errors.IA;

    options = options || {};
    params = params || {};

    if (!definition) {
      throw new DS.errors.NER(errorPrefix(resourceName) + resourceName);
    } else if (!DSUtils.isObject(params)) {
      throw new IA(errorPrefix(resourceName) + 'params: Must be an object!');
    } else if (!DSUtils.isObject(options)) {
      throw new IA(errorPrefix(resourceName) + 'options: Must be an object!');
    }

    options = DSUtils._(definition, options);

    deferred.resolve();

    return deferred.promise.then(function () {
      return _findAll.call(DS, resourceName, params, options);
    });
  } catch (err) {
    deferred.reject(err);
    return deferred.promise;
  }
}

module.exports = findAll;
