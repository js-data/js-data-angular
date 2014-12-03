function lifecycleNoop(resourceName, attrs, cb) {
  cb(null, attrs);
}

function compare(DSUtils, orderBy, index, a, b) {
  var def = orderBy[index];
  var cA = a[def[0]], cB = b[def[0]];
  if (DSUtils.isString(cA)) {
    cA = DSUtils.upperCase(cA);
  }
  if (DSUtils.isString(cB)) {
    cB = DSUtils.upperCase(cB);
  }
  if (def[1] === 'DESC') {
    if (cB < cA) {
      return -1;
    } else if (cB > cA) {
      return 1;
    } else {
      if (index < orderBy.length - 1) {
        return compare(DSUtils, orderBy, index + 1, a, b);
      } else {
        return 0;
      }
    }
  } else {
    if (cA < cB) {
      return -1;
    } else if (cA > cB) {
      return 1;
    } else {
      if (index < orderBy.length - 1) {
        return compare(DSUtils, orderBy, index + 1, a, b);
      } else {
        return 0;
      }
    }
  }
}

function Defaults() {
}

Defaults.prototype.idAttribute = 'id';
Defaults.prototype.defaultAdapter = 'DSHttpAdapter';
Defaults.prototype.defaultFilter = function (collection, resourceName, params, options) {
  var _this = this;
  var DSUtils = _this.utils;
  var filtered = collection;
  var where = null;
  var reserved = {
    skip: '',
    offset: '',
    where: '',
    limit: '',
    orderBy: '',
    sort: ''
  };

  params = params || {};

  if (DSUtils.isObject(params.where)) {
    where = params.where;
  } else {
    where = {};
  }

  if (options.allowSimpleWhere) {
    DSUtils.forEach(params, function (value, key) {
      if (!(key in reserved) && !(key in where)) {
        where[key] = {
          '==': value
        };
      }
    });
  }

  if (DSUtils.isEmpty(where)) {
    where = null;
  }

  if (where) {
    filtered = DSUtils.filter(filtered, function (attrs) {
      var first = true;
      var keep = true;
      DSUtils.forEach(where, function (clause, field) {
        if (DSUtils.isString(clause)) {
          clause = {
            '===': clause
          };
        } else if (DSUtils.isNumber(clause) || DSUtils.isBoolean(clause)) {
          clause = {
            '==': clause
          };
        }
        if (DSUtils.isObject(clause)) {
          DSUtils.forEach(clause, function (term, op) {
            var expr;
            var isOr = op[0] === '|';
            var val = attrs[field];
            op = isOr ? op.substr(1) : op;
            if (op === '==') {
              expr = val == term;
            } else if (op === '===') {
              expr = val === term;
            } else if (op === '!=') {
              expr = val != term;
            } else if (op === '!==') {
              expr = val !== term;
            } else if (op === '>') {
              expr = val > term;
            } else if (op === '>=') {
              expr = val >= term;
            } else if (op === '<') {
              expr = val < term;
            } else if (op === '<=') {
              expr = val <= term;
            } else if (op === 'in') {
              if (DSUtils.isString(term)) {
                expr = term.indexOf(val) !== -1;
              } else {
                expr = DSUtils.contains(term, val);
              }
            } else if (op === 'notIn') {
              if (DSUtils.isString(term)) {
                expr = term.indexOf(val) === -1;
              } else {
                expr = !DSUtils.contains(term, val);
              }
            } else if (op === 'contains') {
              if (DSUtils.isString(term)) {
                expr = (val || '').indexOf(term) !== -1;
              } else {
                expr = DSUtils.contains(val, term);
              }
            } else if (op === 'notContains') {
              if (DSUtils.isString(term)) {
                expr = (val || '').indexOf(term) === -1;
              } else {
                expr = !DSUtils.contains(val, term);
              }
            }
            if (expr !== undefined) {
              keep = first ? expr : (isOr ? keep || expr : keep && expr);
            }
            first = false;
          });
        }
      });
      return keep;
    });
  }

  var orderBy = null;

  if (DSUtils.isString(params.orderBy)) {
    orderBy = [
      [params.orderBy, 'ASC']
    ];
  } else if (DSUtils.isArray(params.orderBy)) {
    orderBy = params.orderBy;
  }

  if (!orderBy && DSUtils.isString(params.sort)) {
    orderBy = [
      [params.sort, 'ASC']
    ];
  } else if (!orderBy && DSUtils.isArray(params.sort)) {
    orderBy = params.sort;
  }

  // Apply 'orderBy'
  if (orderBy) {
    var index = 0;
    angular.forEach(orderBy, function (def, i) {
      if (DSUtils.isString(def)) {
        orderBy[i] = [def, 'ASC'];
      } else if (!DSUtils.isArray(def)) {
        throw new _this.errors.IllegalArgumentError('DS.filter(resourceName[, params][, options]): ' + JSON.stringify(def) + ': Must be a string or an array!', {
          params: {
            'orderBy[i]': {
              actual: typeof def,
              expected: 'string|array'
            }
          }
        });
      }
      filtered = DSUtils.sort(filtered, function (a, b) {
        return compare(DSUtils, orderBy, index, a, b);
      });
    });
  }

  var limit = angular.isNumber(params.limit) ? params.limit : null;
  var skip = null;

  if (angular.isNumber(params.skip)) {
    skip = params.skip;
  } else if (angular.isNumber(params.offset)) {
    skip = params.offset;
  }

  // Apply 'limit' and 'skip'
  if (limit && skip) {
    filtered = _this.utils.slice(filtered, skip, Math.min(filtered.length, skip + limit));
  } else if (_this.utils.isNumber(limit)) {
    filtered = _this.utils.slice(filtered, 0, Math.min(filtered.length, limit));
  } else if (_this.utils.isNumber(skip)) {
    if (skip < filtered.length) {
      filtered = _this.utils.slice(filtered, skip);
    } else {
      filtered = [];
    }
  }

  return filtered;
};
Defaults.prototype.baseUrl = '';
Defaults.prototype.endpoint = '';
Defaults.prototype.useClass = true;
Defaults.prototype.keepChangeHistory = false;
Defaults.prototype.resetHistoryOnInject = true;
Defaults.prototype.eagerInject = false;
Defaults.prototype.eagerEject = false;
Defaults.prototype.notify = true;
Defaults.prototype.cacheResponse = true;
Defaults.prototype.upsert = true;
Defaults.prototype.allowSimpleWhere = true;
/**
 * @doc property
 * @id DSProvider.properties:defaults.ignoredChanges
 * @name defaults.ignoredChanges
 * @description
 * Array of strings or regular expressions which can be ignored when diffing two objects for changes
 *
 * ## Example:
 * ```js
 *  // ignore $ or _ prefixed changes
 *  DSProvider.defaults.ignoredChanges = [/\$|\_/];
 * ```
 *
 * @value {array} ignoredChanges Array of changes to ignore. Defaults to ignoring $ prefixed changes: [/\$/]
 */
