describe('DSHttpAdapter.create(resourceConfig, attrs, options)', function () {

  beforeEach(startInjector);

  it('should make a POST request', function () {
    $httpBackend.expectPOST('api/posts', {
      author: 'John',
      age: 30
    }).respond(200, p1);

    DSHttpAdapter.create({
      baseUrl: 'api',
      endpoint: 'posts',
      getEndpoint: function () {
        return 'posts';
      }
    }, { author: 'John', age: 30 }).then(function (data) {
      assert.deepEqual(data.data, p1, 'post should have been created');
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    $httpBackend.flush();

    $httpBackend.expectPOST('api2/posts', {
      author: 'John',
      age: 30
    }).respond(200, p1);

    DSHttpAdapter.create({
      baseUrl: 'api',
      endpoint: 'posts',
      getEndpoint: function () {
        return 'posts';
      }
    }, { author: 'John', age: 30 }, { baseUrl: 'api2' }).then(function (data) {
      assert.deepEqual(data.data, p1, 'post should have been created');
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    $httpBackend.flush();

    assert.equal(lifecycle.queryTransform.callCount, 0, 'queryTransform should not have been called');
  });
});
