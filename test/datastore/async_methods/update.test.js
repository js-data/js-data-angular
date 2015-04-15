describe('DS.update', function () {
  beforeEach(startInjector);

  it('should update an item', function () {
    $httpBackend.expectPUT('http://test.angular-cache.com/posts/5').respond(200, { author: 'Jake', age: 30, id: 5 });

    var post = DS.inject('post', p1);

    var initialModified = DS.lastModified('post', 5);
    var initialSaved = DS.lastSaved('post', 5);

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
      assert.deepEqual(angular.toJson(p), angular.toJson(DS.get('post', 6)));
      assert.deepEqual(angular.toJson(p), angular.toJson({ author: 'Jane', age: 31, id: 6 }));
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
  it('should update an item via the instance method', function () {
    $httpBackend.expectPUT('http://test.angular-cache.com/posts/5').respond(200, { author: 'Jake', age: 30, id: 5 });

    var post = DS.inject('post', p1);

    var initialModified = DS.lastModified('post', 5);
    var initialSaved = DS.lastSaved('post', 5);

    post.DSUpdate({ author: 'Jake' }).then(function (p) {
      assert.deepEqual(angular.toJson(p), angular.toJson(post), 'post 5 should have been updated');
      assert.equal(p.author, 'Jake');
      assert.equal(post.author, 'Jake');
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    $httpBackend.flush();

    assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
    assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
    assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called');
    assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called');
    assert.equal(lifecycle.serialize.callCount, 1, 'serialize should have been called');
    assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
    assert.deepEqual(DS.get('post', 5), post);
    assert.notEqual(DS.lastModified('post', 5), initialModified);
    assert.notEqual(DS.lastSaved('post', 5), initialSaved);
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
      assert.deepEqual(angular.toJson(comment), angular.toJson(testComment));
      assert.deepEqual(angular.toJson(comment), angular.toJson(DS.get('comment', 5)));
    }, function () {
      fail('Should not have failed!');
    });

    $httpBackend.flush();

    $httpBackend.expectPUT('http://test.angular-cache.com/user/4/comment/6', { content: 'stuff', other: 'stuff' }).respond(200, testComment2);

    var comment = DS.inject('comment', testComment2);

    function onBeforeUpdate(resource, attrs) {
      try {
        attrs.other = 'stuff';
        assert.equal(angular.toJson(attrs), angular.toJson({ content: 'stuff', other: 'stuff' }));
      } catch (e) {
        console.log(e.stack);
      }
    }

    function onAfterUpdate(resource, attrs) {
      try {
        assert.deepEqual(angular.toJson(attrs), angular.toJson(testComment2));
        assert.isFalse(testComment2 === attrs);
      } catch (e) {
        console.log(e.stack);
      }
    }

    Comment.on('DS.beforeUpdate', onBeforeUpdate);
    Comment.on('DS.afterUpdate', onAfterUpdate);

    Comment.update(comment, {
      content: 'stuff'
    }, {
      params: {
        approvedBy: 4
      }
    }).then(function (comment) {
      try {
        assert.deepEqual(angular.toJson(comment), angular.toJson(testComment2));
        assert.deepEqual(angular.toJson(comment), angular.toJson(DS.get('comment', 6)));
      } catch (e) {
        console.log(e.stack);
      }
    }, function () {
      fail('Should not have failed!');
    });

    $httpBackend.flush();

    $httpBackend.expectPUT('http://test.angular-cache.com/comment/6').respond(200, testComment2);

    DS.inject('comment', testComment2);

    DS.update('comment', 6, {
      content: 'stuff'
    }, {
      params: {
        approvedBy: false
      }
    }).then(function (comment) {
      try {
        assert.deepEqual(angular.toJson(comment), angular.toJson(testComment2));
        assert.deepEqual(angular.toJson(comment), angular.toJson(DS.get('comment', 6)));
      } catch (e) {
        console.log(e.stack);
      }
    }, function () {
      fail('Should not have failed!');
    });

    $httpBackend.flush();
  });
});
