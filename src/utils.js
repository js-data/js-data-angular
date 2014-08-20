module.exports = [function () {
  return {
    isBoolean: require('mout/lang/isBoolean'),
    isString: angular.isString,
    isArray: angular.isArray,
    isObject: angular.isObject,
    isNumber: angular.isNumber,
    isFunction: angular.isFunction,
    isEmpty: require('mout/lang/isEmpty'),
    toJson: angular.toJson,
    makePath: require('mout/string/makePath'),
    upperCase: require('mout/string/upperCase'),
    pascalCase: require('mout/string/pascalCase'),
    deepMixIn: require('mout/object/deepMixIn'),
    forOwn: require('mout/object/forOwn'),
    forEach: angular.forEach,
    pick: require('mout/object/pick'),
    set: require('mout/object/set'),
    contains: require('mout/array/contains'),
    filter: require('mout/array/filter'),
    toLookup: require('mout/array/toLookup'),
    slice: require('mout/array/slice'),
    sort: require('mout/array/sort'),
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
    diffObjectFromOldObject: function (object, oldObject) {
      var added = {};
      var removed = {};
      var changed = {};

      for (var prop in oldObject) {
        var newValue = object[prop];

        if (newValue !== undefined && newValue === oldObject[prop])
          continue;

        if (!(prop in object)) {
          removed[prop] = undefined;
          continue;
        }

        if (newValue !== oldObject[prop])
          changed[prop] = newValue;
      }

      for (var prop2 in object) {
        if (prop2 in oldObject)
          continue;

        added[prop2] = object[prop2];
      }

      return {
        added: added,
        removed: removed,
        changed: changed
      };
    }
  };
}];
