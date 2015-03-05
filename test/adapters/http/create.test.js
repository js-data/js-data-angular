describe('DSHttpAdapter.create', function () {

  beforeEach(startInjector);

  it('should make a POST request', function () {
    $httpBackend.expectPOST('http://test.angular-cache.com/posts', {
      author: 'John',
      age: 30
    }).respond(200, p1);

    DSHttpAdapter.create(Post, { author: 'John', age: 30 }).then(function (data) {
      assert.deepEqual(data, p1, 'post should have been created');
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    $httpBackend.flush();

    $httpBackend.expectPOST('api2/posts', {
      author: 'John',
      age: 30
    }).respond(200, p1);

    DSHttpAdapter.create(Post, { author: 'John', age: 30 }, { basePath: 'api2' }).then(function (data) {
      assert.deepEqual(data, p1, 'post should have been created');
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    $httpBackend.flush();

    assert.equal(lifecycle.queryTransform.callCount, 2, 'queryTransform should have been called twice');
  });
});
