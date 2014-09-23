describe('$cacheFactory integration', function () {

  beforeEach(startInjector);

  it('should use $cacheFactory when DSCacheFactory is not available', function (done) {
    DS.defineResource({
      name: 'Comment',
      endpoint: '/comments',
      deleteOnExpire: 'passive',
      maxAge: 20
    });

    var cache = DS.cacheFactory.get('DS.Comment');

    assert.equal(typeof DS.cacheFactory.touch, 'undefined', 'should not be using DSCacheFactory');

    $httpBackend.expectGET('http://test.angular-cache.com/comments/5').respond(200, {
      id: 5,
      text: 'test'
    });

    DS.find('Comment', 5).then(function (comment) {
      assert.deepEqual(angular.toJson(comment), angular.toJson({
        id: 5,
        text: 'test'
      }));
      assert.deepEqual(angular.toJson(cache.get(5)), angular.toJson(comment), 'should be in the cache');
    }, function (err) {
      console.error(err.stack);
      fail('Should not have rejected!');
    });

    $httpBackend.flush();

    assert.deepEqual(angular.toJson(DS.get('Comment', 5)), angular.toJson({
      id: 5,
      text: 'test'
    }), 'The comment is now in the store');
    assert.isNumber(DS.lastModified('Comment', 5));
    assert.isNumber(DS.lastSaved('Comment', 5));

    setTimeout(function () {
      assert.deepEqual(angular.toJson(cache.get(5)), angular.toJson({
        id: 5,
        text: 'test'
      }), 'should be in the cache');

      assert.equal(lifecycle.beforeInject.callCount, 1, 'beforeInject should have been called');
      assert.equal(lifecycle.afterInject.callCount, 1, 'afterInject should have been called');
      assert.equal(lifecycle.serialize.callCount, 0, 'serialize should have been called');
      assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');

      done();
    }, 100);
  });
});
