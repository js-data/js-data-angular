// Setup global test variables
var $rootScope, $q, $log;

// Helper globals
var fail = function (msg) {
    assert.equal('should not reach this!: ' + msg, 'failure');
  },
  TYPES_EXCEPT_STRING = [123, 123.123, null, undefined, {}, [], true, false, function () {}],
  TYPES_EXCEPT_STRING_OR_ARRAY = [123, 123.123, null, undefined, {}, true, false, function () {}],
  TYPES_EXCEPT_ARRAY = ['string', 123, 123.123, null, undefined, {}, true, false, function () {}],
  TYPES_EXCEPT_STRING_OR_NUMBER = [null, undefined, {}, [], true, false, function () {}],
  TYPES_EXCEPT_STRING_OR_ARRAY_OR_NUMBER = [null, undefined, {}, true, false, function () {}],
  TYPES_EXCEPT_NUMBER = ['string', null, undefined, {}, [], true, false, function () {}],
  TYPES_EXCEPT_OBJECT = ['string', 123, 123.123, null, undefined, true, false, function () {}],
  TYPES_EXCEPT_BOOLEAN = ['string', 123, 123.123, null, undefined, {}, [], function () {}],
  TYPES_EXCEPT_FUNCTION = ['string', 123, 123.123, null, undefined, {}, [], true, false];

angular.module('jmdobry.angular-data', ['ng', 'jmdobry.binary-heap', 'ngMock']);

beforeEach(module('jmdobry.angular-data'));

// Setup before each test
beforeEach(inject(function (_$rootScope_, _$q_) {
  // Setup global mocks
  $q = _$q_;
  $rootScope = _$rootScope_;
  $log = {
    warn: function () {},
    log: function () {},
    info: function () {},
    error: function () {},
    debug: function () {}
  };

  // Setup global spies
  sinon.spy($log, 'warn');
  sinon.spy($log, 'log');
  sinon.spy($log, 'info');
  sinon.spy($log, 'error');
  sinon.spy($log, 'debug');
}));

// Clean up after each test
afterEach(function () {
  // Tear down global spies
  $log.warn.restore();
  $log.log.restore();
  $log.info.restore();
  $log.error.restore();
  $log.debug.restore();
});
