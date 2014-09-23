describe('DS.updateAll(resourceName, attrs, params[, options])', function () {
  function errorPrefix(resourceName) {
    return 'DS.updateAll(' + resourceName + ', attrs, params[, options]): ';
  }

  beforeEach(startInjector);

  it('should throw an error when method pre-conditions are not met', function () {
    DS.updateAll('does not exist').then(function () {
      fail('should have rejected');
    }, function (err) {
      assert.isTrue(err instanceof DS.errors.NonexistentResourceError);
      assert.equal(err.message, errorPrefix('does not exist') + 'does not exist is not a registered resource!');
    });

    angular.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (key) {
        DS.updateAll('post', key).then(function () {
          fail('should have rejected');
        }, function (err) {
          assert.isTrue(err instanceof DS.errors.IllegalArgumentError);
          assert.equal(err.message, errorPrefix('post') + 'attrs: Must be an object!');
        });
      }
    });

    angular.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (key) {
        DS.updateAll('post', {}, key).then(function () {
          fail('should have rejected');
        }, function (err) {
          assert.isTrue(err instanceof DS.errors.IllegalArgumentError);
          assert.equal(err.message, errorPrefix('post') + 'params: Must be an object!');
        });
      }
    });

    angular.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (key) {
        DS.updateAll('post', {}, {}, key).then(function () {
          fail('should have rejected');
        }, function (err) {
          assert.isTrue(err instanceof DS.errors.IllegalArgumentError);
          assert.equal(err.message, errorPrefix('post') + 'options: Must be an object!');
        });
      }
    });
  });
  it('should update a collection of items', function () {
    $httpBackend.expectPUT('http://test.angular-cache.com/posts?where=%7B%22age%22:%7B%22%3D%3D%22:33%7D%7D').respond(200, [
      { author: 'Adam', age: 27, id: 8 },
      { author: 'Adam', age: 27, id: 9 }
    ]);

    var post4 = DS.inject('post', p4),
      post5 = DS.inject('post', p5),
      posts = DS.filter('post', { where: { age: { '==': 33 } } });

    var initialModified = DS.lastModified('post', 8),
      initialSaved = DS.lastSaved('post', 8);

    DS.updateAll('post', { age: 27 }, { where: { age: { '==': 33 } } }).then(function (ps) {
      assert.deepEqual(angular.toJson(ps), angular.toJson(posts), '2 posts should have been updated');
      assert.equal(posts[0].age, 27);
      assert.equal(posts[1].age, 27);
      assert.equal(post4.age, 27);
      assert.equal(post5.age, 27);
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    $httpBackend.flush();
    $httpBackend.expectPUT('http://test.angular-cache.com/posts?where=%7B%22age%22:%7B%22%3D%3D%22:31%7D%7D').respond(200, [
      { author: 'Jane', age: 5, id: 6 }
    ]);

    assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
    assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
    assert.deepEqual(angular.toJson(DS.filter('post', { where: { age: { '==': 27 } } })), angular.toJson(posts));
    assert.notEqual(DS.lastModified('post', 8), initialModified);
    assert.notEqual(DS.lastSaved('post', 8), initialSaved);

    DS.updateAll('post', { age: 5 }, { where: { age: { '==': 31 } } }).then(function (ps) {
      assert.deepEqual(angular.toJson(ps), angular.toJson(DS.filter('post', { where: { age: { '==': 5 } } })));
      assert.deepEqual(angular.toJson(ps[0]), angular.toJson({ author: 'Jane', age: 5, id: 6 }));
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    $httpBackend.flush();

    assert.equal(lifecycle.beforeInject.callCount, 5, 'beforeInject should have been called');
    assert.equal(lifecycle.afterInject.callCount, 5, 'afterInject should have been called');
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
    $httpBackend.expectPUT('http://test.angular-cache.com/user/4/comment?content=test').respond(200, [testComment, testComment2]);

    DS.inject('comment', testComment);

    DS.updateAll('comment', {
      content: 'stuff'
    }, {
      content: 'test'
    }, {
      params: {
        approvedBy: 4
      }
    }).then(function (comments) {
      assert.deepEqual(angular.toJson(comments), angular.toJson([testComment, testComment2]));
      assert.deepEqual(angular.toJson(comments), angular.toJson(DS.filter('comment', {
        content: 'stuff'
      })));
    }, function () {
      fail('Should not have failed!');
    });

    $httpBackend.flush();

    DS.ejectAll('comment');

    $httpBackend.expectPUT('http://test.angular-cache.com/comment?content=test').respond(200, [testComment, testComment2]);

    DS.inject('comment', testComment2);

    DS.updateAll('comment', {
      content: 'stuff'
    }, {
      content: 'test'
    }).then(function (comments) {
      assert.deepEqual(angular.toJson(comments), angular.toJson([testComment, testComment2]));
      assert.deepEqual(angular.toJson(comments), angular.toJson(DS.filter('comment', {
        content: 'stuff',
        sort: 'id'
      })));
    }, function () {
      fail('Should not have failed!');
    });

    $httpBackend.flush();

    DS.ejectAll('comment');

    $httpBackend.expectPUT('http://test.angular-cache.com/comment?content=test').respond(200, [testComment, testComment2]);

    DS.inject('comment', testComment2);

    DS.updateAll('comment', {
      content: 'stuff'
    }, {
      content: 'test'
    }, {
      params: {
        approvedBy: false
      }
    }).then(function (comments) {
      assert.deepEqual(angular.toJson(comments), angular.toJson([testComment, testComment2]));
      assert.deepEqual(angular.toJson(comments), angular.toJson(DS.filter('comment', {
        content: 'stuff',
        sort: 'id'
      })));
    }, function () {
      fail('Should not have failed!');
    });

    $httpBackend.flush();
  });
});
