describe('DS.destroyAll(resourceName, params[, options]): ', function () {
  function errorPrefix(resourceName) {
    return 'DS.destroyAll(' + resourceName + ', params[, options]): ';
  }

  beforeEach(startInjector);

  it('should throw an error when method pre-conditions are not met', function () {
    DS.destroyAll('does not exist', {}).then(function () {
      fail('should have rejected');
    }, function (err) {
      assert.isTrue(err instanceof DS.errors.NonexistentResourceError);
      assert.equal(err.message, errorPrefix('does not exist') + 'does not exist is not a registered resource!');
    });

    angular.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      DS.destroyAll('post', key).then(function () {
        fail('should have rejected');
      }, function (err) {
        assert.isTrue(err instanceof DS.errors.IllegalArgumentError);
        assert.equal(err.message, errorPrefix('post') + 'params: Must be an object!');
      });
    });

    angular.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (key) {
        DS.destroyAll('post', {}, key).then(function () {
          fail('should have rejected');
        }, function (err) {
          assert.isTrue(err instanceof DS.errors.IllegalArgumentError);
          assert.equal(err.message, errorPrefix('post') + 'options: Must be an object!');
        });
      }
    });
  });
  it('should query the server for a collection', function () {
    $httpBackend.expectDELETE('http://test.angular-cache.com/posts?where=%7B%22age%22:33%7D').respond(200);

    DS.inject('post', p1);
    DS.inject('post', p2);
    DS.inject('post', p3);
    DS.inject('post', p4);
    DS.inject('post', p5);

    DS.destroyAll('post', { where: { age: 33 } }).then(function () {

    }, function (err) {
      console.error(err.stack);
      fail('Should not have rejected!');
    });

    $httpBackend.flush();

    assert.isDefined(DS.get('post', 5));
    assert.isDefined(DS.get('post', 6));
    assert.isDefined(DS.get('post', 7));
    assert.isUndefined(DS.get('post', 8));
    assert.isUndefined(DS.get('post', 9));

    $httpBackend.expectDELETE('http://test.angular-cache.com/posts').respond(200);

    DS.inject('post', p1);
    DS.inject('post', p2);
    DS.inject('post', p3);
    DS.inject('post', p4);
    DS.inject('post', p5);

    DS.destroyAll('post', {}).then(function () {

    }, function (err) {
      console.error(err.stack);
      fail('Should not have rejected!');
    });

    $httpBackend.flush();

    assert.deepEqual(DS.filter('post', {}), [], 'The posts should not be in the store yet');
  });
  it('should handle nested resources', function () {
    $httpBackend.expectDELETE('http://test.angular-cache.com/user/4/comment?content=test').respond(204);

    DS.destroyAll('comment', {
      content: 'test'
    }, {
      params: {
        approvedBy: 4
      }
    }).then(function () {
    }, function (err) {
      console.log(err);
      fail('Should not have failed!');
    });

    $httpBackend.flush();

    $httpBackend.expectDELETE('http://test.angular-cache.com/comment?content=test').respond(204);

    DS.destroyAll('comment', {
      content: 'test'
    }).then(function () {
    }, function (err) {
      console.log(err);
      fail('Should not have failed!');
    });

    $httpBackend.flush();

    $httpBackend.expectDELETE('http://test.angular-cache.com/comment?content=test').respond(204);

    DS.destroyAll('comment', {
      content: 'test'
    }, {
      params: {
        approvedBy: false
      }
    }).then(function () {
    }, function (err) {
      console.log(err);
      fail('Should not have failed!');
    });

    $httpBackend.flush();
  });
});
