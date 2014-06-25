var errorPrefix = 'DS.destroy(resourceName, id): ';

/**
 * @doc method
 * @id DS.async_methods:destroy
 * @name destroy
 * @description
 * Delete the item of the type specified by `resourceName` with the primary key specified by `id` from the data store
 * and the server.
 *
 * ## Signature:
 * ```js
 * DS.destroy(resourceName, id);
 * ```
 *
 * ## Example:
 *
 * ```js
 * DS.destroy('document', 'aab7ff66-e21e-46e2-8be8-264d82aee535')
 *  .then(function (id) {
 *      id; // 'aab7ff66-e21e-46e2-8be8-264d82aee535'
 *
 *      // The document is gone
 *      DS.get('document', 'aab7ff66-e21e-46e2-8be8-264d82aee535'); // undefined
 *  }, function (err) {
 *      // Handle error
 *  });
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to remove.
 * @param {object=} options Configuration options.
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
 * - `{UnhandledError}`
 */
function destroy(resourceName, id, options) {
  var deferred = this.$q.defer(),
    promise = deferred.promise;

  options = options || {};

  if (!this.definitions[resourceName]) {
    deferred.reject(new this.errors.RuntimeError(errorPrefix + resourceName + ' is not a registered resource!'));
  } else if (!this.utils.isString(id) && !this.utils.isNumber(id)) {
    deferred.reject(new this.errors.IllegalArgumentError(errorPrefix + 'id: Must be a string or a number!', { id: { actual: typeof id, expected: 'string|number' } }));
  } else {
    var item = this.get(resourceName, id);
    if (!item) {
      deferred.reject(new this.errors.RuntimeError(errorPrefix + 'id: "' + id + '" not found!'));
    } else {
      var definition = this.definitions[resourceName],
        resource = this.store[resourceName],
        _this = this;

      promise = promise
        .then(function (attrs) {
          return _this.$q.promisify(definition.beforeDestroy)(resourceName, attrs);
        })
        .then(function () {
          return _this.adapters[options.adapter || definition.defaultAdapter].destroy(definition, id, options);
        })
        .then(function () {
          return _this.$q.promisify(definition.afterDestroy)(resourceName, item);
        })
        .then(function () {
          _this.eject(resourceName, id);
          return id;
        });
      deferred.resolve(item);
    }
  }

  return promise;
}

module.exports = destroy;