Defaults.prototype.ignoredChanges = [/\$/];
/**
 * @doc property
 * @id DSProvider.properties:defaults.beforeValidate
 * @name defaults.beforeValidate
 * @description
 * Called before the `validate` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * beforeValidate(resourceName, attrs, cb)
 * ```
 *
 * ## Callback signature:
 * ```js
 * cb(err, attrs)
 * ```
 * Remember to pass the attributes along to the next step. Passing a first argument to the callback will abort the
 * lifecycle and reject the promise.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.beforeValidate = function (resourceName, attrs, cb) {
 *      // do somthing/inspect attrs
 *      cb(null, attrs);
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.beforeValidate = lifecycleNoop;
/**
 * @doc property
 * @id DSProvider.properties:defaults.validate
 * @name defaults.validate
 * @description
 * Called before the `afterValidate` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * validate(resourceName, attrs, cb)
 * ```
 *
 * ## Callback signature:
 * ```js
 * cb(err, attrs)
 * ```
 * Remember to pass the attributes along to the next step. Passing a first argument to the callback will abort the
 * lifecycle and reject the promise.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.validate = function (resourceName, attrs, cb) {
 *      // do somthing/inspect attrs
 *      cb(null, attrs);
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.validate = lifecycleNoop;
/**
 * @doc property
 * @id DSProvider.properties:defaults.afterValidate
 * @name defaults.afterValidate
 * @description
 * Called before the `beforeCreate` or `beforeUpdate` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * afterValidate(resourceName, attrs, cb)
 * ```
 *
 * ## Callback signature:
 * ```js
 * cb(err, attrs)
 * ```
 * Remember to pass the attributes along to the next step. Passing a first argument to the callback will abort the
 * lifecycle and reject the promise.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.afterValidate = function (resourceName, attrs, cb) {
 *      // do somthing/inspect attrs
 *      cb(null, attrs);
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.afterValidate = lifecycleNoop;
/**
 * @doc property
 * @id DSProvider.properties:defaults.beforeCreate
 * @name defaults.beforeCreate
 * @description
 * Called before the `create` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * beforeCreate(resourceName, attrs, cb)
 * ```
 *
 * ## Callback signature:
 * ```js
 * cb(err, attrs)
 * ```
 * Remember to pass the attributes along to the next step. Passing a first argument to the callback will abort the
 * lifecycle and reject the promise.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.beforeCreate = function (resourceName, attrs, cb) {
 *      // do somthing/inspect attrs
 *      cb(null, attrs);
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.beforeCreate = lifecycleNoop;
/**
 * @doc property
 * @id DSProvider.properties:defaults.afterCreate
 * @name defaults.afterCreate
 * @description
 * Called after the `create` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * afterCreate(resourceName, attrs, cb)
 * ```
 *
 * ## Callback signature:
 * ```js
 * cb(err, attrs)
 * ```
 * Remember to pass the attributes along to the next step. Passing a first argument to the callback will abort the
 * lifecycle and reject the promise.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.afterCreate = function (resourceName, attrs, cb) {
 *      // do somthing/inspect attrs
 *      cb(null, attrs);
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.afterCreate = lifecycleNoop;
/**
 * @doc property
 * @id DSProvider.properties:defaults.beforeUpdate
 * @name defaults.beforeUpdate
 * @description
 * Called before the `update` or `save` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * beforeUpdate(resourceName, attrs, cb)
 * ```
 *
 * ## Callback signature:
 * ```js
 * cb(err, attrs)
 * ```
 * Remember to pass the attributes along to the next step. Passing a first argument to the callback will abort the
 * lifecycle and reject the promise.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.beforeUpdate = function (resourceName, attrs, cb) {
 *      // do somthing/inspect attrs
 *      cb(null, attrs);
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.beforeUpdate = lifecycleNoop;
/**
 * @doc property
 * @id DSProvider.properties:defaults.afterUpdate
 * @name defaults.afterUpdate
 * @description
 * Called after the `update` or `save` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * afterUpdate(resourceName, attrs, cb)
 * ```
 *
 * ## Callback signature:
 * ```js
 * cb(err, attrs)
 * ```
 * Remember to pass the attributes along to the next step. Passing a first argument to the callback will abort the
 * lifecycle and reject the promise.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.afterUpdate = function (resourceName, attrs, cb) {
 *      // do somthing/inspect attrs
 *      cb(null, attrs);
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.afterUpdate = lifecycleNoop;
/**
 * @doc property
 * @id DSProvider.properties:defaults.beforeDestroy
 * @name defaults.beforeDestroy
 * @description
 * Called before the `destroy` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * beforeDestroy(resourceName, attrs, cb)
 * ```
 *
 * ## Callback signature:
 * ```js
 * cb(err, attrs)
 * ```
 * Remember to pass the attributes along to the next step. Passing a first argument to the callback will abort the
 * lifecycle and reject the promise.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.beforeDestroy = function (resourceName, attrs, cb) {
 *      // do somthing/inspect attrs
 *      cb(null, attrs);
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.beforeDestroy = lifecycleNoop;
/**
 * @doc property
 * @id DSProvider.properties:defaults.afterDestroy
 * @name defaults.afterDestroy
 * @description
 * Called after the `destroy` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * afterDestroy(resourceName, attrs, cb)
 * ```
 *
 * ## Callback signature:
 * ```js
 * cb(err, attrs)
 * ```
 * Remember to pass the attributes along to the next step. Passing a first argument to the callback will abort the
 * lifecycle and reject the promise.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.afterDestroy = function (resourceName, attrs, cb) {
 *      // do somthing/inspect attrs
 *      cb(null, attrs);
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.afterDestroy = lifecycleNoop;
/**
 * @doc property
 * @id DSProvider.properties:defaults.beforeInject
 * @name defaults.beforeInject
 * @description
 * Called before the `inject` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * beforeInject(resourceName, attrs)
 * ```
 *
 * Throwing an error inside this step will cancel the injection.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.beforeInject = function (resourceName, attrs) {
 *      // do somthing/inspect/modify attrs
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.beforeInject = function (resourceName, attrs) {
  return attrs;
};
/**
 * @doc property
 * @id DSProvider.properties:defaults.afterInject
 * @name defaults.afterInject
 * @description
 * Called after the `inject` lifecycle step. Can be overridden per resource as well.
 *
 * ## Signature:
 * ```js
 * afterInject(resourceName, attrs)
 * ```
 *
 * Throwing an error inside this step will cancel the injection.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.afterInject = function (resourceName, attrs) {
 *      // do somthing/inspect/modify attrs
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource moving through the lifecycle.
 * @param {object} attrs Attributes of the item moving through the lifecycle.
 */
