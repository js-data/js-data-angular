describe('DS.bindAll(scope, expr, resourceName, params[, cb])', function () {
  function errorPrefix(resourceName) {
    return 'DS.bindAll(scope, expr, ' + resourceName + ', params[, cb]): ';
  }

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
        DS.bindAll(key);
      }, DS.errors.IllegalArgumentError, errorPrefix() + 'scope: Must be an object!');
    });

    angular.forEach(TYPES_EXCEPT_STRING, function (key) {
      assert.throws(function () {
        DS.bindAll($scope, key);
      }, DS.errors.IllegalArgumentError, errorPrefix() + 'expr: Must be a string!');
    });

    assert.throws(function () {
      DS.bindAll($scope, 'post', 'does not exist', {});
    }, DS.errors.NonexistentResourceError, errorPrefix('does not exist') + 'does not exist is not a registered resource!');

    angular.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (key) {
        assert.throws(function () {
          DS.bindAll($scope, 'post', 'post', key);
        }, DS.errors.IllegalArgumentError, errorPrefix('post') + 'params: Must be an object!');
      }
    });
  });
  it('should bind an item in the data store to the scope', function () {

    DS.inject('post', p1);
    DS.inject('post', p2);
    DS.inject('post', p3);
    DS.inject('post', p4);
    DS.inject('post', p5);

    DS.bindAll($scope, 'posts', 'post', {
      where: {
        age: {
          '>': 31
        }
      }
    });

    $rootScope.$apply();

    assert.deepEqual(angular.toJson($scope.posts), angular.toJson([p3, p4, p5]));

    DS.eject('post', 8);

    $rootScope.$apply();

    assert.deepEqual(angular.toJson($scope.posts), angular.toJson([p3, p5]));
  });
  it('should execute a callback if given', function () {

    var cb = sinon.spy();
    DS.inject('post', p1);
    DS.inject('post', p2);
    DS.inject('post', p3);
    DS.inject('post', p4);
    DS.inject('post', p5);

    DS.bindAll($scope, 'posts', 'post', {
      where: {
        age: {
          '>': 31
        }
      }
    }, cb);

    $rootScope.$apply();

    assert.deepEqual(angular.toJson($scope.posts), angular.toJson([p3, p4, p5]));
    assert.equal(cb.callCount, 1);

    DS.eject('post', 8);

    $rootScope.$apply(function () {
      assert.deepEqual(angular.toJson($scope.posts), angular.toJson([p3, p5]));
      assert.equal(cb.callCount, 2);
    });
  });
});
