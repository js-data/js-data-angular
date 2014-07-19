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

    assert.doesNotThrow(function () {
      assert.isUndefined(DS.get('Comment', 5), 'should be undefined');
    });

    // Should override global baseUrl
    $httpBackend.expectGET('hello/Comment/1').respond(200, { name: 'Sally', id: 1 });

    assert.isUndefined(DS.get('Comment', 1, { loadFromServer: true }), 'should be undefined');

    $httpBackend.flush();

    assert.deepEqual(DS.get('Comment', 1), { name: 'Sally', id: 1 });

    $httpBackend.expectPOST('hello/Comment').respond(200, { name: 'John', id: 2 });

    DS.create('Comment', { name: 'John' }).then(function (comment) {
      assert.deepEqual(comment, { name: 'John', id: 2 });
    });

    $httpBackend.flush();

    assert.equal(callCount, 1, 'overridden validate should have been called once');
    assert.equal(lifecycle.validate.callCount, 0, 'global validate should not have been called');
  });
  it('should allow custom behavior to be applied to resources', function () {
    DS.defineResource({
      name: 'person',
      methods: {
        fullName: function () {
          return this.first + ' ' + this.last;
        }
      }
    });

    DS.inject('person', {
      first: 'John',
      last: 'Anderson',
      id: 1
    });

    var user = DS.get('person', 1);

    assert.deepEqual(JSON.stringify(user), JSON.stringify({
      first: 'John',
      last: 'Anderson',
      id: 1
    }));
    assert.equal(user.fullName(), 'John Anderson');
    assert.isTrue(user instanceof DS.definitions.person[DS.definitions.person.class]);
    assert.equal(DS.definitions.person.class, 'Person');
    assert.equal(DS.definitions.person[DS.definitions.person.class].name, 'Person');
    assert.equal(lifecycle.beforeInject.callCount, 1, 'beforeInject should have been called');
    assert.equal(lifecycle.afterInject.callCount, 1, 'afterInject should have been called');
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

    DS.inject('person', {
      first: 'John',
      last: 'Anderson',
      email: 'john.anderson@test.com',
      id: 1
    });

    var person = DS.get('person', 1);

    assert.deepEqual(JSON.stringify(person), JSON.stringify({
      first: 'John',
      last: 'Anderson',
      email: 'john.anderson@test.com',
      id: 1,
      fullName: 'John Anderson'
    }));
    assert.equal(person.fullName, 'John Anderson');
    assert.equal(lifecycle.beforeInject.callCount, 1, 'beforeInject should have been called');
    assert.equal(lifecycle.afterInject.callCount, 1, 'afterInject should have been called');

    person.first = 'Johnny';

    // digest loop hasn't happened yet
    assert.equal(DS.get('person', 1).first, 'Johnny');
    assert.equal(DS.get('person', 1).fullName, 'John Anderson');

    DS.digest();

    setTimeout(function () {
      assert.deepEqual(person, {
        first: 'Johnny',
        last: 'Anderson',
        email: 'john.anderson@test.com',
        id: 1,
        fullName: 'Johnny Anderson'
      });
      assert.equal(person.fullName, 'Johnny Anderson');

      person.first = 'Jack';

      DS.digest();

      setTimeout(function () {
        assert.deepEqual(person, {
          first: 'Jack',
          last: 'Anderson',
          email: 'john.anderson@test.com',
          id: 1,
          fullName: 'Jack Anderson'
        });
        assert.equal(person.fullName, 'Jack Anderson');

        // computed property function should not be called
        // when a property changes that isn't a dependency
        // of the computed property
        person.email = 'ja@test.com';

        DS.digest();

        assert.equal(callCount, 3, 'fullName() should have been called 3 times');

        done();
      }, 50);
    }, 50);
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
      assert.deepEqual(person, {
        first: 'Johnny',
        last: 'Anderson',
        email: 'john.anderson@test.com',
        id: 'Johnny_Anderson'
      });
      assert.equal(person.id, 'Johnny_Anderson');

      done();
    }, 50);
  });
});
