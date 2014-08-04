var errorPrefix = 'DS.find(resourceName, id[, options]): ';

/**
 * @doc method
 * @id DS.async_methods:find
 * @name find
 * @description
 * Asynchronously return the resource with the given id from the server. The result will be added to the data
 * store when it returns from the server.
 *
 * ## Signature:
 * ```js
 * DS.find(resourceName, id[, options])
 * ```
 *
 * ## Example:
 *
 * ```js
 *  DS.get('document', 5); // undefined
 *  DS.find('document', 5).then(function (document) {
 *      document; // { id: 5, author: 'John Anderson' }
 *
 *      DS.get('document', 5); // { id: 5, author: 'John Anderson' }
 *  }, function (err) {
 *      // Handled errors
 *  });
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to retrieve.
 * @param {object=} options Optional configuration. Properties:
 *
 * - `{boolean=}` - `bypassCache` - Bypass the cache. Default: `false`.
 * - `{boolean=}` - `cacheResponse` - Inject the data returned by the server into the data store. Default: `true`.
 *
 * @returns {Promise} Promise produced by the `$q` service.
 *
 * ## Resolves with:
 *
 * - `{object}` - `item` - The item with the primary key specified by `id`.
 *
 * ## Rejects with:
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 */
function find(resourceName, id, options) {
  var deferred = this.$q.defer();
  var promise = deferred.promise;

  try {
    var IA = this.errors.IA;

    options = options || {};

    if (!this.definitions[resourceName]) {
      throw new this.errors.NER(errorPrefix + resourceName);
    } else if (!this.utils.isString(id) && !this.utils.isNumber(id)) {
      throw new IA(errorPrefix + 'id: Must be a string or a number!');
    } else if (!this.utils.isObject(options)) {
      throw new IA(errorPrefix + 'options: Must be an object!');
    }

    if (!('cacheResponse' in options)) {
      options.cacheResponse = true;
    }

    var definition = this.definitions[resourceName];
    var resource = this.store[resourceName];
    var _this = this;

    if (options.bypassCache || !options.cacheResponse) {
      delete resource.completedQueries[id];
    }

    if (!(id in resource.completedQueries)) {
      if (!(id in resource.pendingQueries)) {
        promise = resource.pendingQueries[id] = _this.adapters[options.adapter || definition.defaultAdapter].find(definition, id, options)
          .then(function (res) {
            var data = definition.deserialize(resourceName, res);
            if (options.cacheResponse) {
              // Query is no longer pending
              delete resource.pendingQueries[id];
              resource.completedQueries[id] = new Date().getTime();
              return _this.inject(resourceName, data);
            } else {
              return data;
            }
          }, function (err) {
            delete resource.pendingQueries[id];
            return _this.$q.reject(err);
          });
      }

      return resource.pendingQueries[id];
    } else {
      deferred.resolve(_this.get(resourceName, id));
    }
  } catch (err) {
    deferred.reject(err);
  }

  return promise;
}

module.exports = find;
