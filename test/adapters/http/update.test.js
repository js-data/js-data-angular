describe('DSHttpAdapter.update', function () {

  beforeEach(startInjector);

  it('should make a PUT request', function () {
    $httpBackend.expectPUT('http://test.angular-cache.com/posts/1', {
      author: 'John',
      age: 30
    }).respond(200, p1);

    DSHttpAdapter.update(Post, 1, { author: 'John', age: 30 }).then(function (data) {
      assert.deepEqual(data, p1, 'post 5 should have been updated');
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    $httpBackend.flush();

    $httpBackend.expectPUT('api2/posts/1', {
      author: 'John',
      age: 30
    }).respond(200, p1);

    DSHttpAdapter.update(Post, 1, { author: 'John', age: 30 }, { basePath: 'api2' }).then(function (data) {
      assert.deepEqual(data, p1, 'post 5 should have been updated');
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    $httpBackend.flush();

    assert.equal(lifecycle.queryTransform.callCount, 2, 'queryTransform should have been called twice');
  });
});
