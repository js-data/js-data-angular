function errorPrefix(resourceName) {
  return 'DS.create(' + resourceName + ', attrs[, options]): ';
}

/**
 * @doc method
 * @id DS.async_methods:create
 * @name create
 * @description
 * The "C" in "CRUD". Delegate to the `create` method of whichever adapter is being used (http by default) and inject the
 * result into the data store.
 *
 * ## Signature:
 * ```js
 * DS.create(resourceName, attrs[, options])
 * ```
 *
 * ## Example:
 *
 * ```js
 * DS.create('document', {
 *   author: 'John Anderson'
 * }).then(function (document) {
 *   document; // { id: 5, author: 'John Anderson' }
 *
 *   // The new document is already in the data store
 *   DS.get('document', document.id); // { id: 5, author: 'John Anderson' }
 * });
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {object} attrs The attributes with which to create the item of the type specified by `resourceName`.
 * @param {object=} options Configuration options. Also passed along to the adapter's `create` method. Properties:
 *
 * - `{boolean=}` - `cacheResponse` - Inject the data returned by the adapter into the data store. Default: `true`.
 * - `{boolean=}` - `upsert` - If `attrs` already contains a primary key, then attempt to call `DS.update` instead. Default: `true`.
 *
 * @returns {Promise} Promise produced by the `$q` service.
 *
 * ## Resolves with:
 *
 * - `{object}` - `item` - A reference to the newly created item.
 *
 * ## Rejects with:
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 */
function create(resourceName, attrs, options) {
  var DS = this;
  var deferred = DS.$q.defer();
  var promise = deferred.promise;
  var definition = DS.definitions[resourceName];

  try {
    options = options || {};

    if (!definition) {
      throw new DS.errors.NER(errorPrefix(resourceName) + resourceName);
    } else if (!DS.utils.isObject(attrs)) {
      throw new DS.errors.IA(errorPrefix(resourceName) + 'attrs: Must be an object!');
    }
    var resource = DS.store[resourceName];

    if (!('cacheResponse' in options)) {
      options.cacheResponse = true;
    }

    if (!('upsert' in options)) {
      options.upsert = true;
    }

    if (options.upsert && attrs[definition.idAttribute]) {
      promise = DS.update(resourceName, attrs[definition.idAttribute], attrs, options);
    } else {
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
          return DS.$q.promisify(definition.beforeCreate)(resourceName, attrs);
        })
        .then(function (attrs) {
          return DS.adapters[options.adapter || definition.defaultAdapter].create(definition, definition.serialize(resourceName, attrs), options);
        })
        .then(function (res) {
          return DS.$q.promisify(definition.afterCreate)(resourceName, definition.deserialize(resourceName, res));
        })
        .then(function (data) {
          if (options.cacheResponse) {
            var created = DS.inject(definition.name, data);
            var id = created[definition.idAttribute];
            resource.completedQueries[id] = new Date().getTime();
            resource.previousAttributes[id] = DS.utils.deepMixIn({}, created);
            resource.saved[id] = DS.utils.updateTimestamp(resource.saved[id]);
            return DS.get(definition.name, id);
          } else {
            return data;
          }
        });
    }

    deferred.resolve(attrs);
  } catch (err) {
    deferred.reject(err);
  }

  return promise;
}

module.exports = create;
