describe('DS.inject(resourceName, attrs[, options])', function () {
  function errorPrefix(resourceName) {
    return 'DS.inject(' + resourceName + ', attrs[, options]): ';
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
      assert.deepEqual(angular.toJson(DS.inject('post', p1)), angular.toJson(p1));
    });
    assert.notEqual(DS.lastModified('post', 5), 0);
    assert.isNumber(DS.lastModified('post', 5));
  });
  it('should get mad when primary keys are changed', function (done) {

    assert.equal(DS.lastModified('post', 5), 0);
    assert.doesNotThrow(function () {
      assert.deepEqual(angular.toJson(DS.inject('post', p1)), angular.toJson(p1));
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
      assert.deepEqual(angular.toJson(DS.inject('post', [p1, p2, p3, p4])), angular.toJson([p1, p2, p3, p4]));
    });

    assert.deepEqual(angular.toJson(DS.get('post', 5)), angular.toJson(p1));
    assert.deepEqual(angular.toJson(DS.get('post', 6)), angular.toJson(p2));
    assert.deepEqual(angular.toJson(DS.get('post', 7)), angular.toJson(p3));
    assert.deepEqual(angular.toJson(DS.get('post', 8)), angular.toJson(p4));
  });
  it('should broadcast', function (done) {
    var child = $rootScope.$new();
    var deregister = child.$on('DS.inject', function ($event, resourceName, injected) {
      assert.equal(resourceName, 'post');
      assert.deepEqual(angular.toJson(injected), angular.toJson(p1));
    });

    assert.doesNotThrow(function () {
      DS.inject('post', p1);
    });

    assert.deepEqual(angular.toJson(DS.get('post', 5)), angular.toJson(p1));
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
      assert.deepEqual(angular.toJson(injected), angular.toJson({
        name: 'Sam',
        id: 1
      }));
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

    assert.deepEqual(angular.toJson(Cat.get(1)), angular.toJson({
      name: 'Sam',
      id: 1
    }));
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

    assert.deepEqual(angular.toJson(Cat.get(1)), angular.toJson({
      name: 'Sam',
      id: 1
    }));
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

    assert.deepEqual(angular.toJson(DS.get('user', 1)), angular.toJson(user1));
    assert.deepEqual(angular.toJson(DS.get('organization', 2)), angular.toJson(organization2));
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
    assert.deepEqual(angular.toJson(DS.get('comment', 11)), angular.toJson(DS.get('user', 10).comments[0]));
    assert.deepEqual(angular.toJson(DS.get('comment', 12)), angular.toJson(DS.get('user', 10).comments[1]));
    assert.deepEqual(angular.toJson(DS.get('comment', 13)), angular.toJson(DS.get('user', 10).comments[2]));
    assert.deepEqual(angular.toJson(DS.get('organization', 14)), angular.toJson(DS.get('user', 10).organization));
    assert.deepEqual(angular.toJson(DS.get('profile', 15)), angular.toJson(DS.get('user', 10).profile));

    // organization15 relations
    assert.deepEqual(angular.toJson(DS.get('user', 16)), angular.toJson(DS.get('organization', 15).users[0]));
    assert.deepEqual(angular.toJson(DS.get('user', 17)), angular.toJson(DS.get('organization', 15).users[1]));
    assert.deepEqual(angular.toJson(DS.get('user', 18)), angular.toJson(DS.get('organization', 15).users[2]));

    // comment19 relations
    assert.deepEqual(angular.toJson(DS.get('user', 20)), angular.toJson(DS.get('comment', 19).user));
    assert.deepEqual(angular.toJson(DS.get('user', 19)), angular.toJson(DS.get('comment', 19).approvedByUser));

    // profile21 relations
    assert.deepEqual(angular.toJson(DS.get('user', 22)), angular.toJson(DS.get('profile', 21).user));
  });
  it('should find inverse links', function () {
    DS.inject('user', { organizationId: 5, id: 1 });

    DS.inject('organization', { id: 5 }, { linkInverse: true });

    assert.isObject(DS.get('user', 1).organization);

    assert.isUndefined(DS.get('user', 1).comments);

    DS.inject('comment', { approvedBy: 1, id: 23 }, { linkInverse: true });

    assert.equal(1, DS.get('user', 1).comments.length);

    DS.inject('comment', { approvedBy: 1, id: 44 }, { linkInverse: true });

    assert.equal(2, DS.get('user', 1).comments.length);
  });
  it('should inject cyclic dependencies', function () {
    DS.defineResource({
      name: 'foo',
      relations: {
        hasMany: {
          foo: {
            localField: 'children',
            foreignKey: 'parentId'
          }
        }
      }
    });
    var injected = DS.inject('foo', [{
      id: 1,
      children: [
        {
          id: 2,
          parentId: 1,
          children: [
            {
              id: 4,
              parentId: 2
            },
            {
              id: 5,
              parentId: 2
            }
          ]
        },
        {
          id: 3,
          parentId: 1,
          children: [
            {
              id: 6,
              parentId: 3
            },
            {
              id: 7,
              parentId: 3
            }
          ]
        }
      ]
    }]);

    assert.equal(injected[0].id, 1);
    assert.equal(injected[0].children[0].id, 2);
    assert.equal(injected[0].children[1].id, 3);
    assert.equal(injected[0].children[0].children[0].id, 4);
    assert.equal(injected[0].children[0].children[1].id, 5);
    assert.equal(injected[0].children[1].children[0].id, 6);
    assert.equal(injected[0].children[1].children[1].id, 7);

    assert.isDefined(DS.get('foo', 1));
    assert.isDefined(DS.get('foo', 2));
    assert.isDefined(DS.get('foo', 3));
    assert.isDefined(DS.get('foo', 4));
    assert.isDefined(DS.get('foo', 5));
    assert.isDefined(DS.get('foo', 6));
    assert.isDefined(DS.get('foo', 7));
  });
});
