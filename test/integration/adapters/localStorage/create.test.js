describe('DSLocalStorageAdapter.create(resourceConfig, attrs, options)', function () {

  beforeEach(startInjector);

  it('should create an item in localStorage', function (done) {
    DSLocalStorageAdapter.create(Post, p1).then(function (post) {
      assert.deepEqual(post, p1, 'post should have been created');
      return DSLocalStorageAdapter.find(Post, p1.id);
    }).then(function (post) {
      assert.deepEqual(angular.toJson(post), angular.toJson(p1));
      return DSLocalStorageAdapter.destroy(Post, p1.id);
    }).then(function () {
      return DSLocalStorageAdapter.find(Post, p1.id);
    }).then(function () {
      done('Should not have reached this!');
    }).catch(function (err) {
      assert.equal(err.message, 'Not Found!');
      done();
    });

    $rootScope.$apply();
  });
});
