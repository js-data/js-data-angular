describe('DSHttpAdapter.find', function () {

  beforeEach(startInjector);

  it('should make a GET request', function () {
    $httpBackend.expectGET('http://test.angular-cache.com/posts/1').respond(200, p1);

    DSHttpAdapter.find(Post, 1).then(function (data) {
      assert.deepEqual(data, p1, 'post should have been found');
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    $httpBackend.flush();

    $httpBackend.expectGET('api2/posts/1').respond(200, p1);

    DSHttpAdapter.find(Post, 1, { basePath: 'api2' }).then(function (data) {
      assert.deepEqual(data, p1, 'post should have been found');
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    $httpBackend.flush();

    assert.equal(lifecycle.queryTransform.callCount, 0, 'queryTransform should not have been called');
  });

  it('should use default configs', function () {
    $httpBackend.expectGET('http://test.angular-cache.com/posts/1?test=test', {
      Authorization: 'test',
      Accept: 'application/json, text/plain, */*'
    }).respond(200, p1);

    DSHttpAdapter.defaults.httpConfig.params = { test: 'test' };
    DSHttpAdapter.defaults.httpConfig.headers = { Authorization: 'test' };

    DSHttpAdapter.find(Post, 1).then(function (data) {
      assert.deepEqual(data, p1, 'post should have been found');
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    $httpBackend.flush();

    delete DSHttpAdapter.defaults.httpConfig.params;
    delete DSHttpAdapter.defaults.httpConfig.headers;
  });
});
