describe('DSHttpAdapter.update(resourceConfig, id, attrs, options)', function () {

  beforeEach(startInjector);

  it('should make a PUT request', function () {
    $httpBackend.expectPUT('api/posts/1', {
      author: 'John',
      age: 30
    }).respond(200, p1);

    DSHttpAdapter.update({
      baseUrl: 'api',
      endpoint: 'posts',
      getEndpoint: function () {
        return 'posts';
      }
    }, 1, { author: 'John', age: 30 }).then(function (data) {
      assert.deepEqual(data.data, p1, 'post 5 should have been updated');
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    $httpBackend.flush();

    $httpBackend.expectPUT('api2/posts/1', {
      author: 'John',
      age: 30
    }).respond(200, p1);

    DSHttpAdapter.update({
      baseUrl: 'api',
      endpoint: 'posts',
      getEndpoint: function () {
        return 'posts';
      }
    }, 1, { author: 'John', age: 30 }, { baseUrl: 'api2' }).then(function (data) {
      assert.deepEqual(data.data, p1, 'post 5 should have been updated');
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    $httpBackend.flush();

    assert.equal(lifecycle.queryTransform.callCount, 0, 'queryTransform should not have been called');
  });
});
