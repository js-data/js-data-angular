/* jshint loopfunc:true */
let JSData = require("js-data");
let DSHttpAdapter = require("../node_modules/js-data-http/src/index.js");
let angular = require("angular");

let { DSUtils, DSErrors } = JSData;
let { isString, isObject, set } = DSUtils;

let adapters = [
  {
    project: "js-data-localstorage",
    name: "localstorage",
    class: "DSLocalStorageAdapter",
  },
  {
    project: "js-data-localforage",
    name: "localforage",
    class: "DSLocalForageAdapter",
  },
  {
    project: "js-data-firebase",
    name: "firebase",
    class: "DSFirebaseAdapter",
  },
  {
    project: "js-data-sql",
    name: "sql",
    class: "DSSqlAdapter",
  },
];

let functionsToWrap = ["compute", "digest", "eject", "inject"];

function registerAdapter(adapter) {
  let Adapter;

  try {
    Adapter = require(adapter.project);
  } catch (e) {}

  if (!Adapter) {
    Adapter = window[adapter.class];
  }

  if (Adapter) {
    adapter.loaded = true;
    angular.module("js-data").provider(adapter.class, function () {
      let _this = this;
      _this.defaults = {};
      _this.$get = [() => new Adapter(_this.defaults)];
    });
  }
}

class DSHttpAdapterProvider {
  constructor() {
    let defaults = {};
    this.defaults = defaults;

    this.$get = [
      "$http",
      "DS",
      ($http, DS) => {
        defaults.http = defaults.http || $http;
        let adapter = new DSHttpAdapter(defaults);
        DS.registerAdapter("http", adapter, { default: true });
        return adapter;
      },
    ];
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

    function load(...args) {
      let $rootScope = args[args.length - 2];
      let $q = args[args.length - 1];
      let store = new JSData.DS(_this.defaults);
      let originals = {};

      function QPromise(executor) {
        let deferred = $q.defer();

        try {
          executor(
            angular.bind(deferred, deferred.resolve),
            angular.bind(deferred, deferred.reject)
          );
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
      if (
        typeof Object.observe !== "function" ||
        typeof Array.observe !== "function"
      ) {
        $rootScope.$watch(() =>
          store.observe.Platform.performMicrotaskCheckpoint()
        );
      }

      return store;
    }

    deps.push("$rootScope");
    deps.push("$q");
    deps.push(load);

    _this.$get = deps;
  }
}
angular
  .module("js-data", ["ng"])
  .value("DSUtils", DSUtils)
  .value("DSErrors", DSErrors)
  .value("DSVersion", JSData.version)
  .provider("DS", DSProvider)
  .provider("DSHttpAdapter", DSHttpAdapterProvider)
  .run([
    "DS",
    "DSHttpAdapter",
    (DS, DSHttpAdapter) => {
      DS.registerAdapter("http", DSHttpAdapter, { default: true });
    },
  ]);

for (var i = 0; i < adapters.length; i++) {
  registerAdapter(adapters[i]);
}

// return the module name
module.exports = "js-data";
module.exports.name = "js-data";
