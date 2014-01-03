var utils = require('../../utils'),
	errors = require('../../errors'),
	store = require('../store'),
	services = require('../services');

function _inject(resource, attrs) {
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

/**
 * @doc method
 * @id DS.sync_methods:inject
 * @name inject(name, attrs)
 * @description
 * Inject an item of type `resourceName` (which already exists on the server) into the data store.
 *
 * Example:
 *
 * ```js
 * TODO: inject(resourceName, attrs) example
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}` - Argument `attrs` must be an object.
 * - `{RuntimeError}` - Argument `resourceName` must refer to an already registered resource.
 * - `{UnhandledError}` - Thrown for any uncaught exception.
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {object} attrs The item to inject into the data store.
 * @returns {object} A reference to the item that was injected into the data store.
 */
function inject(resourceName, attrs) {
	if (!store[resourceName]) {
		throw new errors.RuntimeError('DS.inject(resourceName, attrs): ' + resourceName + ' is not a registered resource!');
	} else if (!utils.isObject(attrs)) {
		throw new errors.IllegalArgumentError('DS.inject(resourceName, attrs): attrs: Must be an object!', { attrs: { actual: typeof attrs, expected: 'object' } });
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