Defaults.prototype.afterInject = function (resourceName, attrs) {
  return attrs;
};
/**
 * @doc property
 * @id DSProvider.properties:defaults.serialize
 * @name defaults.serialize
 * @description
 * Your server might expect a custom request object rather than the plain POJO payload. Use `serialize` to
 * create your custom request object.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.serialize = function (resourceName, data) {
 *      return {
 *          payload: data
 *      };
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource to serialize.
 * @param {object} data Data to be sent to the server.
 * @returns {*} By default returns `data` as-is.
 */
Defaults.prototype.serialize = function (resourceName, data) {
  return data;
};

/**
 * @doc property
 * @id DSProvider.properties:defaults.deserialize
 * @name DSProvider.properties:defaults.deserialize
 * @description
 * Your server might return a custom response object instead of the plain POJO payload. Use `deserialize` to
 * pull the payload out of your response object so angular-data can use it.
 *
 * ## Example:
 * ```js
 *  DSProvider.defaults.deserialize = function (resourceName, data) {
 *      return data ? data.payload : data;
 *  };
 * ```
 *
 * @param {string} resourceName The name of the resource to deserialize.
 * @param {object} data Response object from `$http()`.
 * @returns {*} By default returns `data.data`.
 */
Defaults.prototype.deserialize = function (resourceName, data) {
  return data ? (data.data ? data.data : data) : data;
};

