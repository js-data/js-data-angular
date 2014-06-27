describe('DS.eject(resourceName, id)', function () {
  var errorPrefix = 'DS.eject(resourceName, id): ';

  beforeEach(startInjector);

  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      DS.eject('does not exist', 5);
    }, DS.errors.NonexistentResourceError, errorPrefix + 'does not exist is not a registered resource!');

    angular.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      assert.throws(function () {
        DS.eject('post', key);
      }, DS.errors.IllegalArgumentError, errorPrefix + 'id: Must be a string or a number!');
    });
  });
  it('should do nothing if the item is not in the store', function () {
    assert.equal(DS.lastModified('post', 5), 0);
    assert.doesNotThrow(function () {
      DS.eject('post', 5);
    });
    assert.equal(DS.lastModified('post', 5), 0);
  });
  it('should eject an item from the store', function () {
    DS.inject('post', p3);
    DS.inject('post', p2);
    DS.inject('post', p1);
    assert.notEqual(DS.lastModified('post', 5), 0);
    assert.doesNotThrow(function () {
      DS.eject('post', 5);
    });
    assert.isUndefined(DS.get('post', 5));
    assert.equal(DS.lastModified('post', 5), 0);
  });
});
