/* jshint loopfunc: true */
var utils = require('utils'),
	errors = require('errors'),
	services = require('services'),
	errorPrefix = 'DS.filter(resourceName, params[, options]): ';

/**
 * @doc method
 * @id DS.sync_methods:filter
 * @name filter
 * @description
 * Synchronously filter items in the data store of the type specified by `resourceName`.
 *
 * ## Signature:
 * ```js
 * DS.filter(resourceName, params[, options])
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
 * @param {object} params Parameter object that is serialized into the query string. Properties:
 *
 * - `{object=}` - `query` - The query object by which to filter items of the type specified by `resourceName`. Properties:
 *      - `{object=}` - `where` - Where clause.
 *      - `{number=}` - `limit` - Limit clause.
 *      - `{skip=}` - `skip` - Skip clause.
 *      - `{orderBy=}` - `orderBy` - OrderBy clause.
 *
 * @param {object=} options Optional configuration. Properties:
 * - `{boolean=}` - `loadFromServer` - Send the query to server if it has not been sent yet. Default: `false`.
 * - `{string=}` - `mergeStrategy` - If `findAll` is called, specify the merge strategy that should be used when the new
 * items are injected into the data store. Default: `"mergeWithExisting"`.
 *
 * @returns {array} The filtered collection of items of the type specified by `resourceName`.
 */
function filter(resourceName, params, options) {
	options = options || {};

	if (!services.store[resourceName]) {
		throw new errors.RuntimeError(errorPrefix + resourceName + ' is not a registered resource!');
	} else if (!utils.isObject(params)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'params: Must be an object!', { params: { actual: typeof params, expected: 'object' } });
	} else if (!utils.isObject(options)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'options: Must be an object!', { options: { actual: typeof options, expected: 'object' } });
	}

	try {
		var resource = services.store[resourceName];

		// Protect against null
		params.query = params.query || {};

		var queryHash = utils.toJson(params);

		if (!(queryHash in resource.completedQueries) && options.loadFromServer) {
			// This particular query has never been completed

			if (!resource.pendingQueries[queryHash]) {
				// This particular query has never even been started
				this.findAll(resourceName, params, options);
			}
		}

		// The query has been completed, so hit the cache with the query
		var filtered = utils.filter(resource.collection, function (value) {
			var keep = true;

			// Apply 'where' clauses
			if (params.query.where) {
				if (!utils.isObject(params.query.where)) {
					throw new errors.IllegalArgumentError(errorPrefix + 'params.query.where: Must be an object!', { params: { query: { where: { actual: typeof params.query.where, expected: 'object' } } } });
				}
				utils.forOwn(params.query.where, function (value2, key2) {
					if (utils.isString(value2)) {
						value2 = {
							'===': value2
						};
					}
					if ('==' in value2) {
						keep = keep && (value[key2] == value2['==']);
					} else if ('===' in value2) {
						keep = keep && (value[key2] === value2['===']);
					} else if ('!=' in value2) {
						keep = keep && (value[key2] != value2['!=']);
					} else if ('>' in value2) {
						keep = keep && (value[key2] > value2['>']);
					} else if ('>=' in value2) {
						keep = keep && (value[key2] >= value2['>=']);
					} else if ('<' in value2) {
						keep = keep && (value[key2] < value2['<']);
					} else if ('<=' in value2) {
						keep = keep && (value[key2] <= value2['<=']);
					} else if ('in' in value2) {
						keep = keep && utils.contains(value2['in'], value[key2]);
					}
				});
			}
			return keep;
		});

		// Apply 'orderBy'
		if (params.query.orderBy) {
			if (utils.isString(params.query.orderBy)) {
				params.query.orderBy = [
					[params.query.orderBy, 'ASC']
				];
			}
			if (utils.isArray(params.query.orderBy)) {
				for (var i = 0; i < params.query.orderBy.length; i++) {
					if (utils.isString(params.query.orderBy[i])) {
						params.query.orderBy[i] = [params.query.orderBy[i], 'ASC'];
					} else if (!utils.isArray(params.query.orderBy[i])) {
						throw new errors.IllegalArgumentError(errorPrefix + 'params.query.orderBy[' + i + ']: Must be a string or an array!', { params: { query: { 'orderBy[i]': { actual: typeof params.query.orderBy[i], expected: 'string|array' } } } });
					}
					filtered = utils.sort(filtered, function (a, b) {
						var cA = a[params.query.orderBy[i][0]], cB = b[params.query.orderBy[i][0]];
						if (utils.isString(cA)) {
							cA = utils.upperCase(cA);
						}
						if (utils.isString(cB)) {
							cB = utils.upperCase(cB);
						}
						if (params.query.orderBy[i][1] === 'DESC') {
							if (cB < cA) {
								return -1;
							} else if (cB > cA) {
								return 1;
							} else {
								return 0;
							}
						} else {
							if (cA < cB) {
								return -1;
							} else if (cA > cB) {
								return 1;
							} else {
								return 0;
							}
						}
					});
				}
			} else {
				throw new errors.IllegalArgumentError(errorPrefix + 'params.query.orderBy: Must be a string or an array!', { params: { query: { orderBy: { actual: typeof params.query.orderBy, expected: 'string|array' } } } });
			}
		}

		// Apply 'limit' and 'skip'
		if (utils.isNumber(params.query.limit) && utils.isNumber(params.query.skip)) {
			filtered = utils.slice(filtered, params.query.skip, params.query.skip + params.query.limit);
		} else if (utils.isNumber(params.query.limit)) {
			filtered = utils.slice(filtered, 0, params.query.limit);
		} else if (utils.isNumber(params.query.skip)) {
			filtered = utils.slice(filtered, params.query.skip);
		}

		return filtered;
	} catch (err) {
		if (err instanceof errors.IllegalArgumentError) {
			throw err;
		} else {
			throw new errors.UnhandledError(err);
		}
	}
}

module.exports = filter;
