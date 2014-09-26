function errorPrefix(resourceName) {
  return 'DS.updateAll(' + resourceName + ', attrs, params[, options]): ';
}

/**
 * @doc method
 * @id DS.async methods:updateAll
 * @name updateAll
 * @description
 * The "U" in "CRUD". Update items of type `resourceName` with `attrs` according to the criteria specified by `params`.
 * This is useful when you want to update multiple items with the same attributes or you don't want to update the items
 * in the data store until the adapter operation succeeds. The resulting items (by default) will be injected into the
 * data store.
 *
 * ## Signature:
 * ```js
 * DS.updateAll(resourceName, attrs, params[, options])
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
 *
 * DS.updateAll('document', 5, {
 *   author: 'Sally'
 * }, params).then(function (documents) {
 *   documents; // The documents that were updated via an adapter
 *              // and now reside in the data store
 *
 *   documents[0].author; // "Sally"
 * });
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {object} attrs The attributes with which to update the items.
 * @param {object} params Parameter object that is serialized into the query string. Default properties:
 *
 *  - `{object=}` - `where` - Where clause.
 *  - `{number=}` - `limit` - Limit clause.
 *  - `{number=}` - `skip` - Skip clause.
 *  - `{number=}` - `offset` - Same as skip.
 *  - `{string|array=}` - `orderBy` - OrderBy clause.
 *
 * @param {object=} options Optional configuration. Also passed along to the adapter's `updateAll` method. Properties:
 *
 * - `{boolean=}` - `cacheResponse` - Inject the items returned by the adapter into the data store. Default: `true`.
 *
 * @returns {Promise} Promise produced by the `$q` service.
 *
 * ## Resolves with:
 *
 * - `{array}` - `items` - The items returned by the adapter.
 *
 * ## Rejects with:
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 */
function updateAll(resourceName, attrs, params, options) {
  var DS = this;
  var deferred = DS.$q.defer();

  try {
    var IA = DS.errors.IA;
    var definition = DS.definitions[resourceName];

    options = options || {};

    if (!definition) {
      throw new DS.errors.NER(errorPrefix(resourceName) + resourceName);
    } else if (!DS.utils.isObject(attrs)) {
      throw new IA(errorPrefix(resourceName) + 'attrs: Must be an object!');
    } else if (!DS.utils.isObject(params)) {
      throw new IA(errorPrefix(resourceName) + 'params: Must be an object!');
    } else if (!DS.utils.isObject(options)) {
      throw new IA(errorPrefix(resourceName) + 'options: Must be an object!');
    }

    if (!('cacheResponse' in options)) {
      options.cacheResponse = true;
    }

    if (!('notify' in options)) {
      options.notify = definition.notify;
    }

    deferred.resolve(attrs);

    return deferred.promise
      .then(function (attrs) {
        var func = options.beforeValidate ? DS.$q.promisify(options.beforeValidate) : definition.beforeValidate;
        return func.call(attrs, resourceName, attrs);
      })
      .then(function (attrs) {
        var func = options.validate ? DS.$q.promisify(options.validate) : definition.validate;
        return func.call(attrs, resourceName, attrs);
      })
      .then(function (attrs) {
        var func = options.afterValidate ? DS.$q.promisify(options.afterValidate) : definition.afterValidate;
        return func.call(attrs, resourceName, attrs);
      })
      .then(function (attrs) {
        var func = options.beforeUpdate ? DS.$q.promisify(options.beforeUpdate) : definition.beforeUpdate;
        return func.call(attrs, resourceName, attrs);
      })
      .then(function (attrs) {
        if (options.notify) {
          DS.emit(definition, 'beforeUpdate', DS.utils.merge({}, attrs));
        }
        return DS.adapters[options.adapter || definition.defaultAdapter].updateAll(definition, options.serialize ? options.serialize(resourceName, attrs) : definition.serialize(resourceName, attrs), params, options);
      })
      .then(function (res) {
        var func = options.afterUpdate ? DS.$q.promisify(options.afterUpdate) : definition.afterUpdate;
        var attrs = options.deserialize ? options.deserialize(resourceName, res) : definition.deserialize(resourceName, res);
        return func.call(attrs, resourceName, attrs);
      })
      .then(function (attrs) {
        if (options.notify) {
          DS.emit(definition, 'afterUpdate', DS.utils.merge({}, attrs));
        }
        if (options.cacheResponse) {
          return DS.inject(definition.name, attrs, options);
        } else {
          return attrs;
        }
      });
  } catch (err) {
    deferred.reject(err);
    return deferred.promise;
  }
}

module.exports = updateAll;
