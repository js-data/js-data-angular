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
      name: 'comment',
      baseUrl: 'hello/',
      validate: test.validate
    });

    assert.doesNotThrow(function () {
      assert.isUndefined(DS.get('comment', 5), 'should be undefined');
    });

    // Should override global baseUrl
    $httpBackend.expectGET('hello/comment/1').respond(200, { name: 'Sally', id: 1 });

    assert.isUndefined(DS.get('comment', 1, { loadFromServer: true }), 'should be undefined');

    $httpBackend.flush();

    assert.deepEqual(DS.get('comment', 1), { name: 'Sally', id: 1 });

    $httpBackend.expectPOST('hello/comment').respond(200, { name: 'John', id: 2 });

    DS.create('comment', { name: 'John' }).then(function (comment) {
      assert.deepEqual(comment, { name: 'John', id: 2 });
    });

    $httpBackend.flush();

    assert.equal(callCount, 1, 'overridden validate should have been called once');
    assert.equal(lifecycle.validate.callCount, 0, 'global validate should not have been called');
  });
  it('should allow custom behavior to be applied to resources', function () {
    DS.defineResource({
      name: 'user',
      methods: {
        fullName: function () {
          return this.first + ' ' + this.last;
        }
      }
    });

    DS.inject('user', {
      first: 'John',
      last: 'Anderson',
      id: 1
    });

    var user = DS.get('user', 1);

    assert.deepEqual(JSON.stringify(user), JSON.stringify({
      first: 'John',
      last: 'Anderson',
      id: 1
    }));
    assert.equal(user.fullName(), 'John Anderson');
    assert.isTrue(user instanceof DS.definitions.user[DS.definitions.user.class]);
    assert.equal(DS.definitions.user.class, 'User');
    assert.equal(DS.definitions.user[DS.definitions.user.class].name, 'User');
    assert.equal(lifecycle.beforeInject.callCount, 1, 'beforeInject should have been called');
    assert.equal(lifecycle.afterInject.callCount, 1, 'afterInject should have been called');
  });
});
