/* jshint loopfunc: true */
var errorPrefix = 'DS.filter(resourceName[, params][, options]): ';

/**
 * @doc method
 * @id DS.sync_methods:filter
 * @name filter
 * @description
 * Synchronously filter items in the data store of the type specified by `resourceName`.
 *
 * ## Signature:
 * ```js
 * DS.filter(resourceName[, params][, options])
 * ```
 *
 * ## Example:
 *
 * ```js
 * TODO: filter(resourceName, params[, options]) example
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{RuntimeError}`
 * - `{UnhandledError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {object=} params Parameter object that is serialized into the query string. Properties:
 *
 *  - `{object=}` - `where` - Where clause.
 *  - `{number=}` - `limit` - Limit clause.
 *  - `{number=}` - `skip` - Skip clause.
 *  - `{number=}` - `offset` - Same as skip.
 *  - `{string|array=}` - `orderBy` - OrderBy clause.
 *
 * @param {object=} options Optional configuration. Properties:
 * - `{boolean=}` - `loadFromServer` - Send the query to server if it has not been sent yet. Default: `false`.
 * - `{boolean=}` - `allowSimpleWhere` - Treat top-level fields on the `params` argument as simple "where" equality clauses. Default: `true`.
 * @returns {array} The filtered collection of items of the type specified by `resourceName`.
 */
function filter(resourceName, params, options) {
  options = options || {};

  if (!this.definitions[resourceName]) {
    throw new this.errors.RuntimeError(errorPrefix + resourceName + ' is not a registered resource!');
  } else if (params && !this.utils.isObject(params)) {
    throw new this.errors.IllegalArgumentError(errorPrefix + 'params: Must be an object!', { params: { actual: typeof params, expected: 'object' } });
  } else if (!this.utils.isObject(options)) {
    throw new this.errors.IllegalArgumentError(errorPrefix + 'options: Must be an object!', { options: { actual: typeof options, expected: 'object' } });
  }

  try {
    var definition = this.definitions[resourceName];
    var resource = this.store[resourceName];

    // Protect against null
    params = params || {};

    if ('allowSimpleWhere' in options) {
      options.allowSimpleWhere = !!options.allowSimpleWhere;
    } else {
      options.allowSimpleWhere = true;
    }

    var queryHash = this.utils.toJson(params);

    if (!(queryHash in resource.completedQueries) && options.loadFromServer) {
      // This particular query has never been completed

      if (!resource.pendingQueries[queryHash]) {
        // This particular query has never even been started
        this.findAll(resourceName, params, options);
      }
    }

    return definition.filter.call(this, resource.collection, resourceName, params, options);
  } catch (err) {
    if (err instanceof this.errors.IllegalArgumentError) {
      throw err;
    } else {
      throw new this.errors.UnhandledError(err);
    }
  }
}

module.exports = filter;
