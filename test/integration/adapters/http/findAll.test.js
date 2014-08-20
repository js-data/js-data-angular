describe('DSHttpAdapter.findAll(resourceConfig, params, options)', function () {

  beforeEach(startInjector);

  it('should make a GET request', function () {
    $httpBackend.expectGET('api/posts').respond(200, [p1]);

    DSHttpAdapter.findAll({
      baseUrl: 'api',
      endpoint: 'posts',
      getEndpoint: function () {
        return 'posts';
      }
    }, {}).then(function (data) {
      assert.deepEqual(data.data, [p1], 'posts should have been found');
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    $httpBackend.flush();

    $httpBackend.expectGET('api2/posts?where=%7B%22author%22:%7B%22%3D%3D%22:%22John%22%7D%7D').respond(200, [p1]);

    DSHttpAdapter.findAll({
      baseUrl: 'api',
      endpoint: 'posts',
      getEndpoint: function () {
        return 'posts';
      }
    }, {
      where: {
        author: {
          '==': 'John'
        }
      }
    }, { baseUrl: 'api2' }).then(function (data) {
      assert.deepEqual(data.data, [p1], 'posts should have been found');
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    $httpBackend.flush();

    assert.equal(lifecycle.queryTransform.callCount, 2, 'queryTransform should have been called');
  });
});
