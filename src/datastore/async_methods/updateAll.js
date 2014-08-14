function errorPrefix(resourceName) {
  return 'DS.updateAll(' + resourceName + ', attrs, params[, options]): ';
}

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
 *      where: {
 *          author: {
 *              '==': 'John Anderson'
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
 *  - `{object=}` - `where` - Where clause.
 *  - `{number=}` - `limit` - Limit clause.
 *  - `{number=}` - `skip` - Skip clause.
 *  - `{number=}` - `offset` - Same as skip.
 *  - `{string|array=}` - `orderBy` - OrderBy clause.
 *
 * @param {object=} options Optional configuration. Properties:
 *
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
 * - `{NonexistentResourceError}`
 */
function updateAll(resourceName, attrs, params, options) {
  var DS = this;
  var deferred = DS.$q.defer();
  var promise = deferred.promise;

  try {
    var IA = DS.errors.IA;

    options = options || {};

    if (!DS.definitions[resourceName]) {
      throw new DS.errors.NER(errorPrefix(resourceName) + resourceName);
    } else if (!DS.utils.isObject(attrs)) {
      throw new IA(errorPrefix(resourceName) + 'attrs: Must be an object!');
    } else if (!DS.utils.isObject(params)) {
      throw new IA(errorPrefix(resourceName) + 'params: Must be an object!');
    } else if (!DS.utils.isObject(options)) {
      throw new IA(errorPrefix(resourceName) + 'options: Must be an object!');
    }

    var definition = DS.definitions[resourceName];

    if (!('cacheResponse' in options)) {
      options.cacheResponse = true;
    }

    promise = promise
      .then(function (attrs) {
        return DS.$q.promisify(definition.beforeValidate)(resourceName, attrs);
      })
      .then(function (attrs) {
        return DS.$q.promisify(definition.validate)(resourceName, attrs);
      })
      .then(function (attrs) {
        return DS.$q.promisify(definition.afterValidate)(resourceName, attrs);
      })
      .then(function (attrs) {
        return DS.$q.promisify(definition.beforeUpdate)(resourceName, attrs);
      })
      .then(function (attrs) {
        return DS.adapters[options.adapter || definition.defaultAdapter].updateAll(definition, definition.serialize(resourceName, attrs), params, options);
      })
      .then(function (res) {
        return DS.$q.promisify(definition.afterUpdate)(resourceName, definition.deserialize(resourceName, res));
      })
      .then(function (data) {
        if (options.cacheResponse) {
          return DS.inject(definition.name, data, options);
        } else {
          return data;
        }
      });

    deferred.resolve(attrs);
  } catch (err) {
    deferred.reject(err);
  }

  return promise;
}

module.exports = updateAll;
