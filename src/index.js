/*jshint loopfunc:true*/
let angular, JSData;
try {
  JSData = require('js-data');
} catch (e) {
}

if (!JSData) {
  try {
    JSData = window.JSData;
  } catch (e) {
  }
}
if (!JSData) {
  throw new Error('js-data must be loaded!');
}
try {
  angular = require('angular');
} catch (e) {
}

if (!angular) {
  try {
    angular = window.angular;
  } catch (e) {
  }
}
if (!angular) {
  throw new Error('angular must be loaded!');
}

let DSUtils = JSData.DSUtils;
let DSErrors = JSData.DSErrors;
let deepMixIn = DSUtils.deepMixIn;
let copy = DSUtils.copy;
let removeCircular = DSUtils.removeCircular;
let isString = DSUtils.isString;
let isNumber = DSUtils.isNumber;
let makePath = DSUtils.makePath;
let httpLoaded = false;

let adapters = [
  {
    project: 'js-data-http',
    name: 'http',
    'class': 'DSHttpAdapter'
  },
  {
    project: 'js-data-localstorage',
    name: 'localstorage',
    'class': 'DSLocalStorageAdapter'
  },
  {
    project: 'js-data-localforage',
    name: 'localforage',
    'class': 'DSLocalForageAdapter'
  },
  {
    project: 'js-data-firebase',
    name: 'firebase',
    'class': 'DSFirebaseAdapter'
  },
  {
    project: 'js-data-sql',
    name: 'sql',
    'class': 'DSSqlAdapter'
  }
];

let functionsToWrap = [
  'compute',
  'digest',
  'eject',
  'inject',
  'link',
  'linkAll',
  'linkInverse',
  'unlinkInverse'
];

function registerAdapter(adapter) {
  let Adapter;

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
    angular.module('js-data').provider(adapter.class, function () {
      let _this = this;
      _this.defaults = {};
      _this.$get = [() => new Adapter(_this.defaults)];
    });
  }
}

