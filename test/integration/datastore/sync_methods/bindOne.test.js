describe('DS.bindOne(scope, expr, resourceName, id[, cb])', function () {
  var errorPrefix = 'DS.bindOne(scope, expr, resourceName, id[, cb]): ';

  var $rootScope, $scope;

  beforeEach(startInjector);

  beforeEach(function () {
    inject(function (_$rootScope_) {
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
    });
  });

  it('should throw an error when method pre-conditions are not met', function () {
    angular.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      assert.throws(function () {
        DS.bindOne(key);
      }, DS.errors.IllegalArgumentError, errorPrefix + 'scope: Must be an object!');
    });

    angular.forEach(TYPES_EXCEPT_STRING, function (key) {
      assert.throws(function () {
        DS.bindOne($scope, key);
      }, DS.errors.IllegalArgumentError, errorPrefix + 'expr: Must be a string!');
    });

    assert.throws(function () {
      DS.bindOne($scope, 'post', 'does not exist', {});
    }, DS.errors.RuntimeError, errorPrefix + 'does not exist is not a registered resource!');

    angular.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      assert.throws(function () {
        DS.bindOne($scope, 'post', 'post', key);
      }, DS.errors.IllegalArgumentError, errorPrefix + 'id: Must be a string or a number!');
    });
  });
  it('should bind an item in the data store to the scope', function () {

    DS.inject('post', p1);
    DS.inject('post', p2);

    var post = DS.get('post', 5);
    var post2 = DS.get('post', 6);

    DS.bindOne($scope, 'post', 'post', 5);
    DS.bindOne($scope, 'other.post', 'post', 6);
    DS.bindOne($scope, 'post3', 'post', 7);

    $rootScope.$apply();

    assert.deepEqual($scope.post, post);
    assert.deepEqual($scope.other.post, post2);
    assert.isUndefined($scope.post2);

    post.author = 'Jason';

    $rootScope.$apply();

    assert.equal($scope.post.author, 'Jason');
    assert.deepEqual($scope.post, post);
    assert.deepEqual($scope.other.post, post2);
    assert.isUndefined($scope.post2);
  });
  it('should execute a callback if given', function () {

    var cb = sinon.spy();
    DS.inject('post', p1);

    var post = DS.get('post', 5);

    DS.bindOne($scope, 'post', 'post', 5, cb);

    $rootScope.$apply();

    assert.equal(cb.callCount, 1);
    assert.deepEqual($scope.post, post);

    post.author = 'Jason';

    DS.digest();

    $rootScope.$apply(function () {
      assert.equal(cb.callCount, 2);
      assert.equal($scope.post.author, 'Jason');
      assert.deepEqual($scope.post, post);
    });
  });
});
