describe('DS.find', function () {
  beforeEach(startInjector);

  it('should get an item from the server', function () {
    $httpBackend.expectGET('http://test.angular-cache.com/posts/5').respond(200, p1);

    DS.find('post', 5).then(function (post) {
      assert.deepEqual(angular.toJson(post), angular.toJson(p1));
    }, function (err) {
      console.error(err.stack);
      fail('Should not have rejected!');
    });

    assert.isUndefined(DS.get('post', 5), 'The post should not be in the store yet');

    // Should have no effect because there is already a pending query
    DS.find('post', 5).then(function (post) {
      assert.deepEqual(angular.toJson(post), angular.toJson(p1));
    }, function (err) {
      console.error(err.stack);
      fail('Should not have rejected!');
    });

    $httpBackend.flush();

    assert.deepEqual(angular.toJson(DS.get('post', 5)), angular.toJson(p1), 'The post is now in the store');
    assert.isNumber(DS.lastModified('post', 5));
    assert.isNumber(DS.lastSaved('post', 5));

    // Should not make a request because the request was already completed
    DS.find('post', 5).then(function (post) {
      assert.deepEqual(angular.toJson(post), angular.toJson(p1));
    }, function (err) {
      console.error(err.stack);
      fail('Should not have rejected!');
    });

    $httpBackend.expectGET('http://test.angular-cache.com/posts/5').respond(200, p1);

    // Should make a request because bypassCache is set to true
    DS.find('post', 5, { bypassCache: true }).then(function (post) {
      assert.deepEqual(angular.toJson(post), angular.toJson(p1));
    }, function (err) {
      console.error(err.stack);
      fail('Should not have rejected!');
    });

    $httpBackend.flush();

    assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called');
    assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called');
    assert.equal(lifecycle.serialize.callCount, 0, 'serialize should have been called');
    assert.equal(lifecycle.deserialize.callCount, 2, 'deserialize should have been called');
  });
  it('should get an item from the server but not store it if cacheResponse is false', function () {
    $httpBackend.expectGET('http://test.angular-cache.com/posts/5').respond(200, p1);

    DS.find('post', 5, { cacheResponse: false }).then(function (post) {
      assert.deepEqual(angular.toJson(post), angular.toJson(p1));
    }, function (err) {
      console.error(err.stack);
      fail('Should not have rejected!');
    });

    $httpBackend.flush();

    assert.isUndefined(DS.get('post', 5), 'The post should not have been injected into the store');
    assert.equal(lifecycle.beforeInject.callCount, 0, 'beforeInject should have been called');
    assert.equal(lifecycle.afterInject.callCount, 0, 'afterInject should have been called');
    assert.equal(lifecycle.serialize.callCount, 0, 'serialize should have been called');
    assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
  });
  it('should correctly propagate errors', function () {
    $httpBackend.expectGET('http://test.angular-cache.com/posts/5').respond(404, 'Not Found');

    DS.find('post', 5).then(function () {
      fail('should not have succeeded!');
    });

    try {
      $httpBackend.flush();
    } catch (err) {
      assert.equal(err.data, 'Not Found');
    }
  });
  it('should handle nested resources', function () {
    var testComment = {
      id: 5,
      content: 'test',
      approvedBy: 4
    };
    $httpBackend.expectGET('http://test.angular-cache.com/user/4/comment/5').respond(200, testComment);

    DS.find('comment', 5, {
      params: {
        approvedBy: 4
      }
    }).then(function (comment) {
      assert.deepEqual(angular.toJson(comment), angular.toJson(testComment));
      assert.deepEqual(angular.toJson(comment), angular.toJson(DS.get('comment', 5)));
    }, function () {
      fail('Should not have failed!');
    });

    $httpBackend.flush();

    $httpBackend.expectGET('http://test.angular-cache.com/user/4/comment/5').respond(200, testComment);

    DS.find('comment', 5, {
      bypassCache: true
    }).then(function (comment) {
      assert.deepEqual(angular.toJson(comment), angular.toJson(testComment));
      assert.deepEqual(angular.toJson(comment), angular.toJson(DS.get('comment', 5)));
    }, function () {
      fail('Should not have failed!');
    });

    $httpBackend.flush();

    $httpBackend.expectGET('http://test.angular-cache.com/comment/5').respond(200, testComment);

    DS.find('comment', 5, {
      bypassCache: true,
      params: {
        approvedBy: false
      }
    }).then(function (comment) {
      assert.deepEqual(angular.toJson(comment), angular.toJson(testComment));
      assert.deepEqual(angular.toJson(comment), angular.toJson(DS.get('comment', 5)));
    }, function () {
      fail('Should not have failed!');
    });

    $httpBackend.flush();

    $httpBackend.expectGET('http://test.angular-cache.com/organization/14/user/19/comment/19').respond(200, comment19);

    DS.find('comment', 19, {
      bypassCache: true,
      params: {
        approvedBy: 19,
        organizationId: 14
      }
    }).then(function (comment) {
      assert.equal(comment.id, comment19.id);
      assert.equal(comment.id, DS.get('comment', 19).id);
    }, function () {
      fail('Should not have failed!');
    });

    $httpBackend.flush();
  });
});
