function errorPrefix(resourceName, id) {
  return 'DS.eject(' + resourceName + ', ' + id + '): ';
}

function _eject(definition, resource, id, options) {
  var item;
  var DS = this;
  var found = false;
  for (var i = 0; i < resource.collection.length; i++) {
    if (resource.collection[i][definition.idAttribute] == id) {
      item = resource.collection[i];
      found = true;
      break;
    }
  }
  if (found) {
    this.unlinkInverse(definition.name, id);
    resource.collection.splice(i, 1);
    resource.observers[id].close();
    delete resource.observers[id];

    resource.index.remove(id);
    delete resource.previousAttributes[id];
    delete resource.completedQueries[id];
    delete resource.pendingQueries[id];
    DS.utils.forEach(resource.changeHistories[id], function (changeRecord) {
      DS.utils.remove(resource.changeHistory, changeRecord);
    });
    delete resource.changeHistories[id];
    delete resource.modified[id];
    delete resource.saved[id];
    resource.collectionModified = this.utils.updateTimestamp(resource.collectionModified);

    if (options.notify) {
      this.emit(definition, 'eject', item);
    }

    return item;
  }
}

/**
 * @doc method
 * @id DS.sync methods:eject
 * @name eject
 * @description
 * Eject the item of the specified type that has the given primary key from the data store. Ejection only removes items
 * from the data store and does not attempt to destroy items via an adapter.
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
 * ```js
 * $rootScope.$on('DS.eject', function ($event, resourceName, ejected) {...});
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to eject.
 * @param {object=} options Optional configuration.
 * @returns {object} A reference to the item that was ejected from the data store.
 */
function eject(resourceName, id, options) {
  var DS = this;
  var definition = DS.definitions[resourceName];
  options = options || {};

  id = DS.utils.resolveId(definition, id);
  if (!definition) {
    throw new DS.errors.NER(errorPrefix(resourceName, id) + resourceName);
  } else if (!DS.utils.isString(id) && !DS.utils.isNumber(id)) {
    throw new DS.errors.IA(errorPrefix(resourceName, id) + 'id: Must be a string or a number!');
  }
  var resource = DS.store[resourceName];
  var ejected;

  if (!('notify' in options)) {
    options.notify = definition.notify;
  }

  if (!DS.$rootScope.$$phase) {
    DS.$rootScope.$apply(function () {
      ejected = _eject.call(DS, definition, resource, id, options);
    });
  } else {
    ejected = _eject.call(DS, definition, resource, id, options);
  }

  return ejected;
}

module.exports = eject;