/**
 * @doc property
 * @id DSProvider.properties:defaults.events
 * @name DSProvider.properties:defaults.events
 * @description
 * Whether to broadcast, emit, or disable DS events on the `$rootScope`.
 *
 * Possible values are: `"broadcast"`, `"emit"`, `"none"`.
 *
 * `"broadcast"` events will be [broadcasted](https://code.angularjs.org/1.2.22/docs/api/ng/type/$rootScope.Scope#$broadcast) on the `$rootScope`.
 *
 * `"emit"` events will be [emitted](https://code.angularjs.org/1.2.22/docs/api/ng/type/$rootScope.Scope#$emit) on the `$rootScope`.
 *
 * `"none"` events will be will neither be broadcasted nor emitted.
 *
 * Current events are `"DS.inject"` and `"DS.eject"`.
 *
 * Overridable per resource.
 */
Defaults.prototype.events = 'broadcast';

/**
 * @doc function
 * @id DSProvider
 * @name DSProvider
 */
function DSProvider() {

  /**
   * @doc property
   * @id DSProvider.properties:defaults
   * @name defaults
   * @description
   * See the [configuration guide](/documentation/guide/configure/global).
   *
   * Properties:
   *
   * - `{string}` - `baseUrl` - The url relative to which all AJAX requests will be made.
   * - `{string}` - `idAttribute` - Default: `"id"` - The attribute that specifies the primary key for resources.
   * - `{string}` - `defaultAdapter` - Default: `"DSHttpAdapter"`
   * - `{string}` - `events` - Default: `"broadcast"` [DSProvider.defaults.events](/documentation/api/angular-data/DSProvider.properties:defaults.events)
   * - `{function}` - `filter` - Default: See [angular-data query language](/documentation/guide/queries/custom).
   * - `{function}` - `beforeValidate` - See [DSProvider.defaults.beforeValidate](/documentation/api/angular-data/DSProvider.properties:defaults.beforeValidate). Default: No-op
   * - `{function}` - `validate` - See [DSProvider.defaults.validate](/documentation/api/angular-data/DSProvider.properties:defaults.validate). Default: No-op
   * - `{function}` - `afterValidate` - See [DSProvider.defaults.afterValidate](/documentation/api/angular-data/DSProvider.properties:defaults.afterValidate). Default: No-op
   * - `{function}` - `beforeCreate` - See [DSProvider.defaults.beforeCreate](/documentation/api/angular-data/DSProvider.properties:defaults.beforeCreate). Default: No-op
   * - `{function}` - `afterCreate` - See [DSProvider.defaults.afterCreate](/documentation/api/angular-data/DSProvider.properties:defaults.afterCreate). Default: No-op
   * - `{function}` - `beforeUpdate` - See [DSProvider.defaults.beforeUpdate](/documentation/api/angular-data/DSProvider.properties:defaults.beforeUpdate). Default: No-op
   * - `{function}` - `afterUpdate` - See [DSProvider.defaults.afterUpdate](/documentation/api/angular-data/DSProvider.properties:defaults.afterUpdate). Default: No-op
   * - `{function}` - `beforeDestroy` - See [DSProvider.defaults.beforeDestroy](/documentation/api/angular-data/DSProvider.properties:defaults.beforeDestroy). Default: No-op
   * - `{function}` - `afterDestroy` - See [DSProvider.defaults.afterDestroy](/documentation/api/angular-data/DSProvider.properties:defaults.afterDestroy). Default: No-op
   * - `{function}` - `afterInject` - See [DSProvider.defaults.afterInject](/documentation/api/angular-data/DSProvider.properties:defaults.afterInject). Default: No-op
   * - `{function}` - `beforeInject` - See [DSProvider.defaults.beforeInject](/documentation/api/angular-data/DSProvider.properties:defaults.beforeInject). Default: No-op
   * - `{function}` - `serialize` - See [DSProvider.defaults.serialize](/documentation/api/angular-data/DSProvider.properties:defaults.serialize). Default: No-op
   * - `{function}` - `deserialize` - See [DSProvider.defaults.deserialize](/documentation/api/angular-data/DSProvider.properties:defaults.deserialize). Default: No-op
   */
  var defaults = this.defaults = new Defaults();

  this.$get = [
    '$rootScope', '$log', '$q', 'DSHttpAdapter', 'DSLocalStorageAdapter', 'DSUtils', 'DSErrors',
    function ($rootScope, $log, $q, DSHttpAdapter, DSLocalStorageAdapter, DSUtils, DSErrors) {

      var syncMethods = require('./sync_methods');
      var asyncMethods = require('./async_methods');
      var cache;

      try {
        cache = angular.injector(['angular-data.DSCacheFactory']).get('DSCacheFactory');
      } catch (err) {
        $log.debug('DSCacheFactory is unavailable. Resorting to the lesser capabilities of $cacheFactory.');
        cache = angular.injector(['ng']).get('$cacheFactory');
      }

      /**
       * @doc interface
       * @id DS
       * @name DS
       * @description
       * Public data store interface. Consists of several properties and a number of methods. Injectable as `DS`.
       *
       * See the [guide](/documentation/guide/overview/index).
       */
      var DS = {
        emit: function (definition, event) {
          var args = Array.prototype.slice.call(arguments, 2);
          args.unshift(definition.name);
          args.unshift('DS.' + event);
          definition.emit.apply(definition, args);
          if (definition.events === 'broadcast') {
            $rootScope.$broadcast.apply($rootScope, args);
          } else if (definition.events === 'emit') {
            $rootScope.$emit.apply($rootScope, args);
          }
        },
        $rootScope: $rootScope,
        $log: $log,
        $q: $q,

        cacheFactory: cache,

        /**
         * @doc property
         * @id DS.properties:defaults
         * @name defaults
         * @description
         * Reference to [DSProvider.defaults](/documentation/api/api/DSProvider.properties:defaults).
         */
        defaults: defaults,

        /*!
         * @doc property
         * @id DS.properties:store
         * @name store
         * @description
         * Meta data for each registered resource.
         */
        store: {},

        /*!
         * @doc property
         * @id DS.properties:definitions
         * @name definitions
         * @description
         * Registered resource definitions available to the data store.
         */
        definitions: {},

        /**
         * @doc property
         * @id DS.properties:adapters
         * @name adapters
         * @description
         * Registered adapters available to the data store. Object consists of key-values pairs where the key is
         * the name of the adapter and the value is the adapter itself.
         */
        adapters: {
          DSHttpAdapter: DSHttpAdapter,
          DSLocalStorageAdapter: DSLocalStorageAdapter
        },

        /**
         * @doc property
         * @id DS.properties:errors
         * @name errors
         * @description
         * References to the various [error types](/documentation/api/api/errors) used by angular-data.
         */
        errors: DSErrors,

        /*!
         * @doc property
         * @id DS.properties:utils
         * @name utils
         * @description
         * Utility functions used internally by angular-data.
         */
        utils: DSUtils
      };

      DSUtils.deepFreeze(syncMethods);
      DSUtils.deepFreeze(asyncMethods);

      DSUtils.deepMixIn(DS, syncMethods);
      DSUtils.deepMixIn(DS, asyncMethods);

      DSUtils.deepFreeze(DS.errors);
      DSUtils.deepFreeze(DS.utils);

      DSHttpAdapter.DS = DS;
      DSLocalStorageAdapter.DS = DS;

      if (typeof Object.observe !== 'function' ||
        typeof Array.observe !== 'function') {
        $rootScope.$watch(function () {
          DSUtils.observe.Platform.performMicrotaskCheckpoint();
        });
      }

      return DS;
    }
  ];
}

module.exports = DSProvider;
