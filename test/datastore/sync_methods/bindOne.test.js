describe('DS.bindOne', function () {
  var $rootScope, $scope;

  beforeEach(startInjector);

  beforeEach(function () {
    inject(function (_$rootScope_) {
      $rootScope = _$rootScope_;
      $scope = $rootScope.$new();
    });
  });

  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      DS.bindOne('does not exist');
    }, DS.errors.NonexistentResourceError, 'does not exist is not a registered resource!');

    angular.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      assert.throws(function () {
        DS.bindOne('post', key);
      }, DS.errors.IllegalArgumentError, '"id" must be a string or a number!');
    });

    angular.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      assert.throws(function () {
        DS.bindOne('post', 5, key);
      }, DS.errors.IllegalArgumentError, '"scope" must be an object!');
    });

    angular.forEach(TYPES_EXCEPT_STRING, function (key) {
      assert.throws(function () {
        DS.bindOne('post', 5, $scope, key);
      }, DS.errors.IllegalArgumentError, '"expr" must be a string!');
    });
  });
  it('should bind an item in the data store to the scope', function () {

    DS.inject('post', p1);
    DS.inject('post', p2);

    var post = DS.get('post', 5);
    var post2 = DS.get('post', 6);

    DS.bindOne('post', 5, $scope, 'post');
    DS.bindOne('post', 6, $scope, 'other.post');
    DS.bindOne('post', 7, $scope, 'post3');

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
  it('should execute a callback if given', function (done) {

    var Post = DS.definitions.post;
    var cb = sinon.spy();
    Post.inject(p1);

    var post = Post.get(5);

    Post.bindOne(5, $scope, 'post', cb);

    $rootScope.$apply();

    assert.equal(cb.callCount, 1);
    assert.deepEqual($scope.post, post);

    post.author = 'Jason';

    DS.digest();
    $rootScope.$apply();

    setTimeout(function () {
      $rootScope.$apply();

      assert.equal(cb.callCount, 2);
      assert.equal($scope.post.author, 'Jason');
      assert.deepEqual($scope.post, post);

      done();
    }, 50);
  });
});
