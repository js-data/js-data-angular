describe('DS.save', function () {
  beforeEach(startInjector);

  it('should save an item to the server and inject the result', function (done) {
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

    setTimeout(function () {
      try {
        $httpBackend.flush();

        setTimeout(function () {
          try {
            assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
            assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
            assert.deepEqual(angular.toJson(DS.get('post', 5)), angular.toJson({
              author: 'Jake',
              age: 30,
              id: 5
            }));
            DS.digest();
            assert.notEqual(DS.lastModified('post', 5), initialModified);
            assert.notEqual(DS.lastSaved('post', 5), initialSaved);

            DS.save('post', 6).then(function () {
              fail('should not have succeeded');
            }, function (err) {
              assert.isTrue(err instanceof DS.errors.RuntimeError);
              assert.equal(err.message, errorPrefix('post', 6) + 'id: "6" not found!');
            });

            assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called');
            assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called');
            assert.equal(lifecycle.serialize.callCount, 1, 'serialize should have been called');
            assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
            done();
          } catch (e) {
            done(e);
          }
        });
      } catch (e) {
        done(e);
      }
    }, 30);
  });
  it('should save an item to the server and inject the result when using a custom http method', function (done) {
    $httpBackend.expectPATCH('http://test.angular-cache.com/posts/5').respond(200, {
      author: 'Jake',
      id: 5,
      age: 30
    });

    DS.inject('post', p1);

    DS.get('post', 5).author = 'Jake';

    DS.save('post', 5, { method: 'PATCH' }).then(function (post) {
      assert.deepEqual(post, DS.get('post', 5), 'post 5 should have been saved');
      assert.equal(post.author, 'Jake');
      done();
    }, function (err) {
      console.error(err.stack);
      done('should not have rejected');
    });

    setTimeout(function () {
      $httpBackend.flush();
    }, 30);
  });
  it('should save an item to the server and inject the result via the instance method', function (done) {
    $httpBackend.expectPUT('http://test.angular-cache.com/posts/5').respond(200, {
      author: 'Jake',
      id: 5,
      age: 30
    });

    DS.inject('post', p1);

    var initialModified = DS.lastModified('post', 5);
    var initialSaved = DS.lastSaved('post', 5);

    DS.get('post', 5).author = 'Jake';

    DS.get('post', 5).DSSave().then(function (post) {
      assert.deepEqual(post, DS.get('post', 5), 'post 5 should have been saved');
      assert.equal(post.author, 'Jake');
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    setTimeout(function () {
      $httpBackend.flush();

      setTimeout(function () {
        try {
          assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
          assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
          assert.deepEqual(angular.toJson(DS.get('post', 5)), angular.toJson({
            author: 'Jake',
            age: 30,
            id: 5
          }));
          DS.digest();
          assert.notEqual(DS.lastModified('post', 5), initialModified);
          assert.notEqual(DS.lastSaved('post', 5), initialSaved);
          done();
        } catch (err) {
          done(err);
        }
      }, 30);
    }, 30);
  });
  it('should save an item to the server but not inject the result', function (done) {
    $httpBackend.expectPUT('http://test.angular-cache.com/posts/5').respond(200, {
      random: 'stuff'
    });

    DS.inject('post', p1);

    var initialSaved = DS.lastSaved('post', 5);

    DS.get('post', 5).author = 'Jake';

    $rootScope.$apply();

    var initialModified = 0;

    DS.save('post', 5, { cacheResponse: false }).then(function (post) {
      try {
        assert.deepEqual(post, {
          random: 'stuff'
        }, 'should have the right response');
        assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
        assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
        assert.equal(lifecycle.beforeInject.callCount, 1, 'beforeInject should have been called only once');
        assert.equal(lifecycle.afterInject.callCount, 1, 'afterInject should have been called only once');
        assert.deepEqual(angular.toJson(DS.get('post', 5)), angular.toJson({
          author: 'Jake',
          age: 30,
          id: 5
        }));
        assert.equal(DS.lastSaved('post', 5), initialSaved);
        done();
      } catch (err) {
        done(err);
      }
    }, function (err) {
      console.error(err.stack);
      done('should not have rejected');
    });

    setTimeout(function () {
      try {
        initialModified = DS.lastModified('post', 5);
        $httpBackend.flush();
      } catch (e) {
        done(e);
      }
    }, 30);
  });
  it('should save changes of an item to the server', function (done) {
    $httpBackend.expectPUT('http://test.angular-cache.com/posts/5', { author: 'Jake' }).respond(200, {
      author: 'Jake',
      id: 5,
      age: 30
    });

    DS.inject('post', p1);

    var initialModified = DS.lastModified('post', 5);
    var initialSaved = DS.lastSaved('post', 5);
    var post1 = DS.get('post', 5);

    post1.author = 'Jake';

    DS.save('post', 5, { changesOnly: true }).then(function (post) {
      assert.deepEqual(angular.toJson(post), angular.toJson(post1), 'post 5 should have been saved');
      assert.equal(post.author, 'Jake');
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    setTimeout(function () {
      try {
        $httpBackend.flush();

        setTimeout(function () {
          try {
            assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
            assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
            assert.deepEqual(angular.toJson(DS.get('post', 5)), angular.toJson(post1));
            assert.notEqual(DS.lastModified('post', 5), initialModified);
            assert.notEqual(DS.lastSaved('post', 5), initialSaved);

            DS.save('post', 6).then(function () {
              fail('should not have succeeded');
            }, function (err) {
              assert.isTrue(err instanceof DS.errors.RuntimeError);
              assert.equal(err.message, 'id: "6" not found!');
            });

            assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called');
            assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called');
            assert.equal(lifecycle.serialize.callCount, 1, 'serialize should have been called');
            assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');

            done();
          } catch (e) {
            done(e);
          }
        }, 30);
      } catch (e) {
        done(e);
      }
    }, 30);
  });
});
