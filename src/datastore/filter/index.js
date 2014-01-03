var utils = require('../../utils'),
	errors = require('../../errors'),
	store = require('../store');

/**
 * @doc method
 * @id DS.sync_methods:filter
 * @name filter(name[, params][, loadFromServer])
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {object=} params Parameter object that is serialized into the query string. Properties:
 *
 * - `{object=}` - `query` - The query object by which to filter items of the type specified by `resourceName`. Properties:
 *      - `{object=}` - `where` - Where clause.
 *      - `{number=}` - `limit` - Limit clause.
 *      - `{skip=}` - `skip` - Skip clause.
 * @param {boolean=} loadFromServer Whether to load the query from the server if it hasn't been loaded yet.
 * @returns {array} The filtered collection of items of the type specified by `resourceName`.
 */
function filter(resourceName, params, loadFromServer) {
	if (!store[resourceName]) {
		throw new Error('DS.filter(resourceName, params, loadFromServer): ' + resourceName + ' is not a registered resource!');
	} else if (params && !utils.isObject(params)) {
		throw new Error('DS.filter(resourceName, params, loadFromServer): params: Must be an object!');
	}

	var resource = store[resourceName];

	// Protect against null
	params = params || {};
	params.query = params.query || {};

	var queryHash = utils.toJson(params);

	if (!(queryHash in resource.completedQueries) && loadFromServer) {
		// This particular query has never been completed

		if (!resource.pendingQueries[queryHash]) {
			// This particular query has never even been started
			this.findAll(resourceName, params);
		}

		// Return empty results until the query completes
		return [];
	} else {
		// The query has been completed, so hit the cache with the query

		// Apply 'criteria'
		var filtered = utils.filter(resource.collection, function (value) {
			var keep = true;
			utils.forOwn(params.query.criteria, function (value2, key2) {
				if (key2.indexOf('.') !== -1) {
					key2 = key2.split('.')[1];
				}
				if (value2['==']) {
					if (value2['=='] == 'null') {
						keep = keep && (value[key2] === null);
					} else {
						keep = keep && (value[key2] == value2['==']);
					}
				} else if (value2['!=']) {
					keep = keep && (value[key2] != value2['!=']);
				} else if (value2['>']) {
					keep = keep && (value[key2] > value2['>']);
				} else if (value2['>=']) {
					keep = keep && (value[key2] >= value2['>=']);
				} else if (value2['<']) {
					keep = keep && (value[key2] < value2['<']);
				} else if (value2['<=']) {
					keep = keep && (value[key2] <= value2['<=']);
				} else if (value2['in']) {
					keep = keep && utils.contains(value2['in'], value[key2]);
				}
			});
			return keep;
		});

		// Apply 'sort'
		if (params.query.sort) {
			utils.forOwn(params.query.sort, function (value, key) {
				if (key.indexOf('.') !== -1) {
					key = key.split('.')[1];
				}
				filtered = utils.sort(filtered, function (a, b) {
					var cA = a[key], cB = b[key];
					if (utils.isString(cA)) {
						cA = utils.upperCase(cA);
					}
					if (utils.isString(cB)) {
						cB = utils.upperCase(cB);
					}
					if (value === 'DESC') {
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
			});
		}

		// Apply 'limit' and 'offset'
		if (utils.isNumber(params.query.limit) && utils.isNumber(params.query.offset)) {
			filtered = utils.slice(filtered, params.query.offset, params.query.offset + params.query.limit);
		} else if (utils.isNumber(params.query.limit)) {
			filtered = utils.slice(filtered, 0, params.query.limit);
		} else if (utils.isNumber(params.query.offset)) {
			filtered = utils.slice(filtered, params.query.offset);
		}

		return filtered;
	}
}

module.exports = filter;
