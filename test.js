var myApp = angular.module('myApp', ['jmdobry.angular-data']);

myApp.controller('myCtrl', function ($scope, myService, DS) {
	$scope.test = 'hello';
	$scope.add = myService.add;
	$scope.change = myService.change;
	$scope.remove = myService.remove;
	$scope.$watch(function () {
		return DS.lastModified('document', 46);
	}, function () {
		console.log('46 changed!');
		console.log(JSON.stringify(DS.get('document', 46), null, 2));
		console.log(DS.changes('document', 46));
		console.log(DS.previous('document', 46));
	});
});
myApp.service('myService', function (DS) {
	DS.defineResource('document');
	DS.inject('document', {
		id: 45,
		title: 'test'
	});
	DS.inject('document', {
		id: 46,
		title: 'test2'
	});

	var count = 1;
	return {
		add: function () {
			console.log('myService.test()');
			var d = DS.get('document', 46);
			d['newTitle' + count] = 'newTitle' + count;
			count += 1;
		},
		change: function () {
			console.log('myService.test()');
			var d = DS.get('document', 46);
			d.title = 'newTitle' + count;
			count += 1;
		},
		remove: function () {
			console.log('myService.test()');
			var d = DS.get('document', 46);
			delete d.title;
			count += 1;
		}
	}
});
