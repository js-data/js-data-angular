var errorPrefix = 'DS.get(resourceName, id[, options]): ';

/**
 * @doc method
 * @id DS.sync_methods:get
 * @name get
 * @description
 * Synchronously return the resource with the given id. The data store will forward the request to the server if the
 * item is not in the cache and `loadFromServer` is set to `true` in the options hash.
 *
 * ## Signature:
 * ```js
 * DS.get(resourceName, id[, options])
 * ```
 *
 * ## Example:
 *
 * ```js
 * DS.get('document', 5'); // { author: 'John Anderson', id: 5 }
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to retrieve.
 * @param {object=} options Optional configuration. Properties:
 * - `{boolean=}` - `loadFromServer` - Send the query to server if it has not been sent yet. Default: `false`.
 * @returns {object} The item of the type specified by `resourceName` with the primary key specified by `id`.
 */
function get(resourceName, id, options) {
  var IA = this.errors.IA;

  options = options || {};

  if (!this.definitions[resourceName]) {
    throw new this.errors.NER(errorPrefix + resourceName);
  } else if (!this.utils.isString(id) && !this.utils.isNumber(id)) {
    throw new IA(errorPrefix + 'id: Must be a string or a number!');
  } else if (!this.utils.isObject(options)) {
    throw new IA(errorPrefix + 'options: Must be an object!');
  }
  var _this = this;

  // cache miss, request resource from server
  var item = this.store[resourceName].index.get(id);
  if (!item && options.loadFromServer) {
    this.find(resourceName, id).then(null, function (err) {
      return _this.$q.reject(err);
    });
  }

  // return resource from cache
  return item;
}

module.exports = get;
