/**
* @author Jason Dobry <jason.dobry@gmail.com>
* @file js-data-angular.js
* @version 2.0.0-alpha.1-0 - Homepage <http://www.js-data.io/js-data-angular/>
* @copyright (c) 2014 Jason Dobry <https://github.com/jmdobry/>
* @license MIT <https://github.com/js-data/js-data-angular/blob/master/LICENSE>
*
* @overview Angular wrapper for js-data.js.
*/
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*jshint loopfunc:true*/
(function (window, angular, undefined) {
  'use strict';

  var adapters = [
    {
      project: 'js-data-http',
      name: 'http',
      class: 'DSHttpAdapter'
    },
    {
      project: 'js-data-localstorage',
      name: 'localstorage',
      class: 'DSLocalStorageAdapter'
    },
    {
      project: 'js-data-localforage',
      name: 'localforage',
      class: 'DSLocalForageAdapter'
    },
    {
      project: 'js-data-firebase',
      name: 'firebase',
      class: 'DSFirebaseAdapter'
    }
  ];

  function registerAdapter(adapter) {
    var Adapter;

    try {
      Adapter = require(adapter.project);
    } catch (e) {

    }

    if (!Adapter) {
      Adapter = window[adapter.class];
    }

    if (Adapter) {
      adapter.loaded = true;
      angular.module(adapter.project, ['ng']).provider(adapter.class, function () {
        var _this = this;
        _this.defaults = {};
        _this.$get = [function () {
          return new Adapter(_this.defaults);
        }];
      });
    }
  }

  for (var i = 0; i < adapters.length; i++) {
    registerAdapter(adapters[i]);
  }

  var JSData;

  try {
    JSData = require('js-data');
  } catch (e) {

  }

  if (!JSData) {
    JSData = window.JSData;
  }

  if (!JSData) {
    throw new Error('js-data must be loaded!');
  }

  var functionsToWrap = [
    'compute',
    'digest',
    'eject',
    'inject',
    'link',
    'linkAll',
    'linkInverse',
    'unlinkInverse'
  ];

  angular.module('js-data', ['ng'])
    .value('DSUtils', JSData.DSUtils)
    .value('DSErrors', JSData.DSErrors)
    .provider('DS', function () {

      var _this = this;
      var DSUtils = JSData.DSUtils;
      var DSErrors = JSData.DSErrors;
      var deps = [];

      for (var i = 0; i < adapters.length; i++) {
        if (adapters[i].loaded) {
          deps.push(adapters[i].class);
        }
      }

      _this.defaults = {};

      JSData.DS.prototype.bindAll = function (scope, expr, resourceName, params, cb) {
        var _this = this;

        params = params || {};

        if (!DSUtils.isObject(scope)) {
          throw new DSErrors.IA('"scope" must be an object!');
        } else if (!DSUtils.isString(expr)) {
          throw new DSErrors.IA('"expr" must be a string!');
        } else if (!_this.definitions[resourceName]) {
          throw new DSErrors.NER(resourceName);
        } else if (!DSUtils.isObject(params)) {
          throw new DSErrors.IA('"params" must be an object!');
        }

        try {
          return scope.$watch(function () {
            return _this.lastModified(resourceName);
          }, function () {
            var items = _this.filter(resourceName, params);
            DSUtils.set(scope, expr, items);
            if (cb) {
              cb(null, items);
            }
          });
        } catch (err) {
          if (cb) {
            cb(err);
          } else {
            throw err;
          }
        }
      };

      JSData.DS.prototype.bindAll = function (scope, expr, resourceName, id, cb) {
        var _this = this;

        id = DSUtils.resolveId(_this.definitions[resourceName], id);
        if (!DSUtils.isObject(scope)) {
          throw new DSErrors.IA('"scope" must be an object!');
        } else if (!DSUtils.isString(expr)) {
          throw new DSErrors.IA('"expr" must be a string!');
        } else if (!DS.definitions[resourceName]) {
          throw new DSErrors.NER(resourceName);
        } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
          throw new DSErrors.IA('"id" must be a string or a number!');
        }

        try {
          return scope.$watch(function () {
            return _this.lastModified(resourceName, id);
          }, function () {
            var item = _this.get(resourceName, id);
            DSUtils.set(scope, expr, item);
            if (cb) {
              cb(null, item);
            }
          });
        } catch (err) {
          if (cb) {
            cb(err);
          } else {
            throw err;
          }
        }
      };

      function load() {
        var args = Array.prototype.slice.call(arguments);
        var $rootScope = args[args.length - 1];
        var store = new JSData.DS(_this.defaults);
        var originals = {};

        // Register any adapters that have been loaded
        for (var i = 0; i < adapters.length; i++) {
          if (adapters[i].loaded) {
            store.registerAdapter(adapters[i].name, arguments[i]);
          }
        }

        // Wrap certain sync functions with $apply
        for (i = 0; i < functionsToWrap.length; i++) {
          originals[functionsToWrap[i]] = store[functionsToWrap[i]];
          store[functionsToWrap[i]] = (function (name) {
            return function () {
              var args = arguments;
              if (!$rootScope.$$phase) {
                return $rootScope.$apply(function () {
                  return originals[name].apply(store, args);
                });
              }
              return originals[name].apply(store, args);
            };
          })(functionsToWrap[i]);
        }

        // Hook into the digest loop (throttled)
        if (typeof Object.observe !== 'function' ||
          typeof Array.observe !== 'function') {
          $rootScope.$watch(function () {
            // Throttle angular-data's digest loop to tenths of a second
            return new Date().getTime() / 100 | 0;
          }, function () {
            store.digest();
          });
        }

        return store;
      }

      deps.push('$rootScope');
      deps.push(load);

      _this.$get = deps;
    });

})(window, window.angular);

},{"js-data":"js-data"}]},{},[1]);
