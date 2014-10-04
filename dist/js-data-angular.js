/**
* @author Jason Dobry <jason.dobry@gmail.com>
* @file js-data-angular.js
* @version 2.0.0-alpha.1-0 - Homepage <http://js-data-angular.pseudobry.com/>
* @copyright (c) 2014 Jason Dobry <https://github.com/jmdobry/>
* @license MIT <https://github.com/js-data/js-data-angular/blob/master/LICENSE>
*
* @overview Data store for Angular.js.
*/
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (window, angular, undefined) {
  'use strict';

  var adapters = [
    {
      project: 'js-data-http',
      name: 'http',
      class: 'DSHttpAdapter'
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
      angular.module(adapter.project, ['ng']).provider(adapter.class + 'Provider', function () {
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

      deps.push(function () {
        var store = new JSData.DS(_this.defaults);

        for (var i = 0; i < adapters.length; i++) {
          if (adapters[i].loaded) {
            store.registerAdapter(adapters[i].name, arguments[i]);
          }
        }

        return new JSData.DS(_this.defaults);
      });

      _this.$get = deps;
    });

})(window, window.angular);

},{"js-data":"js-data"}]},{},[1]);
