var _compute = require('./compute')._compute;

function errorPrefix(resourceName) {
  return 'DS.inject(' + resourceName + ', attrs[, options]): ';
}

function _inject(definition, resource, attrs, options) {
  var DS = this;
  var DSUtils = DS.utils;
  var $log = DS.$log;

  function _react(added, removed, changed, oldValueFn, firstTime) {
    var target = this;
    var item;
    var innerId = (oldValueFn && oldValueFn(definition.idAttribute)) ? oldValueFn(definition.idAttribute) : target[definition.idAttribute];

    DSUtils.forEach(definition.relationFields, function (field) {
      delete added[field];
      delete removed[field];
      delete changed[field];
    });

    if (!DSUtils.isEmpty(added) || !DSUtils.isEmpty(removed) || !DSUtils.isEmpty(changed) || firstTime) {
      item = DS.get(definition.name, innerId);
      resource.modified[innerId] = DSUtils.updateTimestamp(resource.modified[innerId]);
      resource.collectionModified = DSUtils.updateTimestamp(resource.collectionModified);
      if (definition.keepChangeHistory) {
        var changeRecord = {
          resourceName: definition.name,
          target: item,
          added: added,
          removed: removed,
          changed: changed,
          timestamp: resource.modified[innerId]
        };
        resource.changeHistories[innerId].push(changeRecord);
        resource.changeHistory.push(changeRecord);
      }
    }

    if (definition.computed) {
      item = item || DS.get(definition.name, innerId);
      DSUtils.forEach(definition.computed, function (fn, field) {
        var compute = false;
        // check if required fields changed
        angular.forEach(fn.deps, function (dep) {
          if (dep in added || dep in removed || dep in changed || !(field in item)) {
            compute = true;
          }
        });
        compute = compute || !fn.deps.length;
        if (compute) {
          _compute.call(item, fn, field);
        }
      });
    }

    if (definition.relations) {
      item = item || DS.get(definition.name, innerId);
      DSUtils.forEach(definition.relationList, function (def) {
        if (item[def.localField] && (def.localKey in added || def.localKey in removed || def.localKey in changed)) {
          DS.link(definition.name, item[definition.idAttribute], [def.relation]);
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
  if (DSUtils.isArray(attrs)) {
    injected = [];
    for (var i = 0; i < attrs.length; i++) {
      injected.push(_inject.call(DS, definition, resource, attrs[i], options));
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
        DSUtils.forEach(definition.relationList, function (def) {
          var relationName = def.relation;
          var relationDef = DS.definitions[relationName];
          var toInject = attrs[def.localField];
          if (toInject) {
            if (!relationDef) {
              throw new DS.errors.R(definition.name + 'relation is defined but the resource is not!');
            }
            if (DSUtils.isArray(toInject)) {
              var items = [];
              DSUtils.forEach(toInject, function (toInjectItem) {
                if (toInjectItem !== DS.store[relationName][toInjectItem[relationDef.idAttribute]]) {
                  try {
                    var injectedItem = DS.inject(relationName, toInjectItem, options);
                    if (def.foreignKey) {
                      injectedItem[def.foreignKey] = attrs[definition.idAttribute];
                    }
                    items.push(injectedItem);
                  } catch (err) {
                    DS.$log.error(errorPrefix(definition.name) + 'Failed to inject ' + def.type + ' relation: "' + relationName + '"!', err);
                  }
                }
              });
              attrs[def.localField] = items;
            } else {
              if (toInject !== DS.store[relationName][toInject[relationDef.idAttribute]]) {
                try {
                  attrs[def.localField] = DS.inject(relationName, attrs[def.localField], options);
                  if (def.foreignKey) {
                    attrs[def.localField][def.foreignKey] = attrs[definition.idAttribute];
                  }
                } catch (err) {
                  DS.$log.error(errorPrefix(definition.name) + 'Failed to inject ' + def.type + ' relation: "' + relationName + '"!', err);
                }
              }
            }
          }
        });

        definition.beforeInject(definition.name, attrs);
        var id = attrs[idA];
        var item = DS.get(definition.name, id);
        var initialLastModified = item ? resource.modified[id] : 0;

        if (!item) {
          if (options.useClass) {
            if (attrs instanceof definition[definition['class']]) {
              item = attrs;
            } else {
              item = new definition[definition['class']]();
            }
          } else {
            item = {};
          }
          resource.previousAttributes[id] = DSUtils.copy(attrs);

          DSUtils.deepMixIn(item, attrs);

          resource.collection.push(item);

          resource.changeHistories[id] = [];
          resource.observers[id] = new DSUtils.observe.ObjectObserver(item);
          resource.observers[id].open(_react, item);
          resource.index.put(id, item);

          _react.call(item, {}, {}, {}, null, true);
        } else {
          DSUtils.deepMixIn(item, attrs);
          if (definition.resetHistoryOnInject) {
            resource.previousAttributes[id] = DSUtils.copy(attrs);
            if (resource.changeHistories[id].length) {
              DSUtils.forEach(resource.changeHistories[id], function (changeRecord) {
                DSUtils.remove(resource.changeHistory, changeRecord);
              });
              resource.changeHistories[id].splice(0, resource.changeHistories[id].length);
            }
          }
          if (typeof resource.index.touch === 'function') {
            resource.index.touch(id);
          } else {
            resource.index.put(id, resource.index.get(id));
          }
          resource.observers[id].deliver();
        }
        resource.saved[id] = DSUtils.updateTimestamp(resource.saved[id]);
        resource.modified[id] = initialLastModified && resource.modified[id] === initialLastModified ? DSUtils.updateTimestamp(resource.modified[id]) : resource.modified[id];

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

function _link(definition, injected, options) {
  var DS = this;

  DS.utils.forEach(definition.relationList, function (def) {
    if (options.findBelongsTo && def.type === 'belongsTo' && injected[definition.idAttribute]) {
      DS.link(definition.name, injected[definition.idAttribute], [def.relation]);
    } else if ((options.findHasMany && def.type === 'hasMany') || (options.findHasOne && def.type === 'hasOne')) {
      DS.link(definition.name, injected[definition.idAttribute], [def.relation]);
    }
  });
}

/**
 * @doc method
 * @id DS.sync methods:inject
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
 * @param {object=} options The item or collection of items to inject into the data store. Properties:
 *
 * - `{boolean=}` - `useClass` - Whether to wrap the injected item with the resource's instance constructor.
 * - `{boolean=}` - `findBelongsTo` - Find and attach any existing "belongsTo" relationships to the newly injected item. Potentially expensive if enabled. Default: `false`.
 * - `{boolean=}` - `findHasMany` - Find and attach any existing "hasMany" relationships to the newly injected item. Potentially expensive if enabled. Default: `false`.
 * - `{boolean=}` - `findHasOne` - Find and attach any existing "hasOne" relationships to the newly injected item. Potentially expensive if enabled. Default: `false`.
 * - `{boolean=}` - `linkInverse` - Look in the data store for relations of the injected item(s) and update their links to the injected. Potentially expensive if enabled. Default: `false`.
 *
 * @returns {object|array} A reference to the item that was injected into the data store or an array of references to
 * the items that were injected into the data store.
 */
function inject(resourceName, attrs, options) {
  var DS = this;
  var IA = DS.errors.IA;
  var definition = DS.definitions[resourceName];

  options = options || {};

  if (!definition) {
    throw new DS.errors.NER(errorPrefix(resourceName) + resourceName);
  } else if (!DS.utils.isObject(attrs) && !DS.utils.isArray(attrs)) {
    throw new IA(errorPrefix(resourceName) + 'attrs: Must be an object or an array!');
  } else if (!DS.utils.isObject(options)) {
    throw new IA(errorPrefix(resourceName) + 'options: Must be an object!');
  }
  var resource = DS.store[resourceName];
  var injected;

  if (!('useClass' in options)) {
    options.useClass = definition.useClass;
  }
  if (!('notify' in options)) {
    options.notify = definition.notify;
  }
  if (!DS.$rootScope.$$phase) {
    DS.$rootScope.$apply(function () {
      injected = _inject.call(DS, definition, resource, attrs, options);
      resource.collectionModified = DS.utils.updateTimestamp(resource.collectionModified);
    });
  } else {
    injected = _inject.call(DS, definition, resource, attrs, options);
    resource.collectionModified = DS.utils.updateTimestamp(resource.collectionModified);
  }

  if (options.linkInverse && typeof options.linkInverse === 'boolean') {
    if (DS.utils.isArray(injected)) {
      if (injected.length) {
        DS.linkInverse(definition.name, injected[0][definition.idAttribute]);
      }
    } else {
      DS.linkInverse(definition.name, injected[definition.idAttribute]);
    }
  }

  if (DS.utils.isArray(injected)) {
    DS.utils.forEach(injected, function (injectedI) {
      _link.call(DS, definition, injectedI, options);
    });
  } else {
    _link.call(DS, definition, injected, options);
  }

  if (options.notify) {
    DS.emit(definition, 'inject', injected);
  }

  return injected;
}

module.exports = inject;
