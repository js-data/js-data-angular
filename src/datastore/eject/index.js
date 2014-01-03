var utils = require('../../utils'),
	errors = require('../../errors'),
	store = require('../store'),
	services = require('../services');

function _eject(resource, id) {
	for (var i = 0; i < resource.collection.length; i++) {
		if (resource.collection[i][resource.idAttribute || 'id'] == id) {
			break;
		}
	}

	resource.collection.splice(i, 1);
	delete resource.index[id];
	delete resource.modified[id];
	resource.collectionModified = utils.updateTimestamp(resource.collectionModified);
}

/**
 * @doc method
 * @id DS.methods:eject
 * @name eject(resourceName, id)
 * @description
 * Synchronously remove the item of type `resourceName` with the given primary key from the data store (not from the
 * server).
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}` - Argument `id` must be a string or a number.
 * - `{RuntimeError}` - Argument `resourceName` must refer to an already registered resource.
 * - `{UnhandledError}` - Thrown for any uncaught exception.
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to remove.
 */
function eject(resourceName, id) {
	if (!store[resourceName]) {
		throw new errors.RuntimeError('DS.eject(resourceName, id): ' + resourceName + ' is not a registered resource!');
	} else if (!utils.isString(id) && !utils.isNumber(id)) {
		throw new errors.IllegalArgumentError('DS.eject(resourceName, id): id: You must provide an id!', { id: { actual: typeof id, expected: 'string|number' } });
	}

	try {
		if (!services.$rootScope.$$phase) {
			services.$rootScope.$apply(function () {
				_eject(store[resourceName], id);
			});
		} else {
			_eject(store[resourceName], id);
		}
	} catch (err) {
		throw new errors.UnhandledError(err);
	}
}

module.exports = eject;
