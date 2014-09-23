describe('DS.previous(resourceName, id)', function () {
  function errorPrefix(resourceName, id) {
    return 'DS.previous(' + resourceName + '[, ' + id + ']): ';
  }

  beforeEach(startInjector);

  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      DS.previous('does not exist', {});
    }, DS.errors.NonexistentResourceError, errorPrefix('does not exist', {}) + 'does not exist is not a registered resource!');

    angular.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      assert.throws(function () {
        DS.previous('post', key);
      }, DS.errors.IllegalArgumentError, errorPrefix('post', key) + 'id: Must be a string or a number!');
    });
  });
  it('should return false if the item is not in the store', function () {

    assert.isUndefined(DS.previous('post', 5));
  });
  it('should return the previous in an object', function () {

    DS.inject('post', p1);

    var post = DS.get('post', 5);

    assert.deepEqual(DS.previous('post', 5), p1);

    post.author = 'Jake';

    DS.digest();

    assert.deepEqual(DS.previous('post', 5), p1);
    assert.deepEqual(angular.toJson(DS.get('post', 5)), angular.toJson({ author: 'Jake', age: 30, id: 5 }));

    $httpBackend.expectPUT('http://test.angular-cache.com/posts/5', DS.get('post', 5)).respond(200, { author: 'Jake', age: 30, id: 5 });

    DS.save('post', 5);

    $httpBackend.flush();

    assert.deepEqual(angular.toJson(DS.previous('post', 5)), angular.toJson({ author: 'Jake', age: 30, id: 5 }), 'previous attributes should have been updated');
    assert.deepEqual(angular.toJson(DS.get('post', 5)), angular.toJson({ author: 'Jake', age: 30, id: 5 }));
  });
  it('should return the previous in an object and save changed only', function () {

    DS.inject('post', p1);

    var post = DS.get('post', 5);

    assert.deepEqual(DS.previous('post', 5), p1);

    post.author = 'Jake';

    DS.digest();

    assert.deepEqual(DS.previous('post', 5), p1);
    assert.deepEqual(angular.toJson(DS.get('post', 5)), angular.toJson({ author: 'Jake', age: 30, id: 5 }));

    $httpBackend.expectPUT('http://test.angular-cache.com/posts/5', { author: 'Jake' }).respond(200, { author: 'Jake', age: 30, id: 5 });

    DS.save('post', 5, { changesOnly: true });

    $httpBackend.flush();

    assert.deepEqual(angular.toJson(DS.previous('post', 5)), angular.toJson({ author: 'Jake', age: 30, id: 5 }), 'previous attributes should have been updated');
    assert.deepEqual(angular.toJson(DS.get('post', 5)), angular.toJson({ author: 'Jake', age: 30, id: 5 }));
  });
});
