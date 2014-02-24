(function (window, angular, undefined) {
	'use strict';

	/**
	 * @doc overview
	 * @id angular-data
	 * @name angular-data
	 * @description
	 * Angular-data is installable via:
	 *
	 * ```text
	 * bower install angular-data
	 * ```
	 *
	 * or by downloading angular-data.x.x.x.js from the [Releases](https://github.com/jmdobry/angular-data/releases)
	 * section of the angular-data GitHub project.
	 *
	 * Angular-data has a hard dependency on [angular-cache](/documentation/api/api/angular-cache) v3.0.0 or newer,
	 * which must be loaded before angular-data.
	 *
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
		.service('DSUtils', require('./utils'))
		.service('DSErrors', require('./errors'))
		.provider('DSHttpAdapter', require('./adapters/http'))
		.provider('DS', require('./datastore'))
		.config(['$provide', function ($provide) {
			$provide.decorator('$q', function ($delegate) {
				// do whatever you you want
				$delegate.promisify = function (fn, target) {
					var _this = this;
					return function () {
						var deferred = _this.defer(),
							args = Array.prototype.slice.apply(arguments);

						args.push(function (err, result) {
							if (err) {
								deferred.reject(err);
							} else {
								deferred.resolve(result);
							}
						});

						try {
							fn.apply(target || this, args);
						} catch (err) {
							deferred.reject(err);
						}

						return deferred.promise;
					};
				};
				return $delegate;
			});
		}]);

})(window, window.angular);
