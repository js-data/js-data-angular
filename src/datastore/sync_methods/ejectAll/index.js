var errorPrefix = 'DS.ejectAll(resourceName[, params]): ';

function _ejectAll(definition, params) {
	params.query = params.query || {};

	var items = this.filter(definition.name, params);

	for (var i = 0; i < items.length; i++) {
		this.eject(definition.name, items[i][definition.idAttribute]);
	}
}

/**
 * @doc method
 * @id DS.sync_methods:ejectAll
 * @name ejectAll
 * @description
 * Eject all matching items of the specified type from the data store. If query is specified then all items of the
 * specified type will be removed. Ejection only removes items from the data store and does not attempt to delete items
 * on the server.
 *
 * ## Signature:
 * ```js
 * DS.ejectAll(resourceName[, params])
 * ```
 *
 * ## Example:
 *
 * ```js
 * DS.get('document', 45); // { title: 'How to Cook', id: 45 }
 *
 * DS.eject('document', 45);
 *
 * DS.get('document', 45); // undefined
 * ```
 *
 * Eject all items of the specified type that match the criteria from the data store.
 *
 * ```js
 * DS.filter('document');   // [ { title: 'How to Cook', id: 45, author: 'John Anderson' },
 *                          //   { title: 'How to Eat', id: 46, author: 'Sally Jane' } ]
 *
 * DS.ejectAll('document', { query: { where: { author: 'Sally Jane' } } });
 *
 * DS.filter('document'); // [ { title: 'How to Cook', id: 45, author: 'John Anderson' } ]
 * ```
 *
 * Eject all items of the specified type from the data store.
 *
 * ```js
 * DS.filter('document');   // [ { title: 'How to Cook', id: 45, author: 'John Anderson' },
 *                          //   { title: 'How to Eat', id: 46, author: 'Sally Jane' } ]
 *
 * DS.ejectAll('document');
 *
 * DS.filter('document'); // [ ]
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
 */
function ejectAll(resourceName, params) {
	params = params || {};

	if (!this.definitions[resourceName]) {
		throw new this.errors.RuntimeError(errorPrefix + resourceName + ' is not a registered resource!');
	} else if (!this.utils.isObject(params)) {
		throw new this.errors.IllegalArgumentError(errorPrefix + 'params: Must be an object!', { params: { actual: typeof params, expected: 'object' } });
	}

	var resource = this.store[resourceName],
		_this = this;

	try {
		if (!this.$rootScope.$$phase) {
			this.$rootScope.$apply(function () {
				_ejectAll.apply(_this, [_this.definitions[resourceName], params]);
				resource.collectionModified = _this.utils.updateTimestamp(resource.collectionModified);
			});
		} else {
			_ejectAll.apply(_this, [_this.definitions[resourceName], params]);
			resource.collectionModified = this.utils.updateTimestamp(resource.collectionModified);
		}
	} catch (err) {
		throw new this.errors.UnhandledError(err);
	}
}

module.exports = ejectAll;
