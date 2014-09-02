describe('DS.eject(resourceName, id)', function () {
  function errorPrefix(resourceName, id) {
    return 'DS.eject(' + resourceName + ', ' + id + '): ';
  }

  beforeEach(startInjector);

  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      DS.eject('does not exist', 5);
    }, DS.errors.NonexistentResourceError, errorPrefix('does not exist', 5) + 'does not exist is not a registered resource!');

    angular.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      assert.throws(function () {
        DS.eject('post', key);
      }, DS.errors.IllegalArgumentError, errorPrefix('post', key) + 'id: Must be a string or a number!');
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
  it('should unlink upon ejection', function () {
    DS.inject('user', user10, 0);
    DS.inject('organization', organization15);
    DS.inject('comment', comment19);
    DS.inject('profile', profile21);

    // user10 relations
    assert.isArray(DS.get('user', 10).comments);
    DS.eject('comment', 11);
    assert.isUndefined(DS.get('comment', 11));
    assert.equal(DS.get('user', 10).comments.length, 2);
    DS.eject('comment', 12);
    assert.isUndefined(DS.get('comment', 12));
    assert.equal(DS.get('user', 10).comments.length, 1);
    DS.eject('comment', 13);
    assert.isUndefined(DS.get('comment', 13));
    assert.equal(DS.get('user', 10).comments.length, 0);
    DS.eject('organization', 14);
    assert.isUndefined(DS.get('organization', 14));
    assert.isUndefined(DS.get('user', 10).organization);

    // organization15 relations
    assert.isArray(DS.get('organization', 15).users);
    DS.eject('user', 16);
    assert.isUndefined(DS.get('user', 16));
    assert.equal(DS.get('organization', 15).users.length, 2);
    DS.eject('user', 17);
    assert.isUndefined(DS.get('user', 17));
    assert.equal(DS.get('organization', 15).users.length, 1);
    DS.eject('user', 18);
    assert.isUndefined(DS.get('user', 18));
    assert.equal(DS.get('organization', 15).users.length, 0);

    // comment19 relations
    assert.deepEqual(DS.get('user', 20), DS.get('comment', 19).user);
    assert.deepEqual(DS.get('user', 19), DS.get('comment', 19).approvedByUser);
    DS.eject('user', 20);
    assert.isUndefined(DS.get('comment', 19).user);
    DS.eject('user', 19);
    assert.isUndefined(DS.get('comment', 19).approvedByUser);

    // profile21 relations
    assert.deepEqual(DS.get('user', 22), DS.get('profile', 21).user);
    DS.eject('user', 22);
    assert.isUndefined(DS.get('profile', 21).user);
  });
});
