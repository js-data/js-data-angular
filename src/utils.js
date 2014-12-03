var DSErrors = require('./errors');

function Events(target) {
  var events = {};
  target = target || this;
  /**
   *  On: listen to events
   */
  target.on = function (type, func, ctx) {
    events[type] = events[type] || [];
    events[type].push({
      f: func,
      c: ctx
    });
  };

  /**
   *  Off: stop listening to event / specific callback
   */
  target.off = function (type, func) {
    var listeners = events[type];
    if (!listeners) {
      events = {};
    } else if (func) {
      for (var i = 0; i < listeners.length; i++) {
        if (listeners[i] === func) {
          listeners.splice(i, 1);
          break;
        }
      }
    } else {
      listeners.splice(0, listeners.length);
    }
  };

  target.emit = function () {
    var args = Array.prototype.slice.call(arguments);
    var listeners = events[args.shift()] || [];
    if (listeners) {
      for (var i = 0; i < listeners.length; i++) {
        listeners[i].f.apply(listeners[i].c, args);
      }
    }
  };
}

var toPromisify = [
  'beforeValidate',
  'validate',
  'afterValidate',
  'beforeCreate',
  'afterCreate',
  'beforeUpdate',
  'afterUpdate',
  'beforeDestroy',
  'afterDestroy'
];

var deepEquals = angular.equals;

var observe = require('../lib/observe-js/observe-js');

observe.setEqualityFn(deepEquals);

module.exports = ['$q', function ($q) {

  return {
    isBoolean: require('mout/lang/isBoolean'),
    isString: angular.isString,
    isArray: angular.isArray,
    isObject: angular.isObject,
    isNumber: angular.isNumber,
    isFunction: angular.isFunction,
    isEmpty: require('mout/lang/isEmpty'),
    toJson: JSON.stringify,
    fromJson: angular.fromJson,
    makePath: require('mout/string/makePath'),
    upperCase: require('mout/string/upperCase'),
    pascalCase: require('mout/string/pascalCase'),
    deepMixIn: require('mout/object/deepMixIn'),
    deepEquals: deepEquals,
    mixIn: require('mout/object/mixIn'),
    forEach: angular.forEach,
    pick: require('mout/object/pick'),
    set: require('mout/object/set'),
    merge: require('mout/object/merge'),
    contains: require('mout/array/contains'),
    filter: require('mout/array/filter'),
    toLookup: require('mout/array/toLookup'),
    remove: require('mout/array/remove'),
    slice: require('mout/array/slice'),
    sort: require('mout/array/sort'),
    guid: require('mout/random/guid'),
    copy: angular.copy,
    keys: require('mout/object/keys'),
    observe: observe,
    _: function (parent, options) {
      var _this = this;
      options = options || {};
      if (options && options.constructor === parent.constructor) {
        return options;
      } else if (!_this.isObject(options)) {
        throw new DSErrors.IA('"options" must be an object!');
      }
      _this.forEach(toPromisify, function (name) {
        if (typeof options[name] === 'function') {
          options[name] = $q.promisify(options[name]);
        }
      });
      var O = function Options(attrs) {
        _this.mixIn(this, attrs);
      };
      O.prototype = parent;
      return new O(options);
    },
    resolveItem: function (resource, idOrInstance) {
      if (resource && (this.isString(idOrInstance) || this.isNumber(idOrInstance))) {
        return resource.index[idOrInstance] || idOrInstance;
      } else {
        return idOrInstance;
      }
    },
    resolveId: function (definition, idOrInstance) {
      if (this.isString(idOrInstance) || this.isNumber(idOrInstance)) {
        return idOrInstance;
      } else if (idOrInstance && definition) {
        return idOrInstance[definition.idAttribute] || idOrInstance;
      } else {
        return idOrInstance;
      }
    },
    updateTimestamp: function (timestamp) {
      var newTimestamp = typeof Date.now === 'function' ? Date.now() : new Date().getTime();
      if (timestamp && newTimestamp <= timestamp) {
        return timestamp + 1;
      } else {
        return newTimestamp;
      }
    },
    deepFreeze: function deepFreeze(o) {
      if (typeof Object.freeze === 'function') {
        var prop, propKey;
        Object.freeze(o); // First freeze the object.
        for (propKey in o) {
          prop = o[propKey];
          if (!o.hasOwnProperty(propKey) || typeof prop !== 'object' || Object.isFrozen(prop)) {
            // If the object is on the prototype, not an object, or is already frozen,
            // skip it. Note that this might leave an unfrozen reference somewhere in the
            // object if there is an already frozen object containing an unfrozen object.
            continue;
          }

          deepFreeze(prop); // Recursively call deepFreeze.
        }
      }
    },
    diffObjectFromOldObject: observe.diffObjectFromOldObject,
    Events: Events
  };
}];
