(function (window, angular, undefined) {
	'use strict';

	angular.module('jmdobry.binary-heap', []);
	function BinaryHeapProvider() {
		this.$get = function () {
			return require('./binaryHeap');
		};
	}
	angular.module('jmdobry.binary-heap').provider('BinaryHeap', BinaryHeapProvider);

	angular.module('jmdobry.angular-data', ['ng', 'jmdobry.binary-heap']);
	angular.module('jmdobry.angular-data').provider('DS', require('./datastore'));

})(window, window.angular);
