describe('DS.defineResource(definition)', function () {
  var errorPrefix = 'DS.defineResource(definition): ';

  beforeEach(startInjector);

  it('should throw an error when method pre-conditions are not met', function () {
    angular.forEach(TYPES_EXCEPT_STRING_OR_OBJECT, function (key) {
      if (!angular.isArray(key)) {
        assert.throws(function () {
          DS.defineResource(key);
        }, DS.errors.IllegalArgumentError, errorPrefix + 'definition: Must be an object!');
      }
    });

    angular.forEach(TYPES_EXCEPT_STRING, function (key) {
      assert.throws(function () {
        DS.defineResource({ name: key });
      }, DS.errors.IllegalArgumentError, errorPrefix + 'definition.name: Must be a string!');
    });

    angular.forEach(TYPES_EXCEPT_STRING, function (key) {
      if (key) {
        assert.throws(function () {
          DS.defineResource({ name: 'name', idAttribute: key });
        }, DS.errors.IllegalArgumentError, errorPrefix + 'definition.idAttribute: Must be a string!');
      }
    });

    angular.forEach(TYPES_EXCEPT_STRING, function (key) {
      if (key) {
        assert.throws(function () {
          DS.defineResource({ name: 'name', endpoint: key });
        }, DS.errors.IllegalArgumentError, errorPrefix + 'definition.endpoint: Must be a string!');
      }
    });

    DS.defineResource('name');

    assert.throws(function () {
      DS.defineResource('name');
    }, DS.errors.RuntimeError, errorPrefix + 'name is already registered!');

    assert.doesNotThrow(function () {
      DS.defineResource('new resource');
      assert.equal(DS.definitions.newresource.class, 'Newresource');
    }, 'Should not throw');
  });

  it('should correctly register a resource', function () {

    var callCount = 0,
      test = {
        validate: function (resourceName, attrs, cb) {
          callCount += 1;
          cb(null, attrs);
        }
      };

    DS.defineResource({
      name: 'Comment',
      baseUrl: 'hello/',
      validate: test.validate
    });

    var weirdThing = DS.defineResource({
      name: 'weird-thing'
    });

    assert.equal(weirdThing.class, 'WeirdThing');

    assert.doesNotThrow(function () {
      assert.isUndefined(DS.get('Comment', 5), 'should be undefined');
    });

    // Should override global baseUrl
    $httpBackend.expectGET('hello/Comment/1').respond(200, { name: 'Sally', id: 1 });

    assert.isUndefined(DS.get('Comment', 1, { loadFromServer: true }), 'should be undefined');

    $httpBackend.flush();

    assert.deepEqual(angular.toJson(DS.get('Comment', 1)), angular.toJson({ name: 'Sally', id: 1 }));

    $httpBackend.expectPOST('hello/Comment').respond(200, { name: 'John', id: 2 });

    DS.create('Comment', { name: 'John' }).then(function (comment) {
      assert.deepEqual(angular.toJson(comment), angular.toJson({ name: 'John', id: 2 }));
    });

    $httpBackend.flush();

    assert.equal(callCount, 1, 'overridden validate should have been called once');
    assert.equal(lifecycle.validate.callCount, 0, 'global validate should not have been called');
  });
  it('should allow custom behavior to be applied to resources', function () {
    var Person = DS.defineResource({
      name: 'person',
      methods: {
        fullName: function () {
          return this.first + ' ' + this.last;
        }
      }
    });

    var Dog = DS.defineResource({
      name: 'dog',
      useClass: true
    });

    var Cat = DS.defineResource({
      name: 'cat'
    });

    DS.inject('person', {
      first: 'John',
      last: 'Anderson',
      id: 1
    });

    DS.inject('dog', {
      name: 'Spot',
      id: 1
    });

    DS.inject('cat', {
      name: 'Sam',
      id: 1
    });

    var person = DS.get('person', 1);
    var person2 = Person.get(1);

    var dog = DS.get('dog', 1);
    var dog2 = Dog.get(1);

    var cat = DS.get('cat', 1);
    var cat2 = Cat.get(1);

    assert.deepEqual(JSON.stringify(person), JSON.stringify({
      first: 'John',
      last: 'Anderson',
      id: 1
    }));
    assert.deepEqual(person, person2, 'persons should be equal');
    assert.deepEqual(dog, dog2, 'dogs should be equal');
    assert.deepEqual(cat, cat2, 'cats should be equal');
    assert.equal(person.fullName(), 'John Anderson');
    assert.isTrue(person instanceof DS.definitions.person[DS.definitions.person.class]);
    assert.isTrue(dog instanceof DS.definitions.dog[DS.definitions.dog.class]);
    assert.isTrue(cat instanceof Object);
    assert.equal(DS.definitions.person.class, 'Person');
    assert.equal(DS.definitions.person[DS.definitions.person.class].name, 'Person');
    assert.equal(lifecycle.beforeInject.callCount, 3, 'beforeInject should have been called');
    assert.equal(lifecycle.afterInject.callCount, 3, 'afterInject should have been called');
  });
  it('should allow definition of computed properties', function (done) {
    var callCount = 0;

    DS.defineResource({
      name: 'person',
      computed: {
        fullName: function (first, last) {
          callCount++;
          return first + ' ' + last;
        }
      }
    });

    DS.defineResource({
      name: 'dog',
      computed: {
        fullName: ['first', 'last', function (f, l) {
          callCount++;
          return f + ' ' + l;
        }]
      }
    });

    DS.inject('person', {
      first: 'John',
      last: 'Anderson',
      email: 'john.anderson@test.com',
      id: 1
    });

    DS.inject('dog', {
      first: 'doggy',
      last: 'dog',
      id: 1
    });

    var person = DS.get('person', 1);
    var dog = DS.get('dog', 1);

    assert.equal(person.fullName, 'John Anderson');
    assert.equal(dog.fullName, 'doggy dog');
    assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called twice');
    assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called twice');

    person.first = 'Johnny';

    // digest loop hasn't happened yet
    assert.equal(DS.get('person', 1).first, 'Johnny');
    assert.equal(DS.get('person', 1).fullName, 'John Anderson');
    assert.equal(DS.get('dog', 1).fullName, 'doggy dog');

    DS.digest();

    setTimeout(function () {
      try {
        assert.deepEqual(JSON.stringify(person), JSON.stringify({
          first: 'Johnny',
          last: 'Anderson',
          email: 'john.anderson@test.com',
          id: 1,
          fullName: 'Johnny Anderson'
        }));
        assert.equal(person.fullName, 'Johnny Anderson');

        person.first = 'Jack';
        dog.first = 'spot';

        DS.digest();

        setTimeout(function () {
          try {
            assert.deepEqual(JSON.stringify(person), JSON.stringify({
              first: 'Jack',
              last: 'Anderson',
              email: 'john.anderson@test.com',
              id: 1,
              fullName: 'Jack Anderson'
            }));
            assert.equal(person.fullName, 'Jack Anderson');
            assert.equal(dog.fullName, 'spot dog');

            // computed property function should not be called
            // when a property changes that isn't a dependency
            // of the computed property
            person.email = 'ja@test.com';

            DS.digest();

            assert.equal(callCount, 5, 'fullName() should have been called 3 times');

            done();
          } catch (err) {
            done(err.stack);
          }
        }, 50);
      } catch (err) {
        done(err.stack);
      }
    }, 50);
  });
  it('should allow definition of computed properties that have no dependencies', function () {
    DS.defineResource({
      name: 'person',
      computed: {
        thing: function () {
          return 'thing';
        }
      }
    });

    DS.defineResource({
      name: 'dog',
      computed: {
        thing: [function () {
          return 'thing';
        }]
      }
    });

    DS.inject('person', {
      id: 1
    });

    DS.inject('dog', {
      id: 1
    });

    var person = DS.get('person', 1);
    var dog = DS.get('dog', 1);

    assert.deepEqual(JSON.stringify(person), JSON.stringify({
      id: 1,
      thing: 'thing'
    }));
    assert.equal(person.thing, 'thing');
    assert.equal(dog.thing, 'thing');
    assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called twice');
    assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called twice');
  });
  it('should work if idAttribute is a computed property computed property', function (done) {
    DS.defineResource({
      name: 'person',
      computed: {
        id: function (first, last) {
          return first + '_' + last;
        }
      }
    });

    DS.inject('person', {
      first: 'John',
      last: 'Anderson',
      email: 'john.anderson@test.com'
    });

    var person = DS.get('person', 'John_Anderson');

    assert.deepEqual(JSON.stringify(person), JSON.stringify({
      first: 'John',
      last: 'Anderson',
      email: 'john.anderson@test.com',
      id: 'John_Anderson'
    }));
    assert.equal(person.id, 'John_Anderson');
    assert.equal(lifecycle.beforeInject.callCount, 1, 'beforeInject should have been called');
    assert.equal(lifecycle.afterInject.callCount, 1, 'afterInject should have been called');

    person.first = 'Johnny';

    // digest loop hasn't happened yet
    assert.equal(DS.get('person', 'John_Anderson').first, 'Johnny');
    assert.equal(DS.get('person', 'John_Anderson').id, 'John_Anderson');

    DS.digest();

    setTimeout(function () {
      assert.deepEqual(JSON.stringify(person), JSON.stringify({
        first: 'Johnny',
        last: 'Anderson',
        email: 'john.anderson@test.com',
        id: 'Johnny_Anderson'
      }));
      assert.equal(person.id, 'Johnny_Anderson');

      done();
    }, 50);
  });
  it('should update links', function (done) {
    var org66 = DS.inject('organization', {
      id: 66
    });
    var org77 = DS.inject('organization', {
      id: 77
    });
    var user88 = DS.inject('user', {
      id: 88,
      organizationId: 66
    });

    DS.link('user', 88, ['organization']);

    assert.isTrue(user88.organization === org66);

    user88.organizationId = 77;

    setTimeout(function () {
      $rootScope.$apply();
      DS.digest();
      assert.isTrue(user88.organization === org77);
      done();
    }, 150);
  });
});
