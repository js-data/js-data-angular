var utils = require('utils'),
	errors = require('errors'),
	services = require('services'),
	GET = require('../../http').GET,
	errorPrefix = 'DS.findAll(resourceName, params[, options]): ';

function processResults(data, resourceName, queryHash) {
	var resource = services.store[resourceName];

	data = data || [];

	// Query is no longer pending
	delete resource.pendingQueries[queryHash];
	resource.completedQueries[queryHash] = new Date().getTime();

	var temp = [];
	for (var i = 0; i < data.length; i++) {
		temp.push(data[i]);
	}
	// Merge the new values into the cache
	resource.collection = utils.mergeArrays(resource.collection, data, resource.idAttribute || 'id');

	// Update the data store's index for this resource
	resource.index = utils.toLookup(resource.collection, resource.idAttribute || 'id');

	// Update modified timestamp for values that were return by the server
	for (var j = 0; j < temp.length; j++) {
		resource.modified[temp[j][resource.idAttribute || 'id']] = utils.updateTimestamp(resource.modified[temp[j][resource.idAttribute || 'id']]);
	}

	// Update modified timestamp of collection
	resource.collectionModified = utils.updateTimestamp(resource.collectionModified);
	return temp;
}

function _findAll(deferred, resourceName, params, options) {
	var resource = services.store[resourceName];

	var queryHash = utils.toJson(params);

	if (options.bypassCache) {
		delete resource.completedQueries[queryHash];
	}

	if (!(queryHash in resource.completedQueries)) {
		// This particular query has never been completed

		if (!resource.pendingQueries[queryHash]) {

			// This particular query has never even been started
			var url = utils.makePath(resource.baseUrl || services.config.baseUrl, resource.endpoint || resource.name);
			resource.pendingQueries[queryHash] = GET(url, { params: params }).then(function (data) {
				try {
					deferred.resolve(processResults(data, resourceName, queryHash));
				} catch (err) {
					deferred.reject(new errors.UnhandledError(err));
				}
			}, deferred.reject);
		}
	} else {
		deferred.resolve(this.filter(resourceName, params, options));
	}
}

/**
 * @doc method
 * @id DS.async_methods:findAll
 * @name findAll
 * @description
 * Asynchronously return the resource from the server filtered by the query. The results will be added to the data
 * store when it returns from the server.
 *
 * ## Signature:
 * ```js
 * DS.findAll(resourceName, params[, options])
 * ```
 *
 * ## Example:
 *
 * ```js
 *  var query = {
 *      where: {
 *          author: {
 *              '==': 'John Anderson'
 *          }
 *      }
 *  };
 *
 *  DS.findAll('document', {
 *      query: query
 *  }).then(function (documents) {
 *      documents;  // [{ id: 'aab7ff66-e21e-46e2-8be8-264d82aee535', author: 'John Anderson', title: 'How to cook' },
 *                  //  { id: 'ee7f3f4d-98d5-4934-9e5a-6a559b08479f', author: 'John Anderson', title: 'How NOT to cook' }]
 *
 *      // The documents are now in the data store
 *      DS.filter('document', {
 *          query: query
 *      }); // [{ id: 'aab7ff66-e21e-46e2-8be8-264d82aee535', author: 'John Anderson', title: 'How to cook' },
 *          //  { id: 'ee7f3f4d-98d5-4934-9e5a-6a559b08479f', author: 'John Anderson', title: 'How NOT to cook' }]
 *
 *  }, function (err) {
 *      // handle error
 *  });
 * ```
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
 * - `{boolean=}` - `bypassCache` - Bypass the cache. Default: `false`.
 * - `{string=}` - `mergeStrategy` - If `findAll` is called, specify the merge strategy that should be used when the new
 * items are injected into the data store. Default `"mergeWithExisting"`.
 *
 * @returns {Promise} Promise produced by the `$q` service.
 *
 * ## Resolves with:
 *
 * - `{array}` - `items` - The collection of items returned by the server.
 *
 * ## Rejects with:
 *
 * - `{IllegalArgumentError}`
 * - `{RuntimeError}`
 * - `{UnhandledError}`
 */
function findAll(resourceName, params, options) {
	var deferred = services.$q.defer();

	options = options || {};

	if (!services.store[resourceName]) {
		deferred.reject(new errors.RuntimeError(errorPrefix + resourceName + ' is not a registered resource!'));
	} else if (!utils.isObject(params)) {
		deferred.reject(new errors.IllegalArgumentError(errorPrefix + 'params: Must be an object!', { params: { actual: typeof params, expected: 'object' } }));
	} else if (!utils.isObject(options)) {
		deferred.reject(new errors.IllegalArgumentError(errorPrefix + 'options: Must be an object!', { options: { actual: typeof options, expected: 'object' } }));
	} else {
		try {
			_findAll.apply(this, [deferred, resourceName, params, options]);
		} catch (err) {
			deferred.reject(new errors.UnhandledError(err));
		}
	}

	return deferred.promise;
}

module.exports = findAll;