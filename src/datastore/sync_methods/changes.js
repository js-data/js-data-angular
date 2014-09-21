function errorPrefix(resourceName) {
  return 'DS.changes(' + resourceName + ', id): ';
}

/**
 * @doc method
 * @id DS.sync methods:changes
 * @name changes
 * @description
 * Synchronously return the changes object of the item of the type specified by `resourceName` that has the primary key
 * specified by `id`. This object represents the diff between the item in its current state and the state of the item
 * the last time it was saved via an adapter.
 *
 * ## Signature:
 * ```js
 * DS.changes(resourceName, id)
 * ```
 *
 * ## Example:
 *
 * ```js
 * var d = DS.get('document', 5); // { author: 'John Anderson', id: 5 }
 *
 * d.author = 'Sally';
 *
 * // You might have to do $scope.$apply() first
 *
 * DS.changes('document', 5); // {...} Object describing changes
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item of the changes to retrieve.
 * @returns {object} The changes of the item of the type specified by `resourceName` with the primary key specified by `id`.
 */
function changes(resourceName, id) {
  var DS = this;

  id = DS.utils.resolveId(DS.definitions[resourceName], id);
  if (!DS.definitions[resourceName]) {
    throw new DS.errors.NER(errorPrefix(resourceName) + resourceName);
  } else if (!DS.utils.isString(id) && !DS.utils.isNumber(id)) {
    throw new DS.errors.IA(errorPrefix(resourceName) + 'id: Must be a string or a number!');
  }

  var item = DS.get(resourceName, id);
  if (item) {
    DS.store[resourceName].observers[id].deliver();
    var diff = DS.utils.diffObjectFromOldObject(item, DS.store[resourceName].previousAttributes[id]);
    DS.utils.forEach(diff, function (changeset, name) {
      var toKeep = [];
      DS.utils.forEach(changeset, function (value, field) {
        if (!angular.isFunction(value)) {
          toKeep.push(field);
        }
      });
      diff[name] = DS.utils.pick(diff[name], toKeep);
    });
    DS.utils.forEach(DS.definitions[resourceName].relationFields, function (field) {
      delete diff.added[field];
      delete diff.removed[field];
      delete diff.changed[field];
    });
    return diff;
  }
}

module.exports = changes;
