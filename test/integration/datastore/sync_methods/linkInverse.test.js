describe('DS.linkInverse(resourceName, id[, relations])', function () {
  function errorPrefix(resourceName) {
    return 'DS.linkInverse(' + resourceName + ', id[, relations]): ';
  }

  beforeEach(startInjector);

  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      DS.linkInverse('does not exist', {});
    }, DS.errors.NonexistentResourceError, errorPrefix('does not exist') + 'does not exist is not a registered resource!');

    angular.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      assert.throws(function () {
        DS.linkInverse('post', key);
      }, DS.errors.IllegalArgumentError, errorPrefix('post') + 'id: Must be a string or a number!');
    });
  });
  it('should find inverse links', function () {
    DS.inject('user', { organizationId: 5, id: 1 });
    DS.inject('organization', { id: 5 });
    DS.inject('comment', { userId: 1, id: 23 });
    DS.inject('comment', { userId: 1, id: 44 });

    // link user to its relations
    DS.linkInverse('user', 1, ['organization']);

    assert.isArray(DS.get('organization', 5).users);
    assert.equal(1, DS.get('organization', 5).users.length);

    // link user to all of its all relations
    DS.linkInverse('user', 1);

    assert.isObject(DS.get('comment', 23).user);
    assert.isObject(DS.get('comment', 44).user);
  });
});
