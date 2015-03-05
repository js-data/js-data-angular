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

    assert.equal(lifecycle.queryTransform.callCount, 2, 'queryTransform should have been called twice');
  });

  it('should error if the item is undefined', function () {
    $httpBackend.expectGET('http://test.angular-cache.com/posts/1').respond(200);

    DSHttpAdapter.find(Post, 1).then(function () {
      fail('should not have reached this');
    }).catch(function (err) {
      assert.equal(err.message, 'Not Found!');
      return true;
    });

    $httpBackend.flush();
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

  it('should use suffixes', function () {
    var Thing = DS.defineResource({
      name: 'thing',
      endpoint: 'things',
      suffix: '.xml'
    });

    DSHttpAdapter.defaults.suffix = '.json';

    $httpBackend.expectGET('http://test.angular-cache.com/things/1.xml').respond(200, { id: 1 });

    DSHttpAdapter.find(Thing, 1);

    $httpBackend.expectGET('http://test.angular-cache.com/posts/1.json').respond(200, { id: 1 });

    DSHttpAdapter.find(Post, 1);

    $httpBackend.flush();

    DSHttpAdapter.defaults.suffix = '';
  });
});
