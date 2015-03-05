describe('DSHttpAdapter.destroy', function () {

  beforeEach(startInjector);

  it('should make a DELETE request', function () {
    $httpBackend.expectDELETE('http://test.angular-cache.com/posts/1').respond(200, 1);

    DSHttpAdapter.destroy(Post, 1).then(function (data) {
      assert.deepEqual(data, 1, 'post should have been deleted');
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    $httpBackend.flush();

    $httpBackend.expectDELETE('api2/posts/1').respond(200, 1);

    DSHttpAdapter.destroy(Post, 1, { basePath: 'api2' }).then(function (data) {
      assert.deepEqual(data, 1, 'post should have been deleted');
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    $httpBackend.flush();

    assert.equal(lifecycle.queryTransform.callCount, 2, 'queryTransform should have been called twice');
  });
});
