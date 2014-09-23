describe('DSLocalStorageAdapter.update(resourceConfig, id, attrs, options)', function () {

  beforeEach(startInjector);

  it('should update an item in localStorage', function (done) {
    DSLocalStorageAdapter.create(Post, p1).then(function (post) {
      assert.deepEqual(post, p1, 'post should have been created');
      return DSLocalStorageAdapter.update(Post, p1.id, { author: 'Johnny' });
    }).then(function (post) {
      assert.equal(post.author, 'Johnny');
      return DSLocalStorageAdapter.find(Post, p1.id);
    }).then(function (post) {
      assert.equal(post.author, 'Johnny');
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
