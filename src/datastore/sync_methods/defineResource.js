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

var methodsToProxy = [
  'bindAll',
  'bindOne',
  'changes',
  'create',
  'createInstance',
  'destroy',
  'destroyAll',
  'eject',
  'ejectAll',
  'filter',
  'find',
  'findAll',
  'get',
  'hasChanges',
  'inject',
  'lastModified',
  'lastSaved',
  'loadRelations',
  'previous',
  'refresh',
  'save',
  'update',
  'updateAll'
];

/**
 * @doc method
 * @id DS.sync_methods:defineResource
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
  var IA = this.errors.IA;
  var DS = this;

  if (this.utils.isString(definition)) {
    definition = definition.replace(/\s/gi, '');
    definition = {
      name: definition
    };
  }
  if (!this.utils.isObject(definition)) {
    throw new IA(errorPrefix + 'definition: Must be an object!');
  } else if (!this.utils.isString(definition.name)) {
    throw new IA(errorPrefix + 'definition.name: Must be a string!');
  } else if (definition.idAttribute && !this.utils.isString(definition.idAttribute)) {
    throw new IA(errorPrefix + 'definition.idAttribute: Must be a string!');
  } else if (definition.endpoint && !this.utils.isString(definition.endpoint)) {
    throw new IA(errorPrefix + 'definition.endpoint: Must be a string!');
  } else if (this.store[definition.name]) {
    throw new this.errors.R(errorPrefix + definition.name + ' is already registered!');
  }

  try {
    // Inherit from global defaults
    Resource.prototype = DS.defaults;
    DS.definitions[definition.name] = new Resource(DS.utils, definition);

    var def = DS.definitions[definition.name];

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
        DS.eject(def.name, id);
      },
      capacity: Number.MAX_VALUE,
      storageMode: 'memory',
      storageImpl: null,
      disabled: false,
      storagePrefix: 'DS.' + def.name
    });

    // Create the wrapper class for the new resource
    def.class = DS.utils.pascalCase(definition.name);
    eval('function ' + def.class + '() {}');
    def[def.class] = eval(def.class);

    // Apply developer-defined methods
    if (def.methods) {
      DS.utils.deepMixIn(def[def.class].prototype, def.methods);
    }

    // Prepare for computed properties
    if (def.computed) {
      DS.utils.forOwn(def.computed, function (fn, field) {
        if (def.methods && field in def.methods) {
          DS.$log.warn(errorPrefix + 'Computed property "' + field + '" conflicts with previously defined prototype method!');
        }
        var deps;
        if (angular.isFunction(fn)) {
          var match = fn.toString().match(/function.*?\(([\s\S]*?)\)/);
          deps = match[1].split(',');
          DS.$log.warn(errorPrefix + 'Use the computed property array for compatibility with minified code!');
        } else {
          deps = fn.slice(0, fn.length - 1);
        }
        fn.deps = DS.utils.filter(deps, function (dep) {
          return !!dep;
        });
        angular.forEach(fn.deps, function (val, index) {
          fn.deps[index] = val.trim();
        });
      });
    }

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

    return def;
  } catch (err) {
    DS.$log.error(err);
    delete this.definitions[definition.name];
    delete this.store[definition.name];
    throw err;
  }
}

module.exports = defineResource;
