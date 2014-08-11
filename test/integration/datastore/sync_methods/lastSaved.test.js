describe('DS.lastSaved(resourceName[, id])', function () {
  function errorPrefix(resourceName, id) {
    return 'DS.lastSaved(' + resourceName + '[, ' + id + ']): ';
  }

  beforeEach(startInjector);

  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      DS.lastSaved('does not exist', {});
    }, DS.errors.NonexistentResourceError, errorPrefix('does not exist', {}) + 'does not exist is not a registered resource!');

    angular.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      if (key) {
        assert.throws(function () {
          DS.lastSaved('post', key);
        }, DS.errors.IllegalArgumentError, errorPrefix('post', key) + 'id: Must be a string or a number!');
      }
    });
  });
  it('should lastSaved an item into the store', function () {

    var lastSaved = DS.lastSaved('post', 5);
    assert.equal(DS.lastSaved('post', 5), 0);

    assert.doesNotThrow(function () {
      DS.inject('post', p1);
    });

    assert.notEqual(lastSaved, DS.lastSaved('post', 5));

    lastSaved = DS.lastSaved('post', 5);

    $httpBackend.expectPUT('http://test.angular-cache.com/posts/5').respond(200, p1);

    var post = DS.get('post', 5);

    post.author = 'Jake';

    DS.save('post', 5);

    $httpBackend.flush();

    assert.notEqual(lastSaved, DS.lastSaved('post', 5));
  });
});
