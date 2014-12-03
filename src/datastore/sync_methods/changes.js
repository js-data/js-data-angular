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
 * @param {object=} options Optional configuration. Properties:
 *
 * - `{array=}` - `blacklist` - Array of strings or RegExp that specify fields that should be ignored when checking for changes.
 *
 * @returns {object} The changes of the item of the type specified by `resourceName` with the primary key specified by `id`.
 */
function changes(resourceName, id, options) {
  var DS = this;
  var DSUtils = DS.utils;
  var definition = DS.definitions[resourceName];

  options = options || {};

  id = DSUtils.resolveId(DS.definitions[resourceName], id);
  if (!definition) {
    throw new DS.errors.NER(errorPrefix(resourceName) + resourceName);
  } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
    throw new DS.errors.IA(errorPrefix(resourceName) + 'id: Must be a string or a number!');
  } else if (!DSUtils.isObject(options)) {
    throw new DS.errors.IA(errorPrefix(resourceName) + 'options: Must be an object!');
  }

  options = DSUtils._(definition, options);


  var item = DS.get(resourceName, id);
  if (item) {
    DS.store[resourceName].observers[id].deliver();
    var diff = DSUtils.diffObjectFromOldObject(item, DS.store[resourceName].previousAttributes[id], DSUtils.deepEquals, options.ignoredChanges);
    DSUtils.forEach(diff, function (changeset, name) {
      var toKeep = [];
      DSUtils.forEach(changeset, function (value, field) {
        if (!angular.isFunction(value)) {
          toKeep.push(field);
        }
      });
      diff[name] = DSUtils.pick(diff[name], toKeep);
    });
    DSUtils.forEach(DS.definitions[resourceName].relationFields, function (field) {
      delete diff.added[field];
      delete diff.removed[field];
      delete diff.changed[field];
    });
    return diff;
  }
}

module.exports = changes;
