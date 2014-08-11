function errorPrefix(resourceName) {
  return 'DS.ejectAll(' + resourceName + '[, params]): ';
}

function _ejectAll(definition, resource, params) {
  var queryHash = this.utils.toJson(params);
  var items = this.filter(definition.name, params);
  var ids = this.utils.toLookup(items, definition.idAttribute);
  var _this = this;

  angular.forEach(ids, function (item, id) {
    _this.eject(definition.name, id);
  });

  delete resource.completedQueries[queryHash];
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
 * @param {object} params Parameter object that is serialized into the query string. Properties:
 *
 *  - `{object=}` - `where` - Where clause.
 *  - `{number=}` - `limit` - Limit clause.
 *  - `{number=}` - `skip` - Skip clause.
 *  - `{number=}` - `offset` - Same as skip.
 *  - `{string|array=}` - `orderBy` - OrderBy clause.
 */
function ejectAll(resourceName, params) {
  params = params || {};

  if (!this.definitions[resourceName]) {
    throw new this.errors.NER(errorPrefix(resourceName) + resourceName);
  } else if (!this.utils.isObject(params)) {
    throw new this.errors.IA(errorPrefix(resourceName) + 'params: Must be an object!');
  }

  var _this = this;
  var resource = this.store[resourceName];
  var queryHash = this.utils.toJson(params);

  delete resource.completedQueries[queryHash];

  if (this.utils.isEmpty(params)) {
    resource.completedQueries = {};
  }

  if (!this.$rootScope.$$phase) {
    this.$rootScope.$apply(function () {
      _ejectAll.apply(_this, [_this.definitions[resourceName], resource, params]);
      resource.collectionModified = _this.utils.updateTimestamp(resource.collectionModified);
    });
  } else {
    _ejectAll.apply(_this, [_this.definitions[resourceName], resource, params]);
    resource.collectionModified = this.utils.updateTimestamp(resource.collectionModified);
  }
}

module.exports = ejectAll;
