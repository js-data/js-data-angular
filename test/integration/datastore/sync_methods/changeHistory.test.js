describe('DS.changeHistory(resourceName, id)', function () {
  function errorPrefix(resourceName) {
    return 'DS.changeHistory(' + resourceName + ', id): ';
  }

  beforeEach(startInjector);

  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      DS.changeHistory('does not exist', {});
    }, DS.errors.NonexistentResourceError, errorPrefix('does not exist') + 'does not exist is not a registered resource!');

    angular.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      if (key) {
        assert.throws(function () {
          DS.changeHistory('post', key);
        }, DS.errors.IllegalArgumentError, errorPrefix('post') + 'id: Must be a string or a number!');
      }
    });
  });
  it('should return false if the item is not in the store', function () {
    assert.isUndefined(DS.changeHistory('post', 5));
  });
  it('should return the changeHistory in an object', function (done) {
    Post.inject(p1);

    var initialModified = Post.lastModified(5);
    assert.deepEqual(DS.changeHistory('post', 5), [
      {resourceName: 'post', added: {}, changed: {}, removed: {}, timestamp: Post.lastModified(5), target: DS.get('post', 5)}
    ]);

    var post = DS.get('post', 5);
    post.author = 'Jake';

    DS.digest();

    setTimeout(function () {
      try {
        DS.digest();
        assert.deepEqual(DS.changeHistory('post', 5), [
          {resourceName: 'post', added: {}, changed: {}, removed: {}, timestamp: initialModified, target: DS.get('post', 5)},
          {resourceName: 'post', added: {}, changed: { author: 'Jake' }, removed: {}, timestamp: DS.store['post'].modified[5], target: DS.get('post', 5)}
        ]);


        DS.inject('post', p1);
        initialModified = Post.lastModified(5);
        assert.deepEqual(DS.changeHistory('post', 5), [
          {resourceName: 'post', added: {}, changed: { author: 'John' }, removed: {}, timestamp: Post.lastModified(5), target: DS.get('post', 5)}
        ]);
        var post = DS.get('post', 5);
        post.author = 'Johnny';

        DS.digest();

        setTimeout(function () {
          try {
            DS.digest();
            assert.deepEqual(DS.changeHistory('post', 5), [
              {resourceName: 'post', added: {}, changed: { author: 'John' }, removed: {}, timestamp: initialModified, target: DS.get('post', 5)},
              {resourceName: 'post', added: {}, changed: { author: 'Johnny' }, removed: {}, timestamp: Post.lastModified(5), target: DS.get('post', 5)}
            ]);
            done();
          } catch (err) {
            done(err);
          }
        }, 30);
      } catch (err) {
        done(err);
      }
    }, 30);
  });
});
