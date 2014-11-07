function errorPrefix(resourceName, id) {
  return 'DS.find(' + resourceName + ', ' + id + '[, options]): ';
}

/**
 * @doc method
 * @id DS.async methods:find
 * @name find
 * @description
 * The "R" in "CRUD". Delegate to the `find` method of whichever adapter is being used (http by default) and inject the
 * resulting item into the data store.
 *
 * ## Signature:
 * ```js
 * DS.find(resourceName, id[, options])
 * ```
 *
 * ## Example:
 *
 * ```js
 * DS.get('document', 5); // undefined
 * DS.find('document', 5).then(function (document) {
 *   document; // { id: 5, author: 'John Anderson' }
 *
 *   // the document is now in the data store
 *   DS.get('document', 5); // { id: 5, author: 'John Anderson' }
 * });
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to retrieve.
 * @param {object=} options Optional configuration. Also passed along to the adapter's `find` method. Properties:
 *
 * - `{boolean=}` - `useClass` - Whether to wrap the injected item with the resource's instance constructor.
 * - `{boolean=}` - `bypassCache` - Bypass the cache. Default: `false`.
 * - `{boolean=}` - `cacheResponse` - Inject the data returned by the adapter into the data store. Default: `true`.
 *
 * @returns {Promise} Promise produced by the `$q` service.
 *
 * ## Resolves with:
 *
 * - `{object}` - `item` - The item returned by the adapter.
 *
 * ## Rejects with:
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 */
function find(resourceName, id, options) {
  var DS = this;
  var DSUtils = DS.utils;
  var deferred = DS.$q.defer();
  var promise = deferred.promise;

  try {
    var IA = DS.errors.IA;
    var definition = DS.definitions[resourceName];

    options = options || {};

    if (!definition) {
      throw new DS.errors.NER(errorPrefix(resourceName, id) + resourceName);
    } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
      throw new IA(errorPrefix(resourceName, id) + 'id: Must be a string or a number!');
    } else if (!DSUtils.isObject(options)) {
      throw new IA(errorPrefix(resourceName, id) + 'options: Must be an object!');
    }

    options = DSUtils._(definition, options);

    var resource = DS.store[resourceName];

    if (options.bypassCache || !options.cacheResponse) {
      delete resource.completedQueries[id];
    }

    if (!(id in resource.completedQueries)) {
      if (!(id in resource.pendingQueries)) {
        promise = resource.pendingQueries[id] = DS.adapters[options.adapter || definition.defaultAdapter].find(definition, id, options)
          .then(function (res) {
            var data = options.deserialize ? options.deserialize(resourceName, res) : definition.deserialize(resourceName, res);
            // Query is no longer pending
            delete resource.pendingQueries[id];
            if (options.cacheResponse) {
              resource.completedQueries[id] = new Date().getTime();
              return DS.inject(resourceName, data, options);
            } else {
              return DS.createInstance(resourceName, data, options);
            }
          }, function (err) {
            delete resource.pendingQueries[id];
            return DS.$q.reject(err);
          });
      }

      return resource.pendingQueries[id];
    } else {
      deferred.resolve(DS.get(resourceName, id));
    }
  } catch (err) {
    deferred.reject(err);
  }

  return promise;
}

module.exports = find;
