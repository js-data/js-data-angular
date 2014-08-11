describe('DS.loadRelations(resourceName, instance(Id), relations[, options]): ', function () {
  function errorPrefix(resourceName) {
    return 'DS.loadRelations(' + resourceName + ', instance(Id), relations[, options]): ';
  }

  beforeEach(startInjector);

  it('should throw an error when method pre-conditions are not met', function () {
    DS.loadRelations('does not exist', user10, []).then(function () {
      fail('should have rejected');
    }, function (err) {
      assert.isTrue(err instanceof DS.errors.NonexistentResourceError);
      assert.equal(err.message, errorPrefix('does not exist') + 'does not exist is not a registered resource!');
    });

    angular.forEach(TYPES_EXCEPT_STRING_OR_NUMBER_OBJECT, function (key) {
      if (angular.isArray(key)) {
        return;
      }
      DS.loadRelations('user', key).then(function () {
        fail('should have rejected');
      }, function (err) {
        assert.isTrue(err instanceof DS.errors.IllegalArgumentError);
        assert.equal(err.message, errorPrefix('user') + 'instance(Id): Must be a string, number or object!');
      });
    });

    angular.forEach(TYPES_EXCEPT_STRING_OR_ARRAY, function (key) {
      if (key) {
        DS.loadRelations('user', user10, key).then(function () {
          fail('should have rejected');
        }, function (err) {
          assert.isTrue(err instanceof DS.errors.IllegalArgumentError);
          assert.equal(err.message, errorPrefix('user') + 'relations: Must be a string or an array!');
        });
      }
    });

    angular.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (key) {
        DS.loadRelations('user', user10, [], key).then(function () {
          fail('should have rejected');
        }, function (err) {
          assert.isTrue(err instanceof DS.errors.IllegalArgumentError);
          assert.equal(err.message, errorPrefix('user') + 'options: Must be an object!');
        });
      }
    });
  });
  it('should get an item from the server', function () {
    DS.inject('user', user10);

    $httpBackend.expectGET('http://test.angular-cache.com/organization/14').respond(200, organization14);
    $httpBackend.expectGET('http://test.angular-cache.com/comment?userId=10').respond(200, [
      comment11,
      comment12,
      comment13
    ]);
    $httpBackend.expectGET('http://test.angular-cache.com/profile?userId=10').respond(200, profile15);

    DS.loadRelations('user', 10, ['comment', 'profile', 'organization']).then(function (user) {
      assert.deepEqual(user.comments, [
        comment11,
        comment12,
        comment13
      ]);
      assert.deepEqual(user.organization, organization14);
      assert.deepEqual(user.profile, profile15);
    }, fail);

    $httpBackend.flush();
  });
  it('should get an item from the server but not store it if cacheResponse is false', function () {
    DS.inject('user', {
      name: 'John Anderson',
      id: 10,
      organizationId: 14
    });

    $httpBackend.expectGET('http://test.angular-cache.com/organization/14').respond(200, organization14);
    $httpBackend.expectGET('http://test.angular-cache.com/comment?userId=10').respond(200, [
      comment11,
      comment12,
      comment13
    ]);
    $httpBackend.expectGET('http://test.angular-cache.com/profile?userId=10').respond(200, profile15);

    DS.loadRelations('user', 10, ['comment', 'profile', 'organization'], { cacheResponse: false }).then(function (user) {
      assert.deepEqual(user.comments, [
        comment11,
        comment12,
        comment13
      ]);
      assert.deepEqual(user.organization, organization14);
      assert.deepEqual(user.profile, profile15);

      assert.isUndefined(DS.get('comment', 11));
      assert.isUndefined(DS.get('comment', 12));
      assert.isUndefined(DS.get('comment', 13));
      assert.isUndefined(DS.get('organization', 14));
      assert.isUndefined(DS.get('profile', 15));
    }, fail);

    $httpBackend.flush();
  });
  it('should correctly propagate errors', function () {
    DS.inject('user', {
      name: 'John Anderson',
      id: 10,
      organizationId: 14
    });

    $httpBackend.expectGET('http://test.angular-cache.com/organization/14').respond(404, 'Not Found');
    $httpBackend.expectGET('http://test.angular-cache.com/comment?userId=10').respond(404, 'Not Found');
    $httpBackend.expectGET('http://test.angular-cache.com/profile?userId=10').respond(404, 'Not Found');

    DS.loadRelations('user', 10, ['comment', 'profile', 'organization']).then(function () {
      fail('Should not have succeeded!');
    }, function (err) {
      assert.equal(err.data, 'Not Found');
    });

    $httpBackend.flush();
  });
});
