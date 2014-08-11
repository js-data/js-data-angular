describe('DS.hasChanges(resourceName, id)', function () {
  function errorPrefix(resourceName, id) {
    return 'DS.hasChanges(' + resourceName + ', ' + id + '): ';
  }

  beforeEach(startInjector);

  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      DS.hasChanges('does not exist', {});
    }, DS.errors.NonexistentResourceError, errorPrefix('does not exist', {}) + 'does not exist is not a registered resource!');

    angular.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      assert.throws(function () {
        DS.hasChanges('post', key);
      }, DS.errors.IllegalArgumentError, errorPrefix('post', key) + 'id: Must be a string or a number!');
    });
  });
  it('should return false if the item is not in the store', function () {
    assert.isFalse(DS.hasChanges('post', 5));
  });
  it('should return whether an item has changes', function () {

    DS.inject('post', p1);

    assert.isFalse(DS.hasChanges('post', 5));

    var post = DS.get('post', 5);
    post.author = 'Jake';

    DS.digest();

    assert.isTrue(DS.hasChanges('post', 5));
  });
});
