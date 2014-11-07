function errorPrefix(resourceName) {
  return 'DS.getAll(' + resourceName + '[, ids]): ';
}

/**
 * @doc method
 * @id DS.sync methods:getAll
 * @name getAll
 * @description
 * Synchronously return all items of the given resource, or optionally, a subset based on the given primary keys.
 *
 * ## Signature:
 * ```js
 * DS.getAll(resourceName[, ids])
 * ```
 *
 * ## Example:
 *
 * ```js
 * DS.getAll('document'); // [{ author: 'John Anderson', id: 5 }]
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {array} ids Optional list of primary keys by which to filter the results.
 *
 * @returns {array} The items of the type specified by `resourceName`.
 */
function getAll(resourceName, ids) {
  var DS = this;
  var IA = DS.errors.IA;
  var resource = DS.store[resourceName];
  var collection = [];

  if (!DS.definitions[resourceName]) {
    throw new DS.errors.NER(errorPrefix(resourceName) + resourceName);
  } else if (ids && !DS.utils.isArray(ids)) {
    throw new IA(errorPrefix(resourceName, ids) + 'ids: Must be an array!');
  }

  if (DS.utils.isArray(ids)) {
    for (var i = 0; i < ids.length; i++) {
      if (resource.index.get(ids[i])) {
        collection.push(resource.index.get(ids[i]));
      }
    }
  } else {
    collection = resource.collection.slice();
  }

  return collection;
}

module.exports = getAll;
