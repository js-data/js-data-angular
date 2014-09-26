function errorPrefix(resourceName, id) {
  return 'DS.update(' + resourceName + ', ' + id + ', attrs[, options]): ';
}

/**
 * @doc method
 * @id DS.async methods:update
 * @name update
 * @description
 * The "U" in "CRUD". Update the item of type `resourceName` and primary key `id` with `attrs`. This is useful when you
 * want to update an item that isn't already in the data store, or you don't want to update the item that's in the data
 * store until the adapter operation succeeds. This differs from `DS.save` which simply saves items in their current
 * form that already exist in the data store. The resulting item (by default) will be injected into the data store.
 *
 * ## Signature:
 * ```js
 * DS.update(resourceName, id, attrs[, options])
 * ```
 *
 * ## Example:
 *
 * ```js
 * DS.get('document', 5); // undefined
 *
 * DS.update('document', 5, {
 *   title: 'How to cook in style'
 * }).then(function (document) {
 *   document; // A reference to the document that's been saved via an adapter
 *             // and now resides in the data store
 * });
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to update.
 * @param {object} attrs The attributes with which to update the item.
 * @param {object=} options Optional configuration. Also passed along to the adapter's `update` method. Properties:
 *
 * - `{boolean=}` - `cacheResponse` - Inject the data returned by the adapter into the data store. Default: `true`.
 * - `{function=}` - `beforeValidate` - Override the resource or global lifecycle hook.
 * - `{function=}` - `validate` - Override the resource or global lifecycle hook.
 * - `{function=}` - `afterValidate` - Override the resource or global lifecycle hook.
 * - `{function=}` - `beforeUpdate` - Override the resource or global lifecycle hook.
 * - `{function=}` - `afterUpdate` - Override the resource or global lifecycle hook.
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
function update(resourceName, id, attrs, options) {
  var DS = this;
  var deferred = DS.$q.defer();

  try {
    var IA = DS.errors.IA;
    var definition = DS.definitions[resourceName];

    options = options || {};

    id = DS.utils.resolveId(definition, id);
    if (!definition) {
      throw new DS.errors.NER(errorPrefix(resourceName, id) + resourceName);
    } else if (!DS.utils.isString(id) && !DS.utils.isNumber(id)) {
      throw new IA(errorPrefix(resourceName, id) + 'id: Must be a string or a number!');
    } else if (!DS.utils.isObject(attrs)) {
      throw new IA(errorPrefix(resourceName, id) + 'attrs: Must be an object!');
    } else if (!DS.utils.isObject(options)) {
      throw new IA(errorPrefix(resourceName, id) + 'options: Must be an object!');
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
        return DS.adapters[options.adapter || definition.defaultAdapter].update(definition, id, options.serialize ? options.serialize(resourceName, attrs) : definition.serialize(resourceName, attrs), options);
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
          var resource = DS.store[resourceName];
          var updated = DS.inject(definition.name, attrs, options);
          var id = updated[definition.idAttribute];
          resource.previousAttributes[id] = DS.utils.deepMixIn({}, updated);
          resource.saved[id] = DS.utils.updateTimestamp(resource.saved[id]);
          resource.observers[id].discardChanges();
          return DS.get(definition.name, id);
        } else {
          return attrs;
        }
      });
  } catch (err) {
    deferred.reject(err);
    return deferred.promise;
  }
}

module.exports = update;
