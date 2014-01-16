// Setup global test variables
var $rootScope, $q, $log, DSProvider, DS, app, $httpBackend, p1, p2, p3, p4;

var lifecycle = {};

// Helper globals
var fail = function (msg) {
		assert.equal('should not reach this!: ' + msg, 'failure');
	},
	TYPES_EXCEPT_STRING = [123, 123.123, null, undefined, {}, [], true, false, function () {
	}],
	TYPES_EXCEPT_STRING_OR_ARRAY = [123, 123.123, null, undefined, {}, true, false, function () {
	}],
	TYPES_EXCEPT_STRING_OR_OBJECT = [123, 123.123, null, undefined, [], true, false, function () {
	}],
	TYPES_EXCEPT_ARRAY = ['string', 123, 123.123, null, undefined, {}, true, false, function () {
	}],
	TYPES_EXCEPT_STRING_OR_NUMBER = [null, undefined, {}, [], true, false, function () {
	}],
	TYPES_EXCEPT_STRING_OR_ARRAY_OR_NUMBER = [null, undefined, {}, true, false, function () {
	}],
	TYPES_EXCEPT_NUMBER = ['string', null, undefined, {}, [], true, false, function () {
	}],
	TYPES_EXCEPT_OBJECT = ['string', 123, 123.123, null, undefined, true, false, function () {
	}],
	TYPES_EXCEPT_BOOLEAN = ['string', 123, 123.123, null, undefined, {}, [], function () {
	}],
	TYPES_EXCEPT_FUNCTION = ['string', 123, 123.123, null, undefined, {}, [], true, false];

angular.module('app', ['ng', 'jmdobry.angular-data']);

// Setup before each test
beforeEach(function (done) {
	lifecycle.beforeValidate = function (resourceName, attrs, cb) {
		lifecycle.beforeValidate.callCount += 1;
		cb(null, attrs);
	};
	lifecycle.validate = function (resourceName, attrs, cb) {
		lifecycle.validate.callCount += 1;
		cb(null, attrs);
	};
	lifecycle.afterValidate = function (resourceName, attrs, cb) {
		lifecycle.afterValidate.callCount += 1;
		cb(null, attrs);
	};
	lifecycle.beforeCreate = function (resourceName, attrs, cb) {
		lifecycle.beforeCreate.callCount += 1;
		cb(null, attrs);
	};
	lifecycle.afterCreate = function (resourceName, attrs, cb) {
		lifecycle.afterCreate.callCount += 1;
		cb(null, attrs);
	};
	lifecycle.beforeUpdate = function (resourceName, attrs, cb) {
		lifecycle.beforeUpdate.callCount += 1;
		cb(null, attrs);
	};
	lifecycle.afterUpdate = function (resourceName, attrs, cb) {
		lifecycle.afterUpdate.callCount += 1;
		cb(null, attrs);
	};
	lifecycle.beforeDestroy = function (resourceName, attrs, cb) {
		lifecycle.beforeDestroy.callCount += 1;
		cb(null, attrs);
	};
	lifecycle.afterDestroy = function (resourceName, attrs, cb) {
		lifecycle.afterDestroy.callCount += 1;
		cb(null, attrs);
	};
	module('app', function (_DSProvider_) {
		DSProvider = _DSProvider_;
		DSProvider.config({
			baseUrl: 'http://test.angular-cache.com',
			beforeValidate: lifecycle.beforeValidate,
			validate: lifecycle.validate,
			afterValidate: lifecycle.afterValidate,
			beforeCreate: lifecycle.beforeCreate,
			afterCreate: lifecycle.afterCreate,
			beforeUpdate: lifecycle.beforeUpdate,
			afterUpdate: lifecycle.afterUpdate,
			beforeDestroy: lifecycle.beforeDestroy,
			afterDestroy: lifecycle.afterDestroy
		});
	});
	inject(function (_$rootScope_, _$q_, _$httpBackend_, _DS_, _$log_) {
		// Setup global mocks
		$q = _$q_;
		$rootScope = _$rootScope_;
		DS = _DS_;
		$httpBackend = _$httpBackend_;
		DS.defineResource({
			name: 'post',
			endpoint: '/posts'
		});
		$log = _$log_;

		lifecycle.beforeValidate.callCount = 0;
		lifecycle.validate.callCount = 0;
		lifecycle.afterValidate.callCount = 0;
		lifecycle.beforeCreate.callCount = 0;
		lifecycle.afterCreate.callCount = 0;
		lifecycle.beforeUpdate.callCount = 0;
		lifecycle.afterUpdate.callCount = 0;
		lifecycle.beforeDestroy.callCount = 0;
		lifecycle.afterDestroy.callCount = 0;
	});

	p1 = { author: 'John', age: 30, id: 5 };
	p2 = { author: 'Sally', age: 31, id: 6 };
	p3 = { author: 'Mike', age: 32, id: 7 };
	p4 = { author: 'Adam', age: 33, id: 8 };

	done();
});

// Clean up after each test
afterEach(function () {
	$httpBackend.verifyNoOutstandingExpectation();
	$httpBackend.verifyNoOutstandingRequest();
	$log.reset();
});
