describe('DSLocalStorageAdapter.destroyAll(resourceConfig, params, options)', function () {

  beforeEach(startInjector);

  it('should destroy items in localStorage', function (done) {
    DSLocalStorageAdapter.create(Post, p1).then(function (post) {
      assert.deepEqual(post, p1, 'post should have been created');
      return DSLocalStorageAdapter.findAll(Post, {
        author: 'John'
      });
    }).then(function (posts) {
      assert.equal(posts.length, 1);
      assert.deepEqual(angular.toJson(posts[0]), angular.toJson(p1));
      return DSLocalStorageAdapter.destroyAll(Post, {
        author: 'John'
      });
    }).then(function () {
      return DSLocalStorageAdapter.findAll(Post, {
        author: 'John'
      });
    }).then(function (destroyedPosts) {
      assert.equal(destroyedPosts.length, 0);
      done();
    }).catch(done);

    $rootScope.$apply();
  });
});
