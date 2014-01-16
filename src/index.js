(function (window, angular, undefined) {
	'use strict';

//	angular.module('jmdobry.binary-heap', []);
//
//	/**
//	 * @doc interface
//	 * @id BinaryHeapProvider
//	 * @name BinaryHeapProvider
//	 */
//	function BinaryHeapProvider() {
//
//		var defaults = require('./binaryHeap/defaults');
//
//		/**
//		 * @doc method
//		 * @id BinaryHeapProvider.methods:setDefaultWeightFunction
//		 * @name setDefaultWeightFunction
//		 * @param {function} weightFunc New default weight function.
//		 */
//		function setDefaultWeightFunction(weightFunc) {
//			if (!angular.isFunction(weightFunc)) {
//				throw new Error('BinaryHeapProvider.setDefaultWeightFunction(weightFunc): weightFunc: Must be a function!');
//			}
//			defaults.userProvidedDefaultWeightFunc = weightFunc;
//		}
//
//		/**
//		 * @doc method
//		 * @id BinaryHeapProvider.methods:setDefaultWeightFunction
//		 * @name setDefaultWeightFunction
//		 * @methodOf BinaryHeapProvider
//		 * @param {function} weightFunc New default weight function.
//		 */
//		this.setDefaultWeightFunction = setDefaultWeightFunction;
//
//		this.$get = function () {
//			return require('./binaryHeap');
//		};
//	}
//	angular.module('jmdobry.binary-heap').provider('BinaryHeap', BinaryHeapProvider);

	angular.module('jmdobry.angular-data', ['ng'/*, 'jmdobry.binary-heap'*/]).config(['$provide', function ($provide) {
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
	angular.module('jmdobry.angular-data').provider('DS', require('./datastore'));

})(window, window.angular);
