describe('DS.update(resourceName, id, attrs[, options])', function () {
  function errorPrefix(resourceName, id) {
    return 'DS.update(' + resourceName + ', ' + id + ', attrs[, options]): ';
  }

  beforeEach(startInjector);

  it('should throw an error when method pre-conditions are not met', function () {
    DS.update('does not exist', 5).then(function () {
      fail('should have rejected');
    }, function (err) {
      assert.isTrue(err instanceof DS.errors.NonexistentResourceError);
      assert.equal(err.message, errorPrefix('does not exist', 5) + 'does not exist is not a registered resource!');
    });

    angular.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      DS.update('post', key).then(function () {
        fail('should have rejected');
      }, function (err) {
        assert.isTrue(err instanceof DS.errors.IllegalArgumentError);
        assert.equal(err.message, errorPrefix('post', key) + 'id: Must be a string or a number!');
      });
    });

    angular.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (key) {
        DS.update('post', 5, key).then(function () {
          fail('should have rejected');
        }, function (err) {
          assert.isTrue(err instanceof DS.errors.IllegalArgumentError);
          assert.equal(err.message, errorPrefix('post', 5) + 'attrs: Must be an object!');
        });
      }
    });

    angular.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (key) {
        DS.update('post', 5, {}, key).then(function () {
          fail('should have rejected');
        }, function (err) {
          assert.isTrue(err instanceof DS.errors.IllegalArgumentError);
          assert.equal(err.message, errorPrefix('post', 5) + 'options: Must be an object!');
        });
      }
    });
  });
  it('should update an item', function () {
    $httpBackend.expectPUT('http://test.angular-cache.com/posts/5').respond(200, { author: 'Jake', age: 30, id: 5 });

    var post = DS.inject('post', p1);

    var initialModified = DS.lastModified('post', 5),
      initialSaved = DS.lastSaved('post', 5);

    DS.update('post', 5, { author: 'Jake' }).then(function (p) {
      assert.deepEqual(p, post, 'post 5 should have been updated');
      assert.equal(p.author, 'Jake');
      assert.equal(post.author, 'Jake');
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    $httpBackend.flush();
    $httpBackend.expectPUT('http://test.angular-cache.com/posts/6').respond(200, { author: 'Jane', age: 31, id: 6 });

    assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
    assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
    assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called');
    assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called');
    assert.equal(lifecycle.serialize.callCount, 1, 'serialize should have been called');
    assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
    assert.deepEqual(DS.get('post', 5), post);
    assert.notEqual(DS.lastModified('post', 5), initialModified);
    assert.notEqual(DS.lastSaved('post', 5), initialSaved);

    DS.update('post', 6, { author: 'Jane' }).then(function (p) {
      assert.deepEqual(p, DS.get('post', 6));
      assert.deepEqual(p, { author: 'Jane', age: 31, id: 6 });
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    $httpBackend.flush();

    assert.equal(lifecycle.beforeInject.callCount, 3, 'beforeInject should have been called');
    assert.equal(lifecycle.afterInject.callCount, 3, 'afterInject should have been called');
    assert.equal(lifecycle.serialize.callCount, 2, 'serialize should have been called');
    assert.equal(lifecycle.deserialize.callCount, 2, 'deserialize should have been called');
  });
  it('should handle nested resources', function () {
    var testComment = {
      id: 5,
      content: 'stuff',
      approvedBy: 4
    };
    var testComment2 = {
      id: 6,
      content: 'stuff',
      approvedBy: 4
    };
    $httpBackend.expectPUT('http://test.angular-cache.com/user/4/comment/5').respond(200, testComment);

    DS.inject('comment', testComment);

    DS.update('comment', 5, {
      content: 'stuff'
    }).then(function (comment) {
      assert.deepEqual(comment, testComment);
      assert.deepEqual(comment, DS.get('comment', 5));
    }, function () {
      fail('Should not have failed!');
    });

    $httpBackend.flush();

    $httpBackend.expectPUT('http://test.angular-cache.com/user/4/comment/6').respond(200, testComment2);

    DS.inject('comment', testComment2);

    DS.update('comment', 6, {
      content: 'stuff'
    }, {
      parentKey: 4
    }).then(function (comment) {
      assert.deepEqual(comment, testComment2);
      assert.deepEqual(comment, DS.get('comment', 6));
    }, function () {
      fail('Should not have failed!');
    });

    $httpBackend.flush();
  });
});
