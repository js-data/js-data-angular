var observe = require('../../../lib/observe-js/observe-js');
function errorPrefix(resourceName) {
  return 'DS.inject(' + resourceName + ', attrs): ';
}

function _inject(definition, resource, attrs) {
  var DS = this;
  var $log = DS.$log;

  function _react(added, removed, changed, oldValueFn) {
    var target = this;
    var innerId = (oldValueFn && oldValueFn(definition.idAttribute)) ? oldValueFn(definition.idAttribute) : target[definition.idAttribute];

    resource.modified[innerId] = DS.utils.updateTimestamp(resource.modified[innerId]);
    resource.collectionModified = DS.utils.updateTimestamp(resource.collectionModified);

    if (definition.computed) {
      var item = DS.get(definition.name, innerId);
      DS.utils.forOwn(definition.computed, function (fn, field) {
        var compute = false;
        // check if required fields changed
        angular.forEach(fn.deps, function (dep) {
          if (dep in added || dep in removed || dep in changed || !(field in item)) {
            compute = true;
          }
        });
        compute = compute || !fn.deps.length;
        if (compute) {
          var args = [];
          angular.forEach(fn.deps, function (dep) {
            args.push(item[dep]);
          });
          // recompute property
          item[field] = fn[fn.length - 1].apply(item, args);
        }
      });
    }

    if (definition.idAttribute in changed) {
      $log.error('Doh! You just changed the primary key of an object! ' +
        'I don\'t know how to handle this yet, so your data for the "' + definition.name +
        '" resource is now in an undefined (probably broken) state.');
    }
  }

  var injected;
  if (DS.utils.isArray(attrs)) {
    injected = [];
    for (var i = 0; i < attrs.length; i++) {
      injected.push(_inject.call(DS, definition, resource, attrs[i]));
    }
  } else {
    // check if "idAttribute" is a computed property
    var c = definition.computed;
    var idA = definition.idAttribute;
    if (c && c[idA]) {
      var args = [];
      angular.forEach(c[idA].deps, function (dep) {
        args.push(attrs[dep]);
      });
      attrs[idA] = c[idA][c[idA].length - 1].apply(attrs, args);
    }
    if (!(idA in attrs)) {
      var error = new DS.errors.R(errorPrefix(definition.name) + 'attrs: Must contain the property specified by `idAttribute`!');
      $log.error(error);
      throw error;
    } else {
      try {
        definition.beforeInject(definition.name, attrs);
        var id = attrs[idA];
        var item = DS.get(definition.name, id);

        if (!item) {
          if (definition.methods || definition.useClass) {
            if (attrs instanceof definition[definition.class]) {
              item = attrs;
            } else {
              item = new definition[definition.class]();
            }
          } else {
            item = {};
          }
          resource.previousAttributes[id] = {};

          DS.utils.deepMixIn(item, attrs);
          DS.utils.deepMixIn(resource.previousAttributes[id], attrs);

          resource.collection.push(item);

          resource.observers[id] = new observe.ObjectObserver(item);
          resource.observers[id].open(_react, item);
          resource.index.put(id, item);

          _react.call(item, {}, {}, {});
        } else {
          DS.utils.deepMixIn(item, attrs);
          if (typeof resource.index.touch === 'function') {
            resource.index.touch(id);
          } else {
            resource.index.put(id, resource.index.get(id));
          }
          resource.observers[id].deliver();
        }
        resource.saved[id] = DS.utils.updateTimestamp(resource.saved[id]);
        definition.afterInject(definition.name, item);
        injected = item;
      } catch (err) {
        $log.error(err);
        $log.error('inject failed!', definition.name, attrs);
      }
    }
  }
  return injected;
}

function _injectRelations(definition, injected) {
  var DS = this;
  DS.utils.forOwn(definition.relations, function (relation, type) {
    DS.utils.forOwn(relation, function (def, relationName) {
      if (DS.definitions[relationName] && injected[def.localField]) {
        try {
          injected[def.localField] = DS.inject(relationName, injected[def.localField]);
        } catch (err) {
          DS.$log.error(errorPrefix(definition.name) + 'Failed to inject ' + type + ' relation: "' + relationName + '"!', err);
        }
      }
    });
  });
}

/**
 * @doc method
 * @id DS.sync_methods:inject
 * @name inject
 * @description
 * Inject the given item into the data store as the specified type. If `attrs` is an array, inject each item into the
 * data store. Injecting an item into the data store does not save it to the server. Emits a `"DS.inject"` event.
 *
 * ## Signature:
 * ```js
 * DS.inject(resourceName, attrs[, options])
 * ```
 *
 * ## Examples:
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
 * ```js
 * $rootScope.$on('DS.inject', function ($event, resourceName, injected) {...});
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{RuntimeError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {object|array} attrs The item or collection of items to inject into the data store.
 * @returns {object|array} A reference to the item that was injected into the data store or an array of references to
 * the items that were injected into the data store.
 */
function inject(resourceName, attrs) {
  var DS = this;
  var IA = DS.errors.IA;

  if (!DS.definitions[resourceName]) {
    throw new DS.errors.NER(errorPrefix(resourceName) + resourceName);
  } else if (!DS.utils.isObject(attrs) && !DS.utils.isArray(attrs)) {
    throw new IA(errorPrefix(resourceName) + 'attrs: Must be an object or an array!');
  }
  var definition = DS.definitions[resourceName];
  var resource = DS.store[resourceName];
  var injected;

  if (!DS.$rootScope.$$phase) {
    DS.$rootScope.$apply(function () {
      injected = _inject.call(DS, definition, resource, attrs);
    });
  } else {
    injected = _inject.call(DS, definition, resource, attrs);
  }
  if (definition.relations) {
    _injectRelations.call(DS, definition, injected);
  }

  DS.notify(definition, 'inject', injected);

  return injected;
}

module.exports = inject;
