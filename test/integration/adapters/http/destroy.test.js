describe('DSHttpAdapter.destroy(resourceConfig, id, options)', function () {

  beforeEach(startInjector);

  it('should make a DELETE request', function () {
    $httpBackend.expectDELETE('api/posts/1').respond(200, 1);

    DSHttpAdapter.destroy({
      baseUrl: 'api',
      endpoint: 'posts',
      getEndpoint: function () {
        return 'posts';
      }
    }, 1).then(function (data) {
      assert.deepEqual(data.data, 1, 'post should have been deleted');
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    $httpBackend.flush();

    $httpBackend.expectDELETE('api2/posts/1').respond(200, 1);

    DSHttpAdapter.destroy({
      baseUrl: 'api',
      endpoint: 'posts',
      getEndpoint: function () {
        return 'posts';
      }
    }, 1, { baseUrl: 'api2' }).then(function (data) {
      assert.deepEqual(data.data, 1, 'post should have been deleted');
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    $httpBackend.flush();

    assert.equal(lifecycle.queryTransform.callCount, 0, 'queryTransform should not have been called');
  });
});
