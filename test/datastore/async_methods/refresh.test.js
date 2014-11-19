describe('DS.refresh', function () {
  beforeEach(startInjector);
  it('should get an item from the server', function () {

    // Should do nothing because the data isn't in the store
    DS.refresh('post', 5).then(function (post) {
      assert.isUndefined(post);
    });

    assert.isUndefined(DS.get('post', 5), 'The post should not be in the store yet');

    DS.inject('post', p1);
    assert.deepEqual(angular.toJson(DS.get('post', 5)), angular.toJson(p1), 'The post is now in the store');

    var initialLastModified = DS.lastModified('post', 5);

    $httpBackend.expectGET('http://test.angular-cache.com/posts/5').respond(200, { author: 'John', age: 31, id: 5 });

    // Should refresh the item that's in the store
    DS.refresh('post', 5).then(function (post) {
      assert.deepEqual(angular.toJson(post), angular.toJson({ author: 'John', age: 31, id: 5 }));
    }, function (err) {
      console.error(err.stack);
      fail('Should not have rejected!');
    });

    // Should have no effect because the request is already pending
    DS.refresh('post', 5).then(function (post) {
      assert.deepEqual(angular.toJson(post), angular.toJson({ author: 'John', age: 31, id: 5 }));
    }, function (err) {
      console.error(err.stack);
      fail('Should not have rejected!');
    });

    $httpBackend.flush();

    assert.deepEqual(angular.toJson(DS.get('post', 5)), angular.toJson({
      author: 'John',
      age: 31,
      id: 5
    }), 'The post has been refreshed');
    assert.notEqual(DS.lastModified('post', 5), initialLastModified);
  });
});
