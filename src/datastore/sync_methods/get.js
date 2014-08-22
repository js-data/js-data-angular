function errorPrefix(resourceName, id) {
  return 'DS.get(' + resourceName + ', ' + id + '): ';
}

/**
 * @doc method
 * @id DS.sync methods:get
 * @name get
 * @description
 * Synchronously return the resource with the given id. The data store will forward the request to an adapter if
 * `loadFromServer` is `true` in the options hash.
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
 * @param {object=} options Optional configuration. Also passed along to `DS.find` if `loadFromServer` is `true`. Properties:
 *
 * - `{boolean=}` - `loadFromServer` - Send the query to server if it has not been sent yet. Default: `false`.
 *
 * @returns {object} The item of the type specified by `resourceName` with the primary key specified by `id`.
 */
function get(resourceName, id, options) {
  var DS = this;
  var IA = DS.errors.IA;

  options = options || {};

  if (!DS.definitions[resourceName]) {
    throw new DS.errors.NER(errorPrefix(resourceName, id) + resourceName);
  } else if (!DS.utils.isString(id) && !DS.utils.isNumber(id)) {
    throw new IA(errorPrefix(resourceName, id) + 'id: Must be a string or a number!');
  } else if (!DS.utils.isObject(options)) {
    throw new IA(errorPrefix(resourceName, id) + 'options: Must be an object!');
  }
  // cache miss, request resource from server
  var item = DS.store[resourceName].index.get(id);
  if (!item && options.loadFromServer) {
    DS.find(resourceName, id, options).then(null, function (err) {
      return DS.$q.reject(err);
    });
  }

  // return resource from cache
  return item;
}

module.exports = get;
