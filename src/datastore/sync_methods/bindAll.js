var errorPrefix = 'DS.bindAll(scope, expr, resourceName, params): ';

/**
 * @doc method
 * @id DS.sync_methods:bindAll
 * @name bindAll
 * @description
 * Bind a collection of items in the data store to `scope` under the property specified by `expr` filtered by `params`.
 *
 * ## Signature:
 * ```js
 * DS.bindAll(scope, expr, resourceName, params)
 * ```
 *
 * ## Example:
 *
 * ```js
 * // bind the documents with ownerId of 5 to the 'docs' property of the $scope
 * var deregisterFunc = DS.bindAll($scope, 'docs', 'document', {
 *      query: {
 *          criteria: {
 *              ownerId: 5
 *          }
 *      }
 * });
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{RuntimeError}`
 * - `{UnhandledError}`
 *
 * @param {object} scope The scope to bind to.
 * @param {string} expr An expression used to bind to the scope. Can be used to set nested keys, i.e. `"user.comments"`.
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {object} params Parameter object that is used in filtering the collection. Properties:
 *
 * - `{object=}` - `query` - The query object by which to filter items of the type specified by `resourceName`. Properties:
 *      - `{object=}` - `where` - Where clause.
 *      - `{number=}` - `limit` - Limit clause.
 *      - `{skip=}` - `skip` - Skip clause.
 *      - `{orderBy=}` - `orderBy` - OrderBy clause.
 * @returns {function} Scope $watch deregistration function.
 */
function bindOne(scope, expr, resourceName, params) {
	if (!this.utils.isObject(scope)) {
		throw new this.errors.IllegalArgumentError(errorPrefix + 'scope: Must be an object!');
	} else if (!this.utils.isString(expr)) {
		throw new this.errors.IllegalArgumentError(errorPrefix + 'expr: Must be a string!');
	} else if (!this.definitions[resourceName]) {
		throw new this.errors.RuntimeError(errorPrefix + resourceName + ' is not a registered resource!');
	} else if (!this.utils.isObject(params)) {
		throw new this.errors.IllegalArgumentError(errorPrefix + 'params: Must be an object!');
	}

	var _this = this;

	try {
		return scope.$watch(function () {
			return _this.lastModified(resourceName);
		}, function () {
			_this.utils.set(scope, expr, _this.filter(resourceName, params));
		});
	} catch (err) {
		throw new this.errors.UnhandledError(err);
	}
}

module.exports = bindOne;