class DSProvider {
  constructor() {
    let _this = this;
    let deps = [];

    for (var i = 0; i < adapters.length; i++) {
      if (adapters[i].loaded) {
        deps.push(adapters[i].class);
      }
    }

    _this.defaults = {};

    JSData.DS.prototype.bindAll = function (resourceName, params, scope, expr, cb) {
      let _this = this;

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
        return scope.$watch(() => _this.lastModified(resourceName), () => {
          let items = _this.filter(resourceName, params);
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
      let _this = this;

      id = DSUtils.resolveId(_this.definitions[resourceName], id);
      if (!_this.definitions[resourceName]) {
        throw new DSErrors.NER(resourceName);
      } else if (!DSUtils.isString(id) && !DSUtils.isNumber(id)) {
        throw new DSErrors.IA('"id" must be a string or a number!');
      } else if (!DSUtils.isObject(scope)) {
        throw new DSErrors.IA('"scope" must be an object!');
      } else if (!DSUtils.isString(expr)) {
        throw new DSErrors.IA('"expr" must be a string!');
      }

      try {
        return scope.$watch(() => _this.lastModified(resourceName, id), () => {
          let item = _this.get(resourceName, id);
          if (item) {
            _this.compute(resourceName, id);
          }
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

    function load(...args) {
      let $rootScope = args[args.length - 2];
      let $q = args[args.length - 1];
      let store = new JSData.DS(_this.defaults);
      let originals = {};

      function QPromise(executor) {
        let deferred = $q.defer();

        try {
          executor.call(undefined,
            angular.bind(deferred, deferred.resolve),
            angular.bind(deferred, deferred.reject));
        } catch (err) {
          deferred.reject(err);
        }

        return deferred.promise;
      }

      QPromise.all = $q.all;
      QPromise.when = $q.when;
      QPromise.reject = $q.reject;

      DSUtils.Promise = QPromise;

      // Register any adapters that have been loaded
      if (args.length) {
        for (var i = 0; i < args.length; i++) {
          for (var j = 0; j < adapters.length; j++) {
            if (adapters[j].loaded && !adapters[j].registered) {
              adapters[j].registered = true;
              store.registerAdapter(adapters[j].name, args[i]);
              break;
            }
          }
        }
      }

      // Wrap certain sync functions with $apply
      for (var k = 0; k < functionsToWrap.length; k++) {
        let name = functionsToWrap[k];
        originals[name] = store[name];
        store[name] = (...args) => {
          if (!$rootScope.$$phase) {
            return $rootScope.$apply(() => originals[name].apply(store, args));
          }
          return originals[name].apply(store, args);
        };
      }

      // Hook into the digest loop
      if (typeof Object.observe !== 'function' || typeof Array.observe !== 'function') {
        $rootScope.$watch(() => store.observe.Platform.performMicrotaskCheckpoint());
      }

      return store;
    }

    deps.push('$rootScope');
    deps.push('$q');
    deps.push(load);

    _this.$get = deps;
  }
}
angular.module('js-data', ['ng'])
  .value('DSUtils', JSData.DSUtils)
  .value('DSErrors', JSData.DSErrors)
  .provider('DS', DSProvider);


for (var i = 0; i < adapters.length; i++) {
  registerAdapter(adapters[i]);
}

if (!httpLoaded) {

  class Defaults {
    queryTransform(resourceConfig, params) {
      return params;
    }

    deserialize(resourceConfig, data) {
      return data ? ('data' in data ? data.data : data) : data;
    }

    serialize(resourceConfig, data) {
      return data;
    }

    log() {

    }

    error() {

    }
  }
  let defaultsPrototype = Defaults.prototype;

  defaultsPrototype.basePath = '';

  defaultsPrototype.forceTrailingSlash = '';

  defaultsPrototype.httpConfig = {};

  class DSHttpAdapter {
    constructor(options) {
      this.defaults = new Defaults();
      if (console) {
        this.defaults.log = (a, b) => console[typeof console.info === 'function' ? 'info' : 'log'](a, b);
      }
      if (console) {
        this.defaults.error = (a, b) => console[typeof console.error === 'function' ? 'error' : 'log'](a, b);
      }
      deepMixIn(this.defaults, options);
    }

    getPath(method, resourceConfig, id, options) {
      let _this = this;
      options = options || {};
      let args = [
        options.basePath || _this.defaults.basePath || resourceConfig.basePath,
        resourceConfig.getEndpoint((isString(id) || isNumber(id) || method === 'create') ? id : null, options)
      ];
      if (method === 'find' || method === 'update' || method === 'destroy') {
        args.push(id);
      }
      return makePath.apply(DSUtils, args);
    }

    GET(url, config) {
      config = config || {};
      if (!('method' in config)) {
        config.method = 'get';
      }
      return this.HTTP(deepMixIn(config, {
        url
      }));
    }

    POST(url, attrs, config) {
      config = config || {};
      config = DSUtils.copy(config);
      if (!('method' in config)) {
        config.method = 'post';
      }
      return this.HTTP(deepMixIn(config, {
        url,
        data: attrs
      }));
    }

    PUT(url, attrs, config) {
      config = config || {};
      if (!('method' in config)) {
        config.method = 'put';
      }
      return this.HTTP(deepMixIn(config, {
        url,
        data: attrs || {}
      }));
    }

    DEL(url, config) {
      config = config || {};
      if (!('method' in config)) {
        config.method = 'delete';
      }
      return this.HTTP(deepMixIn(config, {
        url
      }));
    }

    find(resourceConfig, id, options) {
      let _this = this;
      options = options ? copy(options) : {};
      options.suffix = options.suffix || resourceConfig.suffix;
      options.params = options.params || {};
      options.params = _this.defaults.queryTransform(resourceConfig, options.params);
      return _this.GET(
        _this.getPath('find', resourceConfig, id, options),
        options
      ).then(data => {
          let item = (options.deserialize ? options.deserialize : _this.defaults.deserialize)(resourceConfig, data);
          return !item ? JSData.DSUtils.Promise.reject(new Error('Not Found!')) : item;
        });
    }

    findAll(resourceConfig, params, options) {
      let _this = this;
      options = options ? copy(options) : {};
      options.suffix = options.suffix || resourceConfig.suffix;
      options.params = options.params || {};
      if (params) {
        params = _this.defaults.queryTransform(resourceConfig, params);
        deepMixIn(options.params, params);
      }
      return _this.GET(
        _this.getPath('findAll', resourceConfig, params, options),
        options
      ).then(data => (options.deserialize ? options.deserialize : _this.defaults.deserialize)(resourceConfig, data));
    }

    create(resourceConfig, attrs, options) {
      let _this = this;
      options = options ? copy(options) : {};
      options.suffix = options.suffix || resourceConfig.suffix;
      options.params = options.params || {};
      options.params = _this.defaults.queryTransform(resourceConfig, options.params);
      return _this.POST(
        _this.getPath('create', resourceConfig, attrs, options),
        (options.serialize ? options.serialize : _this.defaults.serialize)(resourceConfig, attrs),
        options
      ).then(data => (options.deserialize ? options.deserialize : _this.defaults.deserialize)(resourceConfig, data));
    }

    update(resourceConfig, id, attrs, options) {
      let _this = this;
      options = options ? copy(options) : {};
      options.suffix = options.suffix || resourceConfig.suffix;
      options.params = options.params || {};
      options.params = _this.defaults.queryTransform(resourceConfig, options.params);
      return _this.PUT(
        _this.getPath('update', resourceConfig, id, options),
        (options.serialize ? options.serialize : _this.defaults.serialize)(resourceConfig, attrs),
        options
      ).then(data => (options.deserialize ? options.deserialize : _this.defaults.deserialize)(resourceConfig, data));
    }

    updateAll(resourceConfig, attrs, params, options) {
      let _this = this;
      options = options ? copy(options) : {};
      options.suffix = options.suffix || resourceConfig.suffix;
      options.params = options.params || {};
      if (params) {
        params = _this.defaults.queryTransform(resourceConfig, params);
        deepMixIn(options.params, params);
      }
      return this.PUT(
        _this.getPath('updateAll', resourceConfig, attrs, options),
        (options.serialize ? options.serialize : _this.defaults.serialize)(resourceConfig, attrs),
        options
      ).then(data => (options.deserialize ? options.deserialize : _this.defaults.deserialize)(resourceConfig, data));
    }

    destroy(resourceConfig, id, options) {
      let _this = this;
      options = options ? copy(options) : {};
      options.suffix = options.suffix || resourceConfig.suffix;
      options.params = options.params || {};
      options.params = _this.defaults.queryTransform(resourceConfig, options.params);
      return _this.DEL(
        _this.getPath('destroy', resourceConfig, id, options),
        options
      ).then(data => (options.deserialize ? options.deserialize : _this.defaults.deserialize)(resourceConfig, data));
    }

    destroyAll(resourceConfig, params, options) {
      let _this = this;
      options = options ? copy(options) : {};
      options.suffix = options.suffix || resourceConfig.suffix;
      options.params = options.params || {};
      if (params) {
        params = _this.defaults.queryTransform(resourceConfig, params);
        deepMixIn(options.params, params);
      }
      return this.DEL(
        _this.getPath('destroyAll', resourceConfig, params, options),
        options
      ).then(data => (options.deserialize ? options.deserialize : _this.defaults.deserialize)(resourceConfig, data));
    }
  }

  let dsHttpAdapterPrototype = DSHttpAdapter.prototype;

  class DSHttpAdapterProvider {
    constructor() {
      let _this = this;
      _this.defaults = {};
      _this.$get = ['$http', 'DS', '$q', ($http, DS, $q) => {
        dsHttpAdapterPrototype.HTTP = function (config) {
          let _this = this;
          let start = new Date();
          config = copy(config);
          config = deepMixIn(config, _this.defaults.httpConfig);
          if (_this.defaults.forceTrailingSlash && config.url[config.url.length - 1] !== '/') {
            config.url += '/';
          }
          config.method = config.method.toUpperCase();
          if (typeof config.data === 'object') {
            config.data = removeCircular(config.data);
          }
          let suffix = config.suffix || _this.defaults.suffix;
          if (suffix && config.url.substr(config.url.length - suffix.length) !== suffix) {
            config.url += suffix;
          }

          function logResponse(data) {
            let str = `${start.toUTCString()} - ${data.config.method.toUpperCase()} ${data.config.url} - ${data.status} ${(new Date().getTime() - start.getTime())}ms`;
            if (data.status >= 200 && data.status < 300) {
              if (_this.defaults.log) {
                _this.defaults.log(str, data);
              }
              return data;
            } else {
              if (_this.defaults.error) {
                _this.defaults.error(`FAILED: ${str}`, data);
              }
              return $q.reject(data);
            }
          }

          return $http(config).then(logResponse, logResponse);
        };

        let adapter = new DSHttpAdapter(_this.defaults);
        DS.registerAdapter('http', adapter, { 'default': true });
        return adapter;
      }];
    }
  }
  angular.module('js-data').provider('DSHttpAdapter', DSHttpAdapterProvider);
}
angular.module('js-data').run(['DS', 'DSHttpAdapter', (DS, DSHttpAdapter) => DS.registerAdapter('http', DSHttpAdapter, { 'default': true })]);

// return the module name
export default 'js-data';
