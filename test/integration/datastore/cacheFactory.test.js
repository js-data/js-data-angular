describe('$cacheFactory integration', function () {

  beforeEach(startInjector);

  it('should use $cacheFactory when DSCacheFactory is not available', function (done) {
    DS.defineResource({
      name: 'comment',
      endpoint: '/comments',
      deleteOnExpire: 'passive',
      maxAge: 20
    });

    var cache = DS.cacheFactory.get('DS.comment');

    assert.equal(typeof DS.cacheFactory.touch, 'undefined', 'should not be using DSCacheFactory');

    $httpBackend.expectGET('http://test.angular-cache.com/comments/5').respond(200, {
      id: 5,
      text: 'test'
    });

    DS.find('comment', 5).then(function (comment) {
      assert.deepEqual(comment, {
        id: 5,
        text: 'test'
      });
      assert.deepEqual(cache.get(5), comment, 'should be in the cache');
    }, function (err) {
      console.error(err.stack);
      fail('Should not have rejected!');
    });

    $httpBackend.flush();

    assert.deepEqual(DS.get('comment', 5), {
      id: 5,
      text: 'test'
    }, 'The comment is now in the store');
    assert.isNumber(DS.lastModified('comment', 5));
    assert.isNumber(DS.lastSaved('comment', 5));

    setTimeout(function () {
      assert.deepEqual(cache.get(5), {
        id: 5,
        text: 'test'
      }, 'should be in the cache');

      assert.equal(lifecycle.beforeInject.callCount, 1, 'beforeInject should have been called');
      assert.equal(lifecycle.afterInject.callCount, 1, 'afterInject should have been called');
      assert.equal(lifecycle.serialize.callCount, 0, 'serialize should have been called');
      assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');

      done();
    }, 100);
  });
});
