describe('DS.inject(resourceName, attrs[, options])', function () {
  var errorPrefix = 'DS.inject(resourceName, attrs[, options]): ';

  beforeEach(startInjector);

  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      DS.inject('does not exist', {});
    }, DS.errors.NonexistentResourceError, errorPrefix + 'does not exist is not a registered resource!');

    angular.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      assert.throws(function () {
        DS.inject('post', key);
      }, DS.errors.IllegalArgumentError, errorPrefix + 'attrs: Must be an object or an array!');
    });

    angular.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (key) {
        assert.throws(function () {
          DS.inject('post', {}, key);
        }, DS.errors.IllegalArgumentError, errorPrefix + 'options: Must be an object!');
      }
    });

    assert.throws(function () {
      DS.inject('post', {});
    }, DS.errors.RuntimeError, errorPrefix + 'attrs: Must contain the property specified by `idAttribute`!');
  });
  it('should inject an item into the store', function () {

    assert.equal(DS.lastModified('post', 5), 0);
    assert.doesNotThrow(function () {
      assert.deepEqual(DS.inject('post', p1), p1);
    });
    assert.notEqual(DS.lastModified('post', 5), 0);
    assert.isNumber(DS.lastModified('post', 5));
  });
  it('should get mad when primary keys are changed', function (done) {

    assert.equal(DS.lastModified('post', 5), 0);
    assert.doesNotThrow(function () {
      assert.deepEqual(DS.inject('post', p1), p1);
    });
    assert.notEqual(DS.lastModified('post', 5), 0);
    assert.isNumber(DS.lastModified('post', 5));

    var post = DS.get('post', 5);

    post.id = 10;

    DS.digest();

    setTimeout(function () {
      assert.deepEqual('Doh! You just changed the primary key of an object! ' +
        'I don\'t know how to handle this yet, so your data for the "post' +
        '" resource is now in an undefined (probably broken) state.', $log.error.logs[0][0]);

      done();
    }, 50);
  });
  it('should inject multiple items into the store', function () {

    assert.doesNotThrow(function () {
      assert.deepEqual(DS.inject('post', [p1, p2, p3, p4]), [p1, p2, p3, p4]);
    });

    assert.deepEqual(DS.get('post', 5), p1);
    assert.deepEqual(DS.get('post', 6), p2);
    assert.deepEqual(DS.get('post', 7), p3);
    assert.deepEqual(DS.get('post', 8), p4);
  });
  it('should inject relations', function () {
    // can inject items without relations
    DS.inject('user', user1);
    DS.inject('organization', organization2);
    DS.inject('comment', comment3);
    DS.inject('profile', profile4);

    assert.deepEqual(DS.get('user', 1), user1);
    assert.deepEqual(DS.get('organization', 2), organization2);
    assert.deepEqual(DS.get('comment', 3), comment3);
    assert.deepEqual(DS.get('profile', 4), profile4);

    // can inject items with relations
    DS.inject('user', user10);
    DS.inject('organization', organization15);
    DS.inject('comment', comment19);
    DS.inject('profile', profile21);

    // originals
    assert.deepEqual(DS.get('user', 10), user10);
    assert.deepEqual(DS.get('organization', 15), organization15);
    assert.deepEqual(DS.get('comment', 19), comment19);
    assert.deepEqual(DS.get('profile', 21), profile21);

    // user10 relations
    assert.deepEqual(DS.get('comment', 11), comment11);
    assert.deepEqual(DS.get('comment', 12), comment12);
    assert.deepEqual(DS.get('comment', 13), comment13);
    assert.deepEqual(DS.get('organization', 14), organization14);
    assert.deepEqual(DS.get('profile', 15), profile15);

    // organization15 relations
    assert.deepEqual(DS.get('user', 16), user16);
    assert.deepEqual(DS.get('user', 17), user17);
    assert.deepEqual(DS.get('user', 18), user18);

    // comment19 relations
    assert.deepEqual(DS.get('user', 20), user20);

    // profile21 relations
    assert.deepEqual(DS.get('user', 22), user22);
  });
});
