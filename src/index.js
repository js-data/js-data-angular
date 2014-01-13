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

	angular.module('jmdobry.angular-data', ['ng'/*, 'jmdobry.binary-heap'*/]);
	angular.module('jmdobry.angular-data').provider('DS', require('./datastore'));

})(window, window.angular);
