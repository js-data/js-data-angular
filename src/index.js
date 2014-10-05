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
    .factory('DSUtils', JSData.DSUtils)
    .factory('DSErrors', JSData.DSErrors)
    .provider('DS', function () {

      var _this = this;
      var deps = [];

      for (var i = 0; i < adapters.length; i++) {
        if (adapters[i].loaded) {
          deps.push(adapters[i].class);
        }
      }

      _this.defaults = {};

      function load() {
        var args = Array.prototype.slice.call(arguments);
        var $rootScope = args[args.length - 1];
        var store = new JSData.DS(_this.defaults);
        var originals = {};

        for (var i = 0; i < adapters.length; i++) {
          if (adapters[i].loaded) {
            store.registerAdapter(adapters[i].name, arguments[i]);
          }
        }

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

        return store;
      }

      deps.push('$rootScope');
      deps.push(load);

      _this.$get = deps;
    });

})(window, window.angular);
