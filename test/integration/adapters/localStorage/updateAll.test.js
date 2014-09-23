describe('DSLocalStorageAdapter.updateAll(resourceConfig, attrs, params, options)', function () {

  beforeEach(startInjector);

  it('should update items in localStorage', function (done) {
    DSLocalStorageAdapter.create(Post, p1).then(function (post) {
      assert.deepEqual(post, p1, 'post should have been created');
      return DSLocalStorageAdapter.updateAll(Post, {
        author: 'Johnny'
      }, {
        author: 'John'
      });
    }).then(function (posts) {
      assert.equal(posts.length, 1);
      assert.equal(posts[0].author, 'Johnny');
      return DSLocalStorageAdapter.findAll(Post, {
        author: 'Johnny'
      });
    }).then(function (posts) {
      assert.equal(posts.length, 1);
      assert.equal(posts[0].author, 'Johnny');
      return DSLocalStorageAdapter.destroy(Post, p1.id);
    }).then(function () {
      return DSLocalStorageAdapter.findAll(Post, {
        author: 'Johnny'
      });
    }).then(function (destroyedPosts) {
      assert.equal(destroyedPosts.length, 0);
      done();
    }).catch(done);

    $rootScope.$apply();
  });
});
