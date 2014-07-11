describe('DS.save(resourceName, id[, options])', function () {
  var errorPrefix = 'DS.save(resourceName, id[, options]): ';

  beforeEach(startInjector);

  it('should throw an error when method pre-conditions are not met', function () {
    DS.save('does not exist', 5).then(function () {
      fail('should have rejected');
    }, function (err) {
      assert.isTrue(err instanceof DS.errors.NonexistentResourceError);
      assert.equal(err.message, errorPrefix + 'does not exist is not a registered resource!');
    });

    angular.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      DS.save('post', key).then(function () {
        fail('should have rejected');
      }, function (err) {
        assert.isTrue(err instanceof DS.errors.IllegalArgumentError);
        assert.equal(err.message, errorPrefix + 'id: Must be a string or a number!');
      });
    });

    angular.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (key) {
        DS.save('post', 5, key).then(function () {
          fail('should have rejected');
        }, function (err) {
          assert.isTrue(err instanceof DS.errors.IllegalArgumentError);
          assert.equal(err.message, errorPrefix + 'options: Must be an object!');
        });
      }
    });
  });
  it('should save an item to the server and inject the result', function () {
    $httpBackend.expectPUT('http://test.angular-cache.com/posts/5').respond(200, {
      author: 'Jake',
      id: 5,
      age: 30
    });

    DS.inject('post', p1);

    var initialModified = DS.lastModified('post', 5);
    var initialSaved = DS.lastSaved('post', 5);

    DS.get('post', 5).author = 'Jake';

    DS.save('post', 5).then(function (post) {
      assert.deepEqual(post, DS.get('post', 5), 'post 5 should have been saved');
      assert.equal(post.author, 'Jake');
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    $httpBackend.flush();

    assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
    assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
    assert.deepEqual(DS.get('post', 5), {
      author: 'Jake',
      id: 5,
      age: 30
    });
    assert.notEqual(DS.lastModified('post', 5), initialModified);
    assert.notEqual(DS.lastSaved('post', 5), initialSaved);

    DS.save('post', 6).then(function () {
      fail('should not have succeeded');
    }, function (err) {
      assert.isTrue(err instanceof DS.errors.RuntimeError);
      assert.equal(err.message, errorPrefix + 'id: "6" not found!');
    });

    assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called');
    assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called');
    assert.equal(lifecycle.serialize.callCount, 1, 'serialize should have been called');
    assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
  });
  it('should save an item to the server but not inject the result', function () {
    $httpBackend.expectPUT('http://test.angular-cache.com/posts/5').respond(200, {
      random: 'stuff'
    });

    DS.inject('post', p1);

    var initialModified = DS.lastModified('post', 5);
    var initialSaved = DS.lastSaved('post', 5);

    DS.get('post', 5).author = 'Jake';

    DS.save('post', 5, { cacheResponse: false }).then(function (post) {
      assert.deepEqual(post, {
        random: 'stuff'
      }, 'should have the right response');
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    $httpBackend.flush();

    assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
    assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
    assert.equal(lifecycle.beforeInject.callCount, 1, 'beforeInject should have been called only once');
    assert.equal(lifecycle.afterInject.callCount, 1, 'afterInject should have been called only once');
    assert.deepEqual(DS.get('post', 5), {
      author: 'Jake',
      id: 5,
      age: 30
    });
    // item wasn't injected
    assert.equal(DS.lastModified('post', 5), initialModified);
    assert.equal(DS.lastSaved('post', 5), initialSaved);
  });
  it('should save changes of an item to the server', function () {
    $httpBackend.expectPUT('http://test.angular-cache.com/posts/5', { author: 'Jake' }).respond(200, {
      author: 'Jake',
      id: 5,
      age: 30
    });

    DS.inject('post', p1);

    var initialModified = DS.lastModified('post', 5),
      initialSaved = DS.lastSaved('post', 5),
      post1 = DS.get('post', 5);

    post1.author = 'Jake';

    DS.save('post', 5, { changesOnly: true }).then(function (post) {
      assert.deepEqual(post, post1, 'post 5 should have been saved');
      assert.equal(post.author, 'Jake');
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    $httpBackend.flush();

    assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
    assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
    assert.deepEqual(DS.get('post', 5), post1);
    assert.notEqual(DS.lastModified('post', 5), initialModified);
    assert.notEqual(DS.lastSaved('post', 5), initialSaved);

    DS.save('post', 6).then(function () {
      fail('should not have succeeded');
    }, function (err) {
      assert.isTrue(err instanceof DS.errors.RuntimeError);
      assert.equal(err.message, errorPrefix + 'id: "6" not found!');
    });

    assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called');
    assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called');
    assert.equal(lifecycle.serialize.callCount, 1, 'serialize should have been called');
    assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
  });
});
