var errorPrefix = 'DS.eject(resourceName, id): ';

function _eject(definition, resource, id) {
	var found = false;
	for (var i = 0; i < resource.collection.length; i++) {
		if (resource.collection[i][definition.idAttribute] == id) {
			found = true;
			break;
		}
	}
	if (found) {
		resource.collection.splice(i, 1);
		resource.observers[id].close();
		delete resource.observers[id];
		delete resource.index[id];
		delete resource.changes[id];
		delete resource.previousAttributes[id];
		delete resource.modified[id];
		delete resource.saved[id];
	}
}

/**
 * @doc method
 * @id DS.sync_methods:eject
 * @name eject
 * @description
 * Eject the item of the specified type that has the given primary key from the data store. Ejection only removes items
 * from the data store and does not attempt to delete items on the server.
 *
 * ## Signature:
 * ```js
 * DS.eject(resourceName[, id])
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
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{RuntimeError}`
 * - `{UnhandledError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to eject.
 */
function eject(resourceName, id) {
	if (!this.definitions[resourceName]) {
		throw new this.errors.RuntimeError(errorPrefix + resourceName + ' is not a registered resource!');
	} else if (!this.utils.isString(id) && !this.utils.isNumber(id)) {
		throw new this.errors.IllegalArgumentError(errorPrefix + 'id: Must be a string or a number!', { id: { actual: typeof id, expected: 'string|number' } });
	}

	var resource = this.store[resourceName],
		_this = this;

	try {
		if (!this.$rootScope.$$phase) {
			this.$rootScope.$apply(function () {
				_eject(_this.definitions[resourceName], resource, id);
				resource.collectionModified = _this.utils.updateTimestamp(resource.collectionModified);
			});
		} else {
			_eject(_this.definitions[resourceName], resource, id);
			resource.collectionModified = _this.utils.updateTimestamp(resource.collectionModified);
		}
		delete this.store[resourceName].completedQueries[id];
	} catch (err) {
		throw new this.errors.UnhandledError(err);
	}
}

module.exports = eject;
