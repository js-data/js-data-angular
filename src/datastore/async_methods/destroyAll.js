function errorPrefix(resourceName) {
  return 'DS.destroyAll(' + resourceName + ', params[, options]): ';
}

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
 *  var params = {
 *      where: {
 *          author: {
 *              '==': 'John Anderson'
 *          }
 *      }
 *  };
 *
 *  DS.destroyAll('document', params).then(function (documents) {
 *      // The documents are gone from the data store
 *      DS.filter('document', params); // []
 *
 *  }, function (err) {
 *      // handle error
 *  });
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {object} params Parameter object that is serialized into the query string. Properties:
 *
 *  - `{object=}` - `where` - Where clause.
 *  - `{number=}` - `limit` - Limit clause.
 *  - `{number=}` - `skip` - Skip clause.
 *  - `{number=}` - `offset` - Same as skip.
 *  - `{string|array=}` - `orderBy` - OrderBy clause.
 *
 * @param {object=} options Optional configuration. Properties:
 *
 * - `{boolean=}` - `bypassCache` - Bypass the cache. Default: `false`.
 *
 * @returns {Promise} Promise produced by the `$q` service.
 *
 * ## Rejects with:
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 */
function destroyAll(resourceName, params, options) {
  var deferred = this.$q.defer();
  var promise = deferred.promise;

  try {
    var _this = this;
    var IA = this.errors.IA;

    options = options || {};

    if (!this.definitions[resourceName]) {
      throw new this.errors.NER(errorPrefix(resourceName) + resourceName);
    } else if (!this.utils.isObject(params)) {
      throw new IA(errorPrefix(resourceName) + 'params: Must be an object!');
    } else if (!this.utils.isObject(options)) {
      throw new IA(errorPrefix(resourceName) + 'options: Must be an object!');
    }

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
    deferred.reject(err);
  }

  return promise;
}

module.exports = destroyAll;
