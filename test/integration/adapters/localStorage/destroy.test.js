describe('DSLocalStorageAdapter.destroy(resourceConfig, id, options)', function () {

  beforeEach(startInjector);

  it('should destroy an item from localStorage', function (done) {
    var path = DSUtils.makePath('api', 'posts', 1);

    localStorage.setItem(path, angular.toJson(p1));

    assert.deepEqual(angular.fromJson(localStorage.getItem(path)), p1, 'p1 should be in localStorage');

    DSLocalStorageAdapter.destroy({
      baseUrl: 'api',
      endpoint: 'posts',
      getEndpoint: function () {
        return 'posts';
      }
    }, 1).then(function () {
      assert.isNull(localStorage.getItem(path), 'the item should be gone from localStorage');

      path = DSUtils.makePath('api2', 'posts', 1);
      localStorage.setItem(path, angular.toJson(p2));
      assert.deepEqual(angular.fromJson(localStorage.getItem(path)), p2);

      DSLocalStorageAdapter.destroy({
        baseUrl: 'api',
        endpoint: 'posts',
        getEndpoint: function () {
          return 'posts';
        }
      }, 1, { baseUrl: 'api2' }).then(function () {
        assert.isNull(localStorage.getItem(path), 'the item should be gone from localStorage');
        done();
      }, function (err) {
        console.error(err.stack);
        fail('should not have rejected');
      });

      $rootScope.$apply();
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    $rootScope.$apply();
  });
});
