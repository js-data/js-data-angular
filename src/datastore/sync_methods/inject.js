var observe = require('../../../lib/observe-js/observe-js');
var errorPrefix = 'DS.inject(resourceName, attrs[, options]): ';

function _inject(definition, resource, attrs) {
  var _this = this;
  var $log = _this.$log;

  function _react(added, removed, changed, oldValueFn) {
    var target = this;
    var innerId = (oldValueFn && oldValueFn(definition.idAttribute)) ? oldValueFn(definition.idAttribute) : target[definition.idAttribute];

    resource.modified[innerId] = _this.utils.updateTimestamp(resource.modified[innerId]);
    resource.collectionModified = _this.utils.updateTimestamp(resource.collectionModified);

    if (definition.computed) {
      var item = _this.get(definition.name, innerId);
      _this.utils.forOwn(definition.computed, function (fn, field) {
        var compute = false;
        // check if required fields changed
        angular.forEach(fn.deps, function (dep) {
          if (dep in added || dep in removed || dep in changed || !(field in item)) {
            compute = true;
          }
        });
        if (compute) {
          var args = [];
          angular.forEach(fn.deps, function (dep) {
            args.push(item[dep]);
          });
          // recompute property
          if (angular.isFunction(fn)) {
            item[field] = fn.apply(item, args);
          } else {
            item[field] = fn[fn.length - 1].apply(item, args);
          }
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
  if (_this.utils.isArray(attrs)) {
    injected = [];
    for (var i = 0; i < attrs.length; i++) {
      injected.push(_inject.call(_this, definition, resource, attrs[i]));
    }
  } else {
    // check if "idAttribute" is a computed property
    if (definition.computed && definition.computed[definition.idAttribute]) {
      var args = [];
      angular.forEach(definition.computed[definition.idAttribute].deps, function (dep) {
        args.push(attrs[dep]);
      });
      attrs[definition.idAttribute] = definition.computed[definition.idAttribute].apply(attrs, args);
    }
    if (!(definition.idAttribute in attrs)) {
      var error = new _this.errors.R(errorPrefix + 'attrs: Must contain the property specified by `idAttribute`!');
      $log.error(error);
      throw error;
    } else {
      try {
        definition.beforeInject(definition.name, attrs);
        var id = attrs[definition.idAttribute];
        var item = this.get(definition.name, id);

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

          _this.utils.deepMixIn(item, attrs);
          _this.utils.deepMixIn(resource.previousAttributes[id], attrs);

          resource.collection.push(item);

          resource.observers[id] = new observe.ObjectObserver(item);
          resource.observers[id].open(_react, item);
          resource.index.put(id, item);

          _react.call(item, {}, {}, {});
        } else {
          _this.utils.deepMixIn(item, attrs);
          if (typeof resource.index.touch === 'function') {
            resource.index.touch(id);
          } else {
            resource.index.put(id, resource.index.get(id));
          }
          resource.observers[id].deliver();
        }
        resource.saved[id] = _this.utils.updateTimestamp(resource.saved[id]);
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
  var _this = this;
  _this.utils.forOwn(definition.relations, function (relation, type) {
    _this.utils.forOwn(relation, function (def, relationName) {
      if (_this.definitions[relationName] && injected[def.localField]) {
        try {
          injected[def.localField] = _this.inject(relationName, injected[def.localField]);
        } catch (err) {
          _this.$log.error(errorPrefix + 'Failed to inject ' + type + ' relation: "' + relationName + '"!', err);
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
 * data store. Injecting an item into the data store does not save it to the server.
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
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{RuntimeError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {object|array} attrs The item or collection of items to inject into the data store.
 * @param {object=} options Optional configuration.
 * @returns {object|array} A reference to the item that was injected into the data store or an array of references to
 * the items that were injected into the data store.
 */
function inject(resourceName, attrs, options) {
  var IA = this.errors.IA;

  options = options || {};

  if (!this.definitions[resourceName]) {
    throw new this.errors.NER(errorPrefix + resourceName);
  } else if (!this.utils.isObject(attrs) && !this.utils.isArray(attrs)) {
    throw new IA(errorPrefix + 'attrs: Must be an object or an array!');
  } else if (!this.utils.isObject(options)) {
    throw new IA(errorPrefix + 'options: Must be an object!');
  }

  var definition = this.definitions[resourceName];
  var resource = this.store[resourceName];
  var _this = this;

  var injected;
  if (!this.$rootScope.$$phase) {
    this.$rootScope.$apply(function () {
      injected = _inject.call(_this, definition, resource, attrs);
    });
  } else {
    injected = _inject.call(_this, definition, resource, attrs);
  }
  if (definition.relations) {
    _injectRelations.call(_this, definition, injected);
  }

  return injected;
}

module.exports = inject;
