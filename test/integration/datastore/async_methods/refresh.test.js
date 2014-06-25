describe('DS.refresh(resourceName, id[, options]): ', function () {
  var errorPrefix = 'DS.refresh(resourceName, id[, options]): ';

  beforeEach(startInjector);

  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      DS.refresh('does not exist', 5);
    }, DS.errors.RuntimeError, errorPrefix + 'does not exist is not a registered resource!');

    angular.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      assert.throws(function () {
        DS.refresh('post', key);
      }, DS.errors.IllegalArgumentError, errorPrefix + 'id: Must be a string or a number!');
    });

    angular.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (key) {
        assert.throws(function () {
          DS.refresh('post', 5, key);
        }, DS.errors.IllegalArgumentError, errorPrefix + 'options: Must be an object!');
      }
    });
  });
  it('should get an item from the server', function () {

    // Should do nothing because the data isn't in the store
    assert.isFalse(DS.refresh('post', 5));

    assert.isUndefined(DS.get('post', 5), 'The post should not be in the store yet');

    DS.inject('post', p1);
    assert.deepEqual(DS.get('post', 5), p1, 'The post is now in the store');

    var initialLastModified = DS.lastModified('post', 5);

    $httpBackend.expectGET('http://test.angular-cache.com/posts/5').respond(200, { author: 'John', age: 31, id: 5 });

    // Should refresh the item that's in the store
    DS.refresh('post', 5).then(function (post) {
      assert.deepEqual(post, { author: 'John', age: 31, id: 5 });
    }, function (err) {
      console.error(err.stack);
      fail('Should not have rejected!');
    });

    // Should have no effect because the request is already pending
    DS.refresh('post', 5).then(function (post) {
      assert.deepEqual(post, { author: 'John', age: 31, id: 5 });
    }, function (err) {
      console.error(err.stack);
      fail('Should not have rejected!');
    });

    $httpBackend.flush();

    assert.deepEqual(DS.get('post', 5), { author: 'John', age: 31, id: 5 }, 'The post has been refreshed');
    assert.notEqual(DS.lastModified('post', 5), initialLastModified);
  });
});
