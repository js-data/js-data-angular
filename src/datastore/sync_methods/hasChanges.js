function errorPrefix(resourceName, id) {
  return 'DS.hasChanges(' + resourceName + ', ' + id + '): ';
}

function diffIsEmpty(utils, diff) {
  return !(utils.isEmpty(diff.added) &&
    utils.isEmpty(diff.removed) &&
    utils.isEmpty(diff.changed));
}

/**
 * @doc method
 * @id DS.sync methods:hasChanges
 * @name hasChanges
 * @description
 * Synchronously return whether object of the item of the type specified by `resourceName` that has the primary key
 * specified by `id` has changes.
 *
 * ## Signature:
 * ```js
 * DS.hasChanges(resourceName, id)
 * ```
 *
 * ## Example:
 *
 * ```js
 * var d = DS.get('document', 5); // { author: 'John Anderson', id: 5 }
 *
 * d.author = 'Sally';
 *
 * // You may have to do $scope.$apply() first
 *
 * DS.hasChanges('document', 5); // true
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item.
 * @returns {boolean} Whether the item of the type specified by `resourceName` with the primary key specified by `id` has changes.
 */
function hasChanges(resourceName, id) {
  var DS = this;

  id = DS.utils.resolveId(DS.definitions[resourceName], id);
  if (!DS.definitions[resourceName]) {
    throw new DS.errors.NER(errorPrefix(resourceName, id) + resourceName);
  } else if (!DS.utils.isString(id) && !DS.utils.isNumber(id)) {
    throw new DS.errors.IA(errorPrefix(resourceName, id) + 'id: Must be a string or a number!');
  }

  // return resource from cache
  if (DS.get(resourceName, id)) {
    return diffIsEmpty(DS.utils, DS.changes(resourceName, id));
  } else {
    return false;
  }
}

module.exports = hasChanges;
