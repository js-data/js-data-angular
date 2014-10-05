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
          store[functionsToWrap[i]] = function () {
            var args = arguments;
            if (!$rootScope.$$phase) {
              return $rootScope.$apply(function () {
                return originals[functionsToWrap[i]].apply(store, args);
              });
            }
            return originals[functionsToWrap[i]].apply(store, args);
          };
        }

        return store;
      }

      deps.push('$rootScope');
      deps.push(load);

      _this.$get = deps;
    });

})(window, window.angular);

},{"js-data":"js-data"}]},{},[1]);
