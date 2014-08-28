function errorPrefix(resourceName, id) {
  return 'DS.destroy(' + resourceName + ', ' + id + '[, options]): ';
}

/**
 * @doc method
 * @id DS.async methods:destroy
 * @name destroy
 * @description
 * The "D" in "CRUD". Delegate to the `destroy` method of whichever adapter is being used (http by default) and eject the
 * appropriate item from the data store.
 *
 * ## Signature:
 * ```js
 * DS.destroy(resourceName, id[, options]);
 * ```
 *
 * ## Example:
 *
 * ```js
 * DS.destroy('document', 5).then(function (id) {
 *   id; // 5
 *
 *   // The document is gone
 *   DS.get('document', 5); // undefined
 * });
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to remove.
 * @param {object=} options Configuration options. Also passed along to the adapter's `destroy` method. Properties:
 *
 * - `{function=}` - `beforeDestroy` - Override the resource or global lifecycle hook.
 * - `{function=}` - `afterDestroy` - Override the resource or global lifecycle hook.
 *
 * @returns {Promise} Promise produced by the `$q` service.
 *
 * ## Resolves with:
 *
 * - `{string|number}` - `id` - The primary key of the destroyed item.
 *
 * ## Rejects with:
 *
 * - `{IllegalArgumentError}`
 * - `{RuntimeError}`
 * - `{NonexistentResourceError}`
 */
function destroy(resourceName, id, options) {
  var DS = this;
  var deferred = DS.$q.defer();

  try {
    var definition = DS.definitions[resourceName];

    options = options || {};

    if (!definition) {
      throw new DS.errors.NER(errorPrefix(resourceName, id) + resourceName);
    } else if (!DS.utils.isString(id) && !DS.utils.isNumber(id)) {
      throw new DS.errors.IA(errorPrefix(resourceName, id) + 'id: Must be a string or a number!');
    }

    var item = DS.get(resourceName, id);
    if (!item) {
      throw new DS.errors.R(errorPrefix(resourceName, id) + 'id: "' + id + '" not found!');
    }

    deferred.resolve(item);

    return deferred.promise
      .then(function (attrs) {
        var func = options.beforeDestroy ? DS.$q.promisify(options.beforeDestroy) : definition.beforeDestroy;
        return func.call(attrs, resourceName, attrs);
      })
      .then(function () {
        return DS.adapters[options.adapter || definition.defaultAdapter].destroy(definition, id, options);
      })
      .then(function () {
        var func = options.afterDestroy ? DS.$q.promisify(options.afterDestroy) : definition.afterDestroy;
        return func.call(item, resourceName, item);
      })
      .then(function () {
        DS.eject(resourceName, id);
        return id;
      });
  } catch (err) {
    deferred.reject(err);
    return deferred.promise;
  }
}

module.exports = destroy;
