(function (window, angular, undefined) {
  'use strict';

  /**
   * @doc overview
   * @id angular-data
   * @name angular-data
   * @description
   * ## Install
   *
   * #### Bower
   * ```text
   * bower install angular-data
   * ```
   *
   * Load `dist/angular-data.js` or `dist/angular-data.min.js` onto your web page after Angular.js.
   *
   * #### Npm
   * ```text
   * npm install angular-data
   * ```
   *
   * Load `dist/angular-data.js` or `dist/angular-data.min.js` onto your web page after Angular.js.
   *
   * #### Manual download
   * Download angular-data from the [Releases](https://github.com/jmdobry/angular-data/releases)
   * section of the angular-data GitHub project.
   *
   * ## Load into Angular
   * Your Angular app must depend on the module `"angular-data.DS"` in order to use angular-data. Loading
   * angular-data into your app allows you to inject the following:
   *
   * - `DS`
   * - `DSHttpAdapter`
   * - `DSUtils`
   * - `DSErrors`
   *
   * [DS](/documentation/api/api/DS) is the Data Store itself, which you will inject often.
   * [DSHttpAdapter](/documentation/api/api/DSHttpAdapter) is useful as a wrapper for `$http` and is configurable.
   * [DSUtils](/documentation/api/api/DSUtils) has some useful utility methods.
   * [DSErrors](/documentation/api/api/DSErrors) provides references to the various errors thrown by the data store.
   */
  angular.module('angular-data.DS', ['ng'])
    .factory('DSUtils', require('./utils'))
    .factory('DSErrors', require('./errors'))
    .provider('DSHttpAdapter', require('./adapters/http'))
    .provider('DSLocalStorageAdapter', require('./adapters/localStorage'))
    .provider('DS', require('./datastore'))
    .config(['$provide', function ($provide) {
      $provide.decorator('$q', ['$delegate', function ($delegate) {
        // do whatever you you want
        $delegate.promisify = function (fn, target) {
          if (!fn) {
            return;
          } else if (typeof fn !== 'function') {
            throw new Error('Can only promisify functions!');
          }
          var $q = this;
          return function () {
            var deferred = $q.defer();
            var args = Array.prototype.slice.apply(arguments);

            args.push(function (err, result) {
              if (err) {
                deferred.reject(err);
              } else {
                deferred.resolve(result);
              }
            });

            try {
              var promise = fn.apply(target || this, args);
              if (promise && promise.then) {
                promise.then(deferred.resolve, deferred.reject);
              }
            } catch (err) {
              deferred.reject(err);
            }

            return deferred.promise;
          };
        };
        return $delegate;
      }]);
    }]);

})(window, window.angular);
