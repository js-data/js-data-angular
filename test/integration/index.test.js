describe('$q decorator', function () {
  beforeEach(module('angular-data.DS'));

  it('should decorate $q', inject(function ($q) {
    assert.isFunction($q.promisify);
  }));

  it('should resolve with a cb', inject(function ($q, $rootScope) {
    var resolveValue = {};
    var resolveCb = function (cb) {
      cb(null, resolveValue);
    };
    var resolveSpy = sinon.spy();

    $q.promisify(resolveCb)().then(resolveSpy);
    $rootScope.$digest();

    assert(resolveSpy.calledWith(resolveValue));
  }));

  it('should reject with a cb', inject(function ($q, $rootScope) {
    var rejectValue = {};
    var rejectCb = function (cb) {
      cb(rejectValue);
    };
    var rejectSpy = sinon.spy();

    $q.promisify(rejectCb)().then(null, rejectSpy);
    $rootScope.$digest();

    assert(rejectSpy.calledWith(rejectValue));
  }));

  it('should resolve with a promise', inject(function ($q, $rootScope) {
    var resolveValue = {};
    var resolveCb = function () {
      return $q.when(resolveValue);
    };
    var resolveSpy = sinon.spy();

    $q.promisify(resolveCb)().then(resolveSpy);
    $rootScope.$digest();

    assert(resolveSpy.calledWith(resolveValue));
  }));

  it('should reject with a promise', inject(function ($q, $rootScope) {
    var rejectValue = {};
    var rejectCb = function () {
      return $q.reject(rejectValue);
    };
    var rejectSpy = sinon.spy();

    $q.promisify(rejectCb)().then(null, rejectSpy);
    $rootScope.$digest();

    assert(rejectSpy.calledWith(rejectValue));
  }));

  //Typically, functions that return a promise will be wrapped with a $q.when, meaning if you were to return nothing, it would execute straight away
  //This would mean the cb style would not work at all, as any developer that uses cb would have the function immediately resolve
  //This just ensures that doesn't ever happen
  it('should not resolve or reject if return value is not a promise', inject(function ($q, $rootScope) {
    var resolve;
    var cb = function (next) {
      resolve = next;
      return true;
    };
    var spy = sinon.spy();

    $q.promisify(cb)().finally(spy);
    $rootScope.$digest();

    assert(!spy.called);

    resolve();
    $rootScope.$digest();

    assert(spy.called);
  }));
});
