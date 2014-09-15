function errorPrefix(resourceName) {
  return 'DS.bindOne(scope, expr, ' + resourceName + ', id[, cb]): ';
}

/**
 * @doc method
 * @id DS.sync methods:bindOne
 * @name bindOne
 * @description
 * Bind an item in the data store to `scope` under the property specified by `expr`.
 *
 * ## Signature:
 * ```js
 * DS.bindOne(scope, expr, resourceName, id[, cb])
 * ```
 *
 * ## Example:
 *
 * ```js
 * // bind the document with id 5 to the 'doc' property of the $scope
 * var deregisterFunc = DS.bindOne($scope, 'doc', 'document', 5);
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 *
 * @param {object} scope The scope to bind to.
 * @param {string} expr An expression used to bind to the scope. Can be used to set nested keys, i.e. `"user.profile"`.
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to bind.
 * @param {function=} cb Optional callback executed on change. Signature: `cb(err, item)`.
 * @returns {function} Scope $watch deregistration function.
 */
function bindOne(scope, expr, resourceName, id, cb) {
  var DS = this;
  var IA = DS.errors.IA;

  id = DS.utils.resolveId(DS.definitions[resourceName], id);
  if (!DS.utils.isObject(scope)) {
    throw new IA(errorPrefix(resourceName) + 'scope: Must be an object!');
  } else if (!DS.utils.isString(expr)) {
    throw new IA(errorPrefix(resourceName) + 'expr: Must be a string!');
  } else if (!DS.definitions[resourceName]) {
    throw new DS.errors.NER(errorPrefix(resourceName) + resourceName);
  } else if (!DS.utils.isString(id) && !DS.utils.isNumber(id)) {
    throw new IA(errorPrefix(resourceName) + 'id: Must be a string or a number!');
  }

  try {
    return scope.$watch(function () {
      return DS.lastModified(resourceName, id);
    }, function () {
      var item = DS.get(resourceName, id);
      DS.utils.set(scope, expr, item);
      if (cb) {
        cb(null, item);
      }
    });
  } catch (err) {
    if (cb) {
      cb(err);
    } else {
      throw err;
    }
  }
}

module.exports = bindOne;
