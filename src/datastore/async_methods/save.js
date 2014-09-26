function errorPrefix(resourceName, id) {
  return 'DS.save(' + resourceName + ', ' + id + '[, options]): ';
}

/**
 * @doc method
 * @id DS.async methods:save
 * @name save
 * @description
 * The "U" in "CRUD". Persist a single item already in the store and in it's current form to whichever adapter is being
 * used (http by default) and inject the resulting item into the data store.
 *
 * ## Signature:
 * ```js
 * DS.save(resourceName, id[, options])
 * ```
 *
 * ## Example:
 *
 * ```js
 * var document = DS.get('document', 5);
 *
 * document.title = 'How to cook in style';
 *
 * DS.save('document', 5).then(function (document) {
 *   document; // A reference to the document that's been persisted via an adapter
 * });
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to save.
 * @param {object=} options Optional configuration. Also passed along to the adapter's `update` method. Properties:
 *
 * - `{boolean=}` - `cacheResponse` - Inject the data returned by the adapter into the data store. Default: `true`.
 * - `{boolean=}` - `changesOnly` - Only send changed and added values to the adapter. Default: `false`.
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
 * - `{RuntimeError}`
 * - `{NonexistentResourceError}`
 */
function save(resourceName, id, options) {
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
    } else if (!DS.utils.isObject(options)) {
      throw new IA(errorPrefix(resourceName, id) + 'options: Must be an object!');
    }

    var item = DS.get(resourceName, id);
    if (!item) {
      throw new DS.errors.R(errorPrefix(resourceName, id) + 'id: "' + id + '" not found!');
    }

    if (!('cacheResponse' in options)) {
      options.cacheResponse = true;
    }

    if (!('notify' in options)) {
      options.notify = definition.notify;
    }

    deferred.resolve(item);

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
        if (options.changesOnly) {
          var resource = DS.store[resourceName];
          resource.observers[id].deliver();
          var toKeep = [],
            changes = DS.changes(resourceName, id);

          for (var key in changes.added) {
            toKeep.push(key);
          }
          for (key in changes.changed) {
            toKeep.push(key);
          }
          changes = DS.utils.pick(attrs, toKeep);
          if (DS.utils.isEmpty(changes)) {
            // no changes, return
            return attrs;
          } else {
            attrs = changes;
          }
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
          var saved = DS.inject(definition.name, attrs, options);
          resource.previousAttributes[id] = DS.utils.deepMixIn({}, saved);
          resource.saved[id] = DS.utils.updateTimestamp(resource.saved[id]);
          resource.observers[id].discardChanges();
          return DS.get(resourceName, id);
        } else {
          return attrs;
        }
      });
  } catch (err) {
    deferred.reject(err);
    return deferred.promise;
  }
}

module.exports = save;
