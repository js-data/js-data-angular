function errorPrefix(resourceName) {
  return 'DS.ejectAll(' + resourceName + '[, params]): ';
}

function _ejectAll(definition, resource, params, options) {
  var DS = this;
  var queryHash = DS.utils.toJson(params);
  var items = DS.filter(definition.name, params);
  var ids = DS.utils.toLookup(items, definition.idAttribute);

  angular.forEach(ids, function (item, id) {
    DS.eject(definition.name, id);
  });

  delete resource.completedQueries[queryHash];
  resource.collectionModified = DS.utils.updateTimestamp(resource.collectionModified);

  if (options.notify) {
    DS.emit(definition, 'eject', items);
  }

  return items;
}

/**
 * @doc method
 * @id DS.sync methods:ejectAll
 * @name ejectAll
 * @description
 * Eject all matching items of the specified type from the data store. Ejection only removes items from the data store
 * and does not attempt to destroy items via an adapter.
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
 * DS.ejectAll('document', { where: { author: 'Sally Jane' } });
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
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {object} params Parameter object that is used to filter items. Properties:
 *
 *  - `{object=}` - `where` - Where clause.
 *  - `{number=}` - `limit` - Limit clause.
 *  - `{number=}` - `skip` - Skip clause.
 *  - `{number=}` - `offset` - Same as skip.
 *  - `{string|array=}` - `orderBy` - OrderBy clause.
 *
 * @param {object=} options Optional configuration.
 *
 * @returns {array} The items that were ejected from the data store.
 */
function ejectAll(resourceName, params, options) {
  var DS = this;
  var definition = DS.definitions[resourceName];
  params = params || {};
  options = options || {};

  if (!definition) {
    throw new DS.errors.NER(errorPrefix(resourceName) + resourceName);
  } else if (!DS.utils.isObject(params)) {
    throw new DS.errors.IA(errorPrefix(resourceName) + 'params: Must be an object!');
  }
  var resource = DS.store[resourceName];
  var ejected;

  if (DS.utils.isEmpty(params)) {
    resource.completedQueries = {};
  }

  if (!('notify' in options)) {
    options.notify = definition.notify;
  }

  if (!DS.$rootScope.$$phase) {
    DS.$rootScope.$apply(function () {
      ejected = _ejectAll.call(DS, definition, resource, params, options);
    });
  } else {
    ejected = _ejectAll.call(DS, definition, resource, params, options);
  }

  return ejected;
}

module.exports = ejectAll;
