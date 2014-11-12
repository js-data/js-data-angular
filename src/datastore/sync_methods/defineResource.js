/*jshint evil:true*/
var errorPrefix = 'DS.defineResource(definition): ';

function Resource(utils, options) {

  utils.deepMixIn(this, options);

  if ('endpoint' in options) {
    this.endpoint = options.endpoint;
  } else {
    this.endpoint = this.name;
  }
}

var instanceMethods = [
  'save',
  'update',
  'destroy',
  'refresh',
  'loadRelations',
  'changeHistory',
  'changes',
  'hasChanges',
  'lastModified',
  'lastSaved',
  'link',
  'linkInverse',
  'previous',
  'unlinkInverse'
];

var methodsToProxy = [
  'bindAll',
  'bindOne',
  'changes',
  'changeHistory',
  'create',
  'createInstance',
  'destroy',
  'destroyAll',
  'digest',
  'eject',
  'ejectAll',
  'filter',
  'find',
  'findAll',
  'get',
  'getAll',
  'hasChanges',
  'inject',
  'lastModified',
  'lastSaved',
  'link',
  'linkAll',
  'linkInverse',
  'loadRelations',
  'previous',
  'refresh',
  'save',
  'update',
  'updateAll'
];

/**
 * @doc method
 * @id DS.sync methods:defineResource
 * @name defineResource
 * @description
 * Define a resource and register it with the data store.
 *
 * ## Signature:
 * ```js
 * DS.defineResource(definition)
 * ```
 *
 * ## Example:
 *
 * ```js
 *  DS.defineResource({
 *      name: 'document',
 *      idAttribute: '_id',
 *      endpoint: '/documents
 *      baseUrl: 'http://myapp.com/api',
 *      beforeDestroy: function (resourceName attrs, cb) {
 *          console.log('looks good to me');
 *          cb(null, attrs);
 *      }
 *  });
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{RuntimeError}`
 *
 * @param {string|object} definition Name of resource or resource definition object: Properties:
 *
 * - `{string}` - `name` - The name by which this resource will be identified.
 * - `{string="id"}` - `idAttribute` - The attribute that specifies the primary key for this resource.
 * - `{string=}` - `endpoint` - The attribute that specifies the primary key for this resource. Default is the value of `name`.
 * - `{string=}` - `baseUrl` - The url relative to which all AJAX requests will be made.
 * - `{boolean=}` - `useClass` - Whether to use a wrapper class created from the ProperCase name of the resource. The wrapper will always be used for resources that have `methods` defined.
 * - `{boolean=}` - `keepChangeHistory` - Whether to keep a history of changes for items in the data store. Default: `false`.
 * - `{boolean=}` - `resetHistoryOnInject` - Whether to reset the history of changes for items when they are injected of re-injected into the data store. This will also reset an item's previous attributes. Default: `true`.
 * - `{function=}` - `defaultFilter` - Override the filtering used internally by `DS.filter` with you own function here.
 * - `{*=}` - `meta` - A property reserved for developer use. This will never be used by the API.
 * - `{object=}` - `methods` - If provided, items of this resource will be wrapped in a constructor function that is
 * empty save for the attributes in this option which will be mixed in to the constructor function prototype. Enabling
 * this feature for this resource will incur a slight performance penalty, but allows you to give custom behavior to what
 * are now "instances" of this resource.
 * - `{function=}` - `beforeValidate` - Lifecycle hook. Overrides global. Signature: `beforeValidate(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `validate` - Lifecycle hook. Overrides global. Signature: `validate(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `afterValidate` - Lifecycle hook. Overrides global. Signature: `afterValidate(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `beforeCreate` - Lifecycle hook. Overrides global. Signature: `beforeCreate(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `afterCreate` - Lifecycle hook. Overrides global. Signature: `afterCreate(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `beforeUpdate` - Lifecycle hook. Overrides global. Signature: `beforeUpdate(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `afterUpdate` - Lifecycle hook. Overrides global. Signature: `afterUpdate(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `beforeDestroy` - Lifecycle hook. Overrides global. Signature: `beforeDestroy(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `afterDestroy` - Lifecycle hook. Overrides global. Signature: `afterDestroy(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `beforeInject` - Lifecycle hook. Overrides global. Signature: `beforeInject(resourceName, attrs)`.
 * - `{function=}` - `afterInject` - Lifecycle hook. Overrides global. Signature: `afterInject(resourceName, attrs)`.
 * - `{function=}` - `serialize` - Serialization hook. Overrides global. Signature: `serialize(resourceName, attrs)`.
 * - `{function=}` - `deserialize` - Deserialization hook. Overrides global. Signature: `deserialize(resourceName, attrs)`.
 *
 * See [DSProvider.defaults](/documentation/api/angular-data/DSProvider.properties:defaults).
 */
