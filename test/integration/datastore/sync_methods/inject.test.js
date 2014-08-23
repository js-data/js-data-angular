describe('DS.inject(resourceName, attrs)', function () {
  function errorPrefix(resourceName) {
    return 'DS.inject(' + resourceName + ', attrs): ';
  }

  beforeEach(startInjector);

  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      DS.inject('does not exist', {});
    }, DS.errors.NonexistentResourceError, errorPrefix('does not exist') + 'does not exist is not a registered resource!');

    angular.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      assert.throws(function () {
        DS.inject('post', key);
      }, DS.errors.IllegalArgumentError, errorPrefix('post') + 'attrs: Must be an object or an array!');
    });

    assert.throws(function () {
      DS.inject('post', {});
    }, DS.errors.RuntimeError, errorPrefix('post') + 'attrs: Must contain the property specified by `idAttribute`!');
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
  it('should broadcast', function (done) {
    var child = $rootScope.$new();
    var deregister = child.$on('DS.inject', function ($event, resourceName, injected) {
      assert.equal(resourceName, 'post');
      assert.deepEqual(injected, p1);
    });

    assert.doesNotThrow(function () {
      DS.inject('post', p1);
    });

    assert.deepEqual(DS.get('post', 5), p1);
    setTimeout(function () {
      deregister();
      child.$destroy();
      done();
    }, 300);
  });
  it('should emit', function (done) {
    var Cat = DS.defineResource({
      name: 'cat',
      events: 'emit'
    });
    var child = $rootScope.$new();
    var deregister = $rootScope.$on('DS.inject', function ($event, resourceName, injected) {
      assert.equal(resourceName, 'cat');
      assert.deepEqual(injected, {
        name: 'Sam',
        id: 1
      });
    });
    var deregister2 = child.$on('DS.inject', function () {
      fail('should not have been called');
    });

    assert.doesNotThrow(function () {
      Cat.inject({
        name: 'Sam',
        id: 1
      });
    });

    assert.deepEqual(Cat.get(1), {
      name: 'Sam',
      id: 1
    });
    setTimeout(function () {
      deregister();
      deregister2();
      child.$destroy();
      done();
    }, 300);
  });
  it('should neither broadcast nor emit', function (done) {
    var Cat = DS.defineResource({
      name: 'cat',
      events: 'none'
    });
    var child = $rootScope.$new();
    var deregister = $rootScope.$on('DS.inject', function () {
      fail('should not have been called');
    });
    var deregister2 = child.$on('DS.inject', function () {
      fail('should not have been called');
    });

    assert.doesNotThrow(function () {
      Cat.inject({
        name: 'Sam',
        id: 1
      });
    });

    assert.deepEqual(Cat.get(1), {
      name: 'Sam',
      id: 1
    });
    setTimeout(function () {
      deregister();
      deregister2();
      child.$destroy();
      done();
    }, 300);
  });
  it('should inject relations', function () {
    // can inject items without relations
    DS.inject('user', user1);
    DS.inject('organization', organization2);
    DS.inject('comment', comment3);
    DS.inject('profile', profile4);

    assert.deepEqual(DS.get('user', 1), user1);
    assert.deepEqual(DS.get('organization', 2), organization2);
    assert.deepEqual(DS.get('comment', 3).id, comment3.id);
    assert.deepEqual(DS.get('profile', 4).id, profile4.id);

    // can inject items with relations
    DS.inject('user', user10, 0);
    DS.inject('organization', organization15);
    DS.inject('comment', comment19);
    DS.inject('profile', profile21);

    // originals
    assert.equal(DS.get('user', 10).name, user10.name);
    assert.equal(DS.get('user', 10).id, user10.id);
    assert.equal(DS.get('user', 10).organizationId, user10.organizationId);
    assert.isArray(DS.get('user', 10).comments);
    assert.deepEqual(DS.get('organization', 15).name, organization15.name);
    assert.deepEqual(DS.get('organization', 15).id, organization15.id);
    assert.isArray(DS.get('organization', 15).users);
    assert.deepEqual(DS.get('comment', 19).id, comment19.id);
    assert.deepEqual(DS.get('comment', 19).content, comment19.content);
    assert.deepEqual(DS.get('profile', 21).id, profile21.id);
    assert.deepEqual(DS.get('profile', 21).content, profile21.content);

    // user10 relations
    assert.deepEqual(DS.get('comment', 11), DS.get('user', 10).comments[0]);
    assert.deepEqual(DS.get('comment', 12), DS.get('user', 10).comments[1]);
    assert.deepEqual(DS.get('comment', 13), DS.get('user', 10).comments[2]);
    assert.deepEqual(DS.get('organization', 14), DS.get('user', 10).organization);
    assert.deepEqual(DS.get('profile', 15), DS.get('user', 10).profile);

    // organization15 relations
    assert.deepEqual(DS.get('user', 16), DS.get('organization', 15).users[0]);
    assert.deepEqual(DS.get('user', 17), DS.get('organization', 15).users[1]);
    assert.deepEqual(DS.get('user', 18), DS.get('organization', 15).users[2]);

    // comment19 relations
    assert.deepEqual(DS.get('user', 20), DS.get('comment', 19).user);
    assert.deepEqual(DS.get('user', 19), DS.get('comment', 19).approvedByUser);

    // profile21 relations
    assert.deepEqual(DS.get('user', 22), DS.get('profile', 21).user);
  });
});
