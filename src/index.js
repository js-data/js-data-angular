(function (window, angular, undefined) {
	'use strict';

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
