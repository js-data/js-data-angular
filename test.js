var myApp = angular.module('myApp', ['jmdobry.angular-data']);

myApp.controller('myCtrl', function ($scope, myService) {
	$scope.test = 'hello';
});
myApp.service('myService', function (BinaryHeap, DS) {
	var heap = new BinaryHeap();
	console.log(heap);

	console.log(DS);

	DS.defineResource('document');
	console.log(DS.lastModified('document'));
	DS.inject('document', {
		id: 45,
		title: 'test'
	});
	DS.inject('document', {
		id: 46,
		title: 'test2'
	});
	console.log(DS.lastModified('document'));
	console.log(DS.get('document', 45));
	console.log(DS.filter('document'));
	DS.eject('document', 45);
	console.log(DS.lastModified('document'));
});
