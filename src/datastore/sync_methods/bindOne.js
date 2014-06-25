var errorPrefix = 'DS.bindOne(scope, expr, resourceName, id[, cb]): ';

/**
 * @doc method
 * @id DS.sync_methods:bindOne
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
 * - `{RuntimeError}`
 * - `{UnhandledError}`
 *
 * @param {object} scope The scope to bind to.
 * @param {string} expr An expression used to bind to the scope. Can be used to set nested keys, i.e. `"user.profile"`.
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to bind.
 * @param {function=} cb Optional callback executed on change. Signature: `cb(err, item)`.
 * @returns {function} Scope $watch deregistration function.
 */
function bindOne(scope, expr, resourceName, id, cb) {
  if (!this.utils.isObject(scope)) {
    throw new this.errors.IllegalArgumentError(errorPrefix + 'scope: Must be an object!');
  } else if (!this.utils.isString(expr)) {
    throw new this.errors.IllegalArgumentError(errorPrefix + 'expr: Must be a string!');
  } else if (!this.definitions[resourceName]) {
    throw new this.errors.RuntimeError(errorPrefix + resourceName + ' is not a registered resource!');
  } else if (!this.utils.isString(id) && !this.utils.isNumber(id)) {
    throw new this.errors.IllegalArgumentError(errorPrefix + 'id: Must be a string or a number!');
  }

  var _this = this;

  try {
    return scope.$watch(function () {
      return _this.lastModified(resourceName, id);
    }, function () {
      var item = _this.get(resourceName, id);
      _this.utils.set(scope, expr, item);
      if (cb) {
        cb(null, item);
      }
    });
  } catch (err) {
    if (cb) {
      cb(new this.errors.UnhandledError(err));
    } else {
      throw new this.errors.UnhandledError(err);
    }
  }
}

module.exports = bindOne;
