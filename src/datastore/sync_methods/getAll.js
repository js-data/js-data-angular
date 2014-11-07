function errorPrefix(resourceName) {
  return 'DS.getAll(' + resourceName + '[, ids]): ';
}

/**
 * @doc method
 * @id DS.sync methods:getAll
 * @name getAll
 * @description
 * Synchronously return all of the resource.
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
 * @param {array} ids Optional list of primary keys to filter the array of results by.
 *
 * @returns {array} The items of the type specified by `resourceName`.
 */
function getAll(resourceName, ids) {
	var DS = this;
  var IA = DS.errors.IA;
  var resource;
  var collection = [];

  if (!DS.definitions[resourceName]) {
    throw new DS.errors.NER(errorPrefix(resourceName) + resourceName);
  } else if (arguments.length === 2 && !(ids instanceof Array)) {
    throw new IA(errorPrefix(resourceName, ids) + 'ids: Must be an array!');
  }

  resource = DS.store[resourceName];  

  if (ids instanceof Array) {
    for (var i = 0; i < ids.length; i++) {
      collection.push(resource.index.get(ids[i]));
    }
  } else {
    collection = resource.collection;
  }

  return collection;
}

module.exports = getAll;