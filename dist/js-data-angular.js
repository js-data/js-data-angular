/**
* @author Jason Dobry <jason.dobry@gmail.com>
* @file js-data-angular.js
* @version 2.0.0-alpha.2-0 - Homepage <http://www.js-data.io/js-data-angular/>
* @copyright (c) 2014 Jason Dobry <https://github.com/jmdobry/>
* @license MIT <https://github.com/js-data/js-data-angular/blob/master/LICENSE>
*
* @overview Angular wrapper for js-data.js.
*/
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*jshint loopfunc:true*/
(function (window, angular, undefined) {
  'use strict';

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

  var makePath = JSData.DSUtils.makePath;
  var deepMixIn = JSData.DSUtils.deepMixIn;
  var httpLoaded = false;

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

  function Defaults() {

  }

  function DSHttpAdapter(options) {
    this.defaults = new Defaults();
    deepMixIn(this.defaults, options);
  }

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
      if (adapter.name === 'http') {
        httpLoaded = true;
      }
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

      JSData.DS.prototype.bindAll = function (resourceName, params, scope, expr, cb) {
        var _this = this;

        params = params || {};

        if (!_this.definitions[resourceName]) {
          throw new DSErrors.NER(resourceName);
        } else if (!DSUtils.isObject(params)) {
          throw new DSErrors.IA('"params" must be an object!');
        } else if (!DSUtils.isObject(scope)) {
          throw new DSErrors.IA('"scope" must be an object!');
        } else if (!DSUtils.isString(expr)) {
          throw new DSErrors.IA('"expr" must be a string!');
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

      JSData.DS.prototype.bindOne = function (resourceName, id, scope, expr, cb) {
        var _this = this;

        id = DSUtils.resolveId(_this.definitions[resourceName], id);
        if (!DS.definitions[resourceName]) {
          throw new DSErrors.NER(resourceName);
        } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
          throw new DSErrors.IA('"id" must be a string or a number!');
        } else if (!DSUtils.isObject(scope)) {
          throw new DSErrors.IA('"scope" must be an object!');
        } else if (!DSUtils.isString(expr)) {
          throw new DSErrors.IA('"expr" must be a string!');
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
        var $rootScope = args[args.length - 2];
        var $q = args[args.length - 1];
        var store = new JSData.DS(_this.defaults);
        var originals = {};

        function QPromise(cb) {
          var deferred = $q.defer();
          try {
            cb(function (val) {
              if (!$rootScope.$$phase) {
                $rootScope.$apply(function () {
                  deferred.resolve(val);
                });
              } else {
                deferred.resolve(val);
              }
            }, function (err) {
              console.log(err);
              if (!$rootScope.$$phase) {
                $rootScope.$apply(function () {
                  deferred.reject(err);
                });
              } else {
                deferred.reject(err);
              }
            });
          } catch (err) {
            deferred.reject(err);
          }
          return deferred.promise;
        }

        //QPromise.all = $q.all;
        //QPromise.when = $q.when;
        //QPromise.reject = $q.reject;
        //
        //DSUtils.Promise = QPromise;

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
            // TODO: observe.Platform.performMicrotaskCheckpoint();
            // Throttle angular-data's digest loop to tenths of a second
            return new Date().getTime() / 100 | 0;
          }, function () {
            store.digest();
          });
        }

        return store;
      }

      deps.push('$rootScope');
      deps.push('$q');
      deps.push(load);

      _this.$get = deps;
    });

  if (!httpLoaded) {
    var defaultsPrototype = Defaults.prototype;

    defaultsPrototype.queryTransform = function (resourceName, params) {
      return params;
    };

    defaultsPrototype.basePath = '';

    defaultsPrototype.forceTrailingSlash = '';

    defaultsPrototype.httpConfig = {};

    defaultsPrototype.log = console ? function (a, b) {
      console[typeof console.info === 'function' ? 'info' : 'log'](a, b);
    } : function () {
    };

    defaultsPrototype.error = console ? function (a, b) {
      console[typeof console.error === 'function' ? 'error' : 'log'](a, b);
    } : function () {
    };

    defaultsPrototype.deserialize = function (resourceName, data) {
      return data ? ('data' in data ? data.data : data) : data;
    };

    defaultsPrototype.serialize = function (resourceName, data) {
      return data;
    };

    var dsHttpAdapterPrototype = DSHttpAdapter.prototype;

    dsHttpAdapterPrototype.getIdPath = function (resourceConfig, options, id) {
      return makePath(options.basePath || this.defaults.basePath || resourceConfig.basePath, resourceConfig.getEndpoint(id, options), id);
    };

    dsHttpAdapterPrototype.getAllPath = function (resourceConfig, options) {
      return makePath(options.basePath || this.defaults.basePath || resourceConfig.basePath, resourceConfig.getEndpoint(null, options));
    };

    dsHttpAdapterPrototype.GET = function (url, config) {
      config = config || {};
      if (!('method' in config)) {
        config.method = 'get';
      }
      return this.HTTP(deepMixIn(config, {
        url: url
      }));
    };

    dsHttpAdapterPrototype.POST = function (url, attrs, config) {
      config = config || {};
      if (!('method' in config)) {
        config.method = 'post';
      }
      return this.HTTP(deepMixIn(config, {
        url: url,
        data: attrs
      }));
    };

    dsHttpAdapterPrototype.PUT = function (url, attrs, config) {
      config = config || {};
      if (!('method' in config)) {
        config.method = 'put';
      }
      return this.HTTP(deepMixIn(config, {
        url: url,
        data: attrs || {}
      }));
    };

    dsHttpAdapterPrototype.DEL = function (url, config) {
      config = config || {};
      if (!('method' in config)) {
        config.method = 'delete';
      }
      return this.HTTP(deepMixIn(config, {
        url: url
      }));
    };

    dsHttpAdapterPrototype.find = function (resourceConfig, id, options) {
      var _this = this;
      options = options || {};
      return _this.GET(
        _this.getIdPath(resourceConfig, options, id),
        options
      ).then(function (data) {
          return (options.deserialize ? options.deserialize : _this.defaults.deserialize)(resourceConfig.name, data);
        });
    };

    dsHttpAdapterPrototype.findAll = function (resourceConfig, params, options) {
      var _this = this;
      options = options || {};
      options.params = options.params || {};
      if (params) {
        params = _this.defaults.queryTransform(resourceConfig.name, params);
        deepMixIn(options.params, params);
      }
      return _this.GET(
        _this.getAllPath(resourceConfig, options),
        options
      ).then(function (data) {
          return (options.deserialize ? options.deserialize : _this.defaults.deserialize)(resourceConfig.name, data);
        });
    };

    dsHttpAdapterPrototype.create = function (resourceConfig, attrs, options) {
      var _this = this;
      options = options || {};
      return _this.POST(
        makePath(options.basePath || this.defaults.basePath || resourceConfig.basePath, resourceConfig.getEndpoint(attrs, options)),
        options.serialize ? options.serialize(resourceConfig.name, attrs) : _this.defaults.serialize(resourceConfig.name, attrs),
        options
      ).then(function (data) {
          return (options.deserialize ? options.deserialize : _this.defaults.deserialize)(resourceConfig.name, data);
        });
    };

    dsHttpAdapterPrototype.update = function (resourceConfig, id, attrs, options) {
      var _this = this;
      options = options || {};
      return _this.PUT(
        _this.getIdPath(resourceConfig, options, id),
        options.serialize ? options.serialize(resourceConfig.name, attrs) : _this.defaults.serialize(resourceConfig.name, attrs),
        options
      ).then(function (data) {
          return (options.deserialize ? options.deserialize : _this.defaults.deserialize)(resourceConfig.name, data);
        });
    };

    dsHttpAdapterPrototype.updateAll = function (resourceConfig, attrs, params, options) {
      var _this = this;
      options = options || {};
      options.params = options.params || {};
      if (params) {
        params = _this.defaults.queryTransform(resourceConfig.name, params);
        deepMixIn(options.params, params);
      }
      return this.PUT(
        _this.getAllPath(resourceConfig, options),
        options.serialize ? options.serialize(resourceConfig.name, attrs) : _this.defaults.serialize(resourceConfig.name, attrs),
        options
      ).then(function (data) {
          return (options.deserialize ? options.deserialize : _this.defaults.deserialize)(resourceConfig.name, data);
        });
    };

    dsHttpAdapterPrototype.destroy = function (resourceConfig, id, options) {
      var _this = this;
      options = options || {};
      return _this.DEL(
        _this.getIdPath(resourceConfig, options, id),
        options
      ).then(function (data) {
          return (options.deserialize ? options.deserialize : _this.defaults.deserialize)(resourceConfig.name, data);
        });
    };

    dsHttpAdapterPrototype.destroyAll = function (resourceConfig, params, options) {
      var _this = this;
      options = options || {};
      options.params = options.params || {};
      if (params) {
        params = _this.defaults.queryTransform(resourceConfig.name, params);
        deepMixIn(options.params, params);
      }
      return this.DEL(
        _this.getAllPath(resourceConfig, options),
        options
      ).then(function (data) {
          return (options.deserialize ? options.deserialize : _this.defaults.deserialize)(resourceConfig.name, data);
        });
    };

    angular.module('js-data').provider('DSHttpAdapter', function () {
      var _this = this;
      _this.defaults = {};
      _this.$get = ['$http', 'DS', '$q', function ($http, DS, $q) {
        dsHttpAdapterPrototype.HTTP = function (config) {
          var _this = this;
          var start = new Date();
          config = deepMixIn(config, _this.defaults.httpConfig);
          if (_this.defaults.forceTrailingSlash && config.url[config.url.length] !== '/') {
            config.url += '/';
          }
          config.method = config.method.toUpperCase();

          function logResponse(data) {
            var str = start.toUTCString() + ' - ' + data.config.method.toUpperCase() + ' ' + data.config.url + ' - ' + data.status + ' ' + (new Date().getTime() - start.getTime()) + 'ms';
            if (data.status >= 200 && data.status < 300) {
              if (_this.defaults.log) {
                _this.defaults.log(str, data);
              }
              return data;
            } else {
              if (_this.defaults.error) {
                _this.defaults.error('FAILED: ' + str, data);
              }
              return $q.reject(data);
            }
          }

          return $http(config).then(logResponse, logResponse);
        };

        var adapter = new DSHttpAdapter(_this.defaults);
        DS.registerAdapter('http', adapter, { default: true });
        return adapter;
      }];
    });
  }

})(window, window.angular);

},{"js-data":"js-data"}]},{},[1]);
