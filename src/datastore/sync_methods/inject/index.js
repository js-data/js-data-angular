var utils = require('../../../utils'),
	errors = require('../../../errors'),
	store = require('../../store'),
	services = require('../../services');

function _inject(resource, attrs) {
	if (utils.isArray(attrs)) {
		for (var i = 0; i < attrs.length; i++) {
			_inject(attrs[i]);
		}
	} else {
		var idAttribute = resource.idAttribute || 'id';
		if (resource.index[attrs[idAttribute]]) {
			utils.deepMixIn(resource.index[attrs[idAttribute]], attrs);
		} else {
			resource.index[attrs[idAttribute]] = attrs;
			resource.collection.push(resource.index[attrs[idAttribute]]);
		}
		resource.modified[attrs[idAttribute]] = utils.updateTimestamp(resource.modified[attrs[idAttribute]]);
		resource.collectionModified = utils.updateTimestamp(resource.collectionModified);
	}
}

/**
 * @doc method
 * @id DS.sync_methods:inject
 * @name inject
 * @description
 * `inject(resourceName, attrs)`
 *
 * Inject the given item into the data store as the specified type. If `attrs` is an array, inject each item into the
 * data store. Injecting an item into the data store does not save it to the server.
 *
 * Example:
 *
 * ```js
 * DS.get('document', 45); // undefined
 *
 * DS.inject('document', { title: 'How to Cook', id: 45 });
 *
 * DS.get('document', 45); // { title: 'How to Cook', id: 45 }
 * ```
 *
 * Inject a collection into the data store:
 *
 * ```js
 * DS.filter('document'); // [ ]
 *
 * DS.inject('document', [ { title: 'How to Cook', id: 45 }, { title: 'How to Eat', id: 46 } ]);
 *
 * DS.filter('document'); // [ { title: 'How to Cook', id: 45 }, { title: 'How to Eat', id: 46 } ]
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}` - Argument `attrs` must be an object.
 * - `{RuntimeError}` - Argument `resourceName` must refer to an already registered resource.
 * - `{UnhandledError}` - Thrown for any uncaught exception.
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {object|array} attrs The item or collection of items to inject into the data store.
 * @returns {object|array} A reference to the item that was injected into the data store or an array of references to
 * the items that were injected into the data store.
 */
function inject(resourceName, attrs) {
	if (!store[resourceName]) {
		throw new errors.RuntimeError('DS.inject(resourceName, attrs): ' + resourceName + ' is not a registered resource!');
	} else if (!utils.isObject(attrs) && !utils.isArray(attrs)) {
		throw new errors.IllegalArgumentError('DS.inject(resourceName, attrs): attrs: Must be an object or an array!', { attrs: { actual: typeof attrs, expected: 'object|array' } });
	}

	var resource = store[resourceName];

	var idAttribute = resource.idAttribute || 'id';
	if (!attrs[idAttribute]) {
		throw new errors.RuntimeError('DS.inject(resourceName, attrs): attrs: Must contain the property specified by `idAttribute` in the resource definition!');
	} else {
		try {
			if (!services.$rootScope.$$phase) {
				services.$rootScope.$apply(function () {
					_inject(store[resourceName], attrs);
				});
			} else {
				_inject(store[resourceName], attrs);
			}
		} catch (err) {
			throw new errors.UnhandledError(err);
		}
		return resource.index[attrs[idAttribute]];
	}
}

module.exports = inject;
