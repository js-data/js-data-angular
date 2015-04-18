describe('DS.create', function () {
  beforeEach(startInjector);

  it('should create an item and save it to the server', function () {
    $httpBackend.expectPOST('http://test.angular-cache.com/posts').respond(200, p1);

    DS.create('post', { author: 'John', age: 30 }).then(function (post) {
      assert.deepEqual(angular.toJson(post), angular.toJson(p1), 'post 5 should have been created');

      assert.equal(lifecycle.beforeCreate.callCount, 1, 'beforeCreate should have been called');
      assert.equal(lifecycle.afterCreate.callCount, 1, 'afterCreate should have been called');
      assert.equal(lifecycle.beforeInject.callCount, 1, 'beforeInject should have been called');
      assert.equal(lifecycle.afterInject.callCount, 1, 'afterInject should have been called');
      assert.equal(lifecycle.serialize.callCount, 1, 'serialize should have been called');
      assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
      assert.deepEqual(angular.toJson(DS.get('post', 5)), angular.toJson(p1));
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    $httpBackend.flush();
  });
  it('should create an item and save it to the server but not inject the result', function () {
    DSHttpAdapter.defaults.forceTrailingSlash = true;
    $httpBackend.expectPOST('http://test.angular-cache.com/posts/').respond(200, p1);

    DS.create('post', { author: 'John', age: 30 }, { cacheResponse: false }).then(function (post) {
      assert.deepEqual(angular.toJson(post), angular.toJson(p1), 'post 5 should have been created');
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    $httpBackend.flush();

    DSHttpAdapter.defaults.forceTrailingSlash = false;

    assert.equal(lifecycle.beforeCreate.callCount, 1, 'beforeCreate should have been called');
    assert.equal(lifecycle.afterCreate.callCount, 1, 'afterCreate should have been called');
    assert.equal(lifecycle.beforeInject.callCount, 0, 'beforeInject should not have been called');
    assert.equal(lifecycle.afterInject.callCount, 0, 'afterInject should not have been called');
    assert.equal(lifecycle.serialize.callCount, 1, 'serialize should have been called');
    assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
    assert.isUndefined(DS.get('post', 5));
  });
  it('should work with the upsert option', function () {
    $httpBackend.expectPUT('http://test.angular-cache.com/posts/5').respond(200, p1);

    DS.create('post', { author: 'John', age: 30, id: 5 }).then(function (post) {
      assert.deepEqual(angular.toJson(post), angular.toJson(p1), 'post 5 should have been created');
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    $httpBackend.flush();
    $httpBackend.expectPOST('http://test.angular-cache.com/posts').respond(200, p2);

    DS.create('post', { author: 'Sue', age: 70, id: 6 }, { upsert: false }).then(function (post) {
      assert.deepEqual(angular.toJson(post), angular.toJson(p2), 'post 6 should have been created');
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    $httpBackend.flush();

    assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
    assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
    assert.equal(lifecycle.beforeCreate.callCount, 1, 'beforeCreate should have been called');
    assert.equal(lifecycle.afterCreate.callCount, 1, 'afterCreate should have been called');
    assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called twice');
    assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called twice');
    assert.equal(lifecycle.serialize.callCount, 2, 'serialize should have been called twice');
    assert.equal(lifecycle.deserialize.callCount, 2, 'deserialize should have been called twice');
    assert.isDefined(DS.get('post', 5));
    assert.isDefined(DS.get('post', 6));
  });
  it('should create an item that includes relations, save them to the server and inject the results', function () {
    var payload = {
      id: 99,
      name: 'Sally',
      profile: {
        id: 999,
        userId: 99,
        email: 'sally@test.com'
      }
    };

    $httpBackend.expectPOST('http://test.angular-cache.com/user').respond(200, payload);

    DS.create('user', {
      name: 'Sally',
      profile: {
        email: 'sally@test.com'
      }
    }, {
      findBelongsTo: true
    }).then(function (user) {
      assert.deepEqual(user.id, payload.id, 'user should have been created');

      DS.find('user', 99); // should not trigger another http request
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    $httpBackend.flush();

    assert.equal(lifecycle.beforeCreate.callCount, 1, 'beforeCreate should have been called twice');
    assert.equal(lifecycle.afterCreate.callCount, 1, 'afterCreate should have been called twice');
    assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called twice');
    assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called twice');
    assert.equal(lifecycle.serialize.callCount, 1, 'serialize should have been called');
    assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
    assert.deepEqual(DS.get('user', 99).id, payload.id);
    assert.isObject(DS.get('user', 99).profile);
    assert.deepEqual(DS.get('profile', 999).id, 999);
    assert.isObject(DS.get('profile', 999).user);
  });
  it('should handle nested resources', function () {
    var testComment = {
      id: 5,
      content: 'test',
      approvedBy: 4
    };
    var testComment2 = {
      id: 6,
      content: 'test',
      approvedBy: 4
    };
    $httpBackend.expectPOST('http://test.angular-cache.com/user/4/comment').respond(200, testComment);

    DS.create('comment', {
      content: 'test',
      approvedBy: 4
    }).then(function (comment) {
      assert.deepEqual(angular.toJson(comment), angular.toJson(testComment));
      assert.deepEqual(angular.toJson(comment), angular.toJson(DS.get('comment', 5)));
    }, function () {
      fail('Should not have failed!');
    });

    $httpBackend.flush();
    $httpBackend.expectPOST('http://test.angular-cache.com/user/4/comment').respond(200, testComment2);

    DS.create('comment', {
      content: 'test'
    }, {
      params: {
        approvedBy: 4
      }
    }).then(function (comment) {
      assert.deepEqual(angular.toJson(comment), angular.toJson(testComment2));
      assert.deepEqual(angular.toJson(comment), angular.toJson(DS.get('comment', 6)));
    }, function () {
      fail('Should not have failed!');
    });

    $httpBackend.flush();
    $httpBackend.expectPOST('http://test.angular-cache.com/comment').respond(200, testComment2);

    DS.create('comment', {
      content: 'test',
      approvedBy: 4
    }, {
      params: {
        approvedBy: false
      }
    }).then(function (comment) {
      assert.deepEqual(angular.toJson(comment), angular.toJson(testComment2));
      assert.deepEqual(comment, DS.get('comment', 6));
    }, function () {
      fail('Should not have failed!');
    });
    $httpBackend.flush();
  });
  it('should find inverse links', function () {
    var organization = DS.inject('organization', {
      id: 77
    });

    $httpBackend.expectPOST('http://test.angular-cache.com/organization/77/user').respond(200, {
      organizationId: 77,
      id: 88
    });

    DS.create('user', {
      organizationId: 77,
      id: 88
    }, { upsert: false }).then(function (user) {
      assert.isArray(organization.users);
      assert.equal(1, organization.users.length);
      assert.isObject(user.organization);
      assert.isTrue(user.organization === organization);
      assert.isTrue(user === organization.users[0]);
    }, function () {
      fail('Should not have failed!');
    });

    $httpBackend.flush();
  });
  // Not yet implemented in js-data
  //it('should eager inject', function () {
  //  $httpBackend.expectPOST('http://test.angular-cache.com/organization/77/user').respond(200, {
  //    organizationId: 77,
  //    id: 88
  //  });
  //
  //  var eagerUser;
  //
  //  DS.create('user', {
  //    organizationId: 77
  //  }, { eagerInject: true }).then(function (user) {
  //    assert.equal(user.id, 88);
  //    assert.isTrue(eagerUser === user);
  //    assert.isTrue(DS.filter('user')[0] === user);
  //  }, function () {
  //    fail('Should not have succeeded!');
  //  });
  //
  //  $rootScope.$apply();
  //
  //  eagerUser = DS.filter('user')[0];
  //  assert.isDefined(eagerUser);
  //  assert.equal(eagerUser.organizationId, 77);
  //  assert.notEqual(eagerUser.id, 88);
  //
  //  $httpBackend.flush();
  //});
});