function defineResource(definition) {
  var DS = this;
  var DSUtils = DS.utils;
  var definitions = DS.definitions;
  var IA = DS.errors.IA;

  if (DSUtils.isString(definition)) {
    definition = definition.replace(/\s/gi, '');
    definition = {
      name: definition
    };
  }

  var defName = definition ? definition.name : undefined;

  if (!DSUtils.isObject(definition)) {
    throw new IA(errorPrefix + 'definition: Must be an object!');
  } else if (!DSUtils.isString(defName)) {
    throw new IA(errorPrefix + 'definition.name: Must be a string!');
  } else if (definition.idAttribute && !DSUtils.isString(definition.idAttribute)) {
    throw new IA(errorPrefix + 'definition.idAttribute: Must be a string!');
  } else if (definition.endpoint && !DSUtils.isString(definition.endpoint)) {
    throw new IA(errorPrefix + 'definition.endpoint: Must be a string!');
  } else if (DS.store[defName]) {
    throw new DS.errors.R(errorPrefix + defName + ' is already registered!');
  }

  try {
    // Inherit from global defaults
    Resource.prototype = DS.defaults;
    definitions[defName] = new Resource(DSUtils, definition);

    var def = definitions[defName];

    // Setup nested parent configuration
    if (def.relations) {
      def.relationList = [];
      def.relationFields = [];
      DSUtils.forEach(def.relations, function (relatedModels, type) {
        DSUtils.forEach(relatedModels, function (defs, relationName) {
          if (!DSUtils.isArray(defs)) {
            relatedModels[relationName] = [defs];
          }
          DSUtils.forEach(relatedModels[relationName], function (d) {
            d.type = type;
            d.relation = relationName;
            d.name = def.name;
            def.relationList.push(d);
            def.relationFields.push(d.localField);
          });
        });
      });
      if (def.relations.belongsTo) {
        DSUtils.forEach(def.relations.belongsTo, function (relatedModel, modelName) {
          DSUtils.forEach(relatedModel, function (relation) {
            if (relation.parent) {
              def.parent = modelName;
              def.parentKey = relation.localKey;
            }
          });
        });
      }
      DSUtils.deepFreeze(def.relations);
      DSUtils.deepFreeze(def.relationList);
    }

    def.getEndpoint = function (attrs, options) {
      options = DSUtils.deepMixIn({}, options);
      var parent = this.parent;
      var parentKey = this.parentKey;
      var item;
      var endpoint;
      var thisEndpoint = options.endpoint || this.endpoint;
      delete options.endpoint;
      options = options || {};
      options.params = options.params || {};
      if (parent && parentKey && definitions[parent] && options.params[parentKey] !== false) {
        if (DSUtils.isNumber(attrs) || DSUtils.isString(attrs)) {
          item = DS.get(this.name, attrs);
        }
        if (DSUtils.isObject(attrs) && parentKey in attrs) {
          delete options.params[parentKey];
          endpoint = DSUtils.makePath(definitions[parent].getEndpoint(attrs, options), attrs[parentKey], thisEndpoint);
        } else if (item && parentKey in item) {
          delete options.params[parentKey];
          endpoint = DSUtils.makePath(definitions[parent].getEndpoint(attrs, options), item[parentKey], thisEndpoint);
        } else if (options && options.params[parentKey]) {
          endpoint = DSUtils.makePath(definitions[parent].getEndpoint(attrs, options), options.params[parentKey], thisEndpoint);
          delete options.params[parentKey];
        }
      }
      if (options.params[parentKey] === false) {
        delete options.params[parentKey];
      }
      return endpoint || thisEndpoint;
    };

    // Remove this in v0.11.0 and make a breaking change notice
    // the the `filter` option has been renamed to `defaultFilter`
    if (def.filter) {
      def.defaultFilter = def.filter;
      delete def.filter;
    }

    // Setup the cache
    var cache = DS.cacheFactory('DS.' + def.name, {
      maxAge: def.maxAge || null,
      recycleFreq: def.recycleFreq || 1000,
      cacheFlushInterval: def.cacheFlushInterval || null,
      deleteOnExpire: def.deleteOnExpire || 'none',
      onExpire: function (id) {
        var item = DS.eject(def.name, id);
        if (DSUtils.isFunction(def.onExpire)) {
          def.onExpire(id, item);
        }
      },
      capacity: Number.MAX_VALUE,
      storageMode: 'memory',
      storageImpl: null,
      disabled: false,
      storagePrefix: 'DS.' + def.name
    });

    // Create the wrapper class for the new resource
    def['class'] = DSUtils.pascalCase(defName);
    try {
      eval('function ' + def['class'] + '() {}');
      def[def['class']] = eval(def['class']);
    } catch (e) {
      def[def['class']] = function () {
      };
    }

    // Apply developer-defined methods
    if (def.methods) {
      DSUtils.deepMixIn(def[def['class']].prototype, def.methods);
    }

    // Prepare for computed properties
    if (def.computed) {
      DSUtils.forEach(def.computed, function (fn, field) {
        if (angular.isFunction(fn)) {
          def.computed[field] = [fn];
          fn = def.computed[field];
        }
        if (def.methods && field in def.methods) {
          DS.$log.warn(errorPrefix + 'Computed property "' + field + '" conflicts with previously defined prototype method!');
        }
        var deps;
        if (fn.length === 1) {
          var match = fn[0].toString().match(/function.*?\(([\s\S]*?)\)/);
          deps = match[1].split(',');
          def.computed[field] = deps.concat(fn);
          fn = def.computed[field];
          if (deps.length) {
            DS.$log.warn(errorPrefix + 'Use the computed property array syntax for compatibility with minified code!');
          }
        }
        deps = fn.slice(0, fn.length - 1);
        angular.forEach(deps, function (val, index) {
          deps[index] = val.trim();
        });
        fn.deps = DSUtils.filter(deps, function (dep) {
          return !!dep;
        });
      });

      def[def['class']].prototype.DSCompute = function () {
        return DS.compute(def.name, this);
      };
    }

    DSUtils.forEach(instanceMethods, function (name) {
      def[def['class']].prototype['DS' + DSUtils.pascalCase(name)] = function () {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(this[def.idAttribute]);
        args.unshift(def.name);
        return DS[name].apply(DS, args);
      };
    });

    // Initialize store data for the new resource
    DS.store[def.name] = {
      collection: [],
      completedQueries: {},
      pendingQueries: {},
      index: cache,
      modified: {},
      saved: {},
      previousAttributes: {},
      observers: {},
      changeHistories: {},
      changeHistory: [],
      collectionModified: 0
    };

    // Proxy DS methods with shorthand ones
    angular.forEach(methodsToProxy, function (name) {
      if (name === 'bindOne' || name === 'bindAll') {
        def[name] = function () {
          var args = Array.prototype.slice.call(arguments);
          args.splice(2, 0, def.name);
          return DS[name].apply(DS, args);
        };
      } else {
        def[name] = function () {
          var args = Array.prototype.slice.call(arguments);
          args.unshift(def.name);
          return DS[name].apply(DS, args);
        };
      }
    });

    def.beforeValidate = DS.$q.promisify(def.beforeValidate);
    def.validate = DS.$q.promisify(def.validate);
    def.afterValidate = DS.$q.promisify(def.afterValidate);
    def.beforeCreate = DS.$q.promisify(def.beforeCreate);
    def.afterCreate = DS.$q.promisify(def.afterCreate);
    def.beforeUpdate = DS.$q.promisify(def.beforeUpdate);
    def.afterUpdate = DS.$q.promisify(def.afterUpdate);
    def.beforeDestroy = DS.$q.promisify(def.beforeDestroy);
    def.afterDestroy = DS.$q.promisify(def.afterDestroy);

    // Mix-in events
    DSUtils.Events(def);

    return def;
  } catch (err) {
    DS.$log.error(err);
    delete definitions[defName];
    delete DS.store[defName];
    throw err;
  }
}

module.exports = defineResource;
