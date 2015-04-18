describe('DS.loadRelations', function () {
  beforeEach(startInjector);

  it('should get an item from the server', function () {
    DS.inject('user', user10);

    $httpBackend.expectGET('http://test.angular-cache.com/organization/14/user/10/comment').respond(200, [
      comment11,
      comment12,
      comment13
    ]);
    $httpBackend.expectGET('http://test.angular-cache.com/profile?approvedBy=10&userId=10').respond(200, [profile15]);
    $httpBackend.expectGET('http://test.angular-cache.com/organization/14?approvedBy=10').respond(200, organization14);

    DS.loadRelations('user', 10, ['comment', 'profile', 'organization'], { params: { approvedBy: 10 }, findStrictCache: true }).then(function (user) {
      try {
        assert.deepEqual(user.comments[0].id, DS.get('comment', user.comments[0].id).id);
        assert.deepEqual(user.comments[0].user, DS.get('comment', user.comments[0].id).user);
        assert.deepEqual(user.comments[1].id, DS.get('comment', user.comments[1].id).id);
        assert.deepEqual(user.comments[1].user, DS.get('comment', user.comments[1].id).user);
        assert.deepEqual(user.comments[2].id, DS.get('comment', user.comments[2].id).id);
        assert.deepEqual(user.comments[2].user, DS.get('comment', user.comments[2].id).user);
        assert.deepEqual(user.organization.id, DS.get('organization', 14).id);
        assert.deepEqual(user.profile.id, DS.get('profile', 15).id);
        // try a comment that has a belongsTo relationship to multiple users:
        DS.inject('comment', comment19);
        $httpBackend.expectGET('http://test.angular-cache.com/user/20').respond(200, user20);
        $httpBackend.expectGET('http://test.angular-cache.com/user/19').respond(200, user19);
        DS.loadRelations('comment', 19, ['user'], { findStrictCache: true }).then(function (comment) {
          try {
            assert.isObject(comment.user);
            assert.equal(comment.user.id, user20.id);
            assert.isObject(comment.approvedByUser);
            assert.equal(comment.approvedByUser.id, user19.id);
          } catch (err) {
            console.log(err, err.stack);
            fail(err);
          }
        }, function (err) {
          console.log(err, err.stack);
          fail(err);
        });
      } catch (e) {
        console.log(e, e.stack);
        fail(e);
      }
    }, function (err) {
      console.log(err, err.stack);
      fail(err);
    });

    setTimeout(function () {
      $httpBackend.flush();
    }, 30);
  });
  it('should get an item from the server but not store it if cacheResponse is false', function () {
    DS.inject('user', {
      name: 'John Anderson',
      id: 10,
      organizationId: 14
    });

    $httpBackend.expectGET('http://test.angular-cache.com/organization/14/user/10/comment').respond(200, [
      comment11,
      comment12,
      comment13
    ]);
    $httpBackend.expectGET('http://test.angular-cache.com/profile?userId=10').respond(200, [profile15]);
    $httpBackend.expectGET('http://test.angular-cache.com/organization/14').respond(200, organization14);

    DS.loadRelations('user', 10, ['comment', 'profile', 'organization'], { cacheResponse: false, findStrictCache: true }).then(function (user) {
      assert.deepEqual(angular.toJson(user.comments), angular.toJson([
        comment11,
        comment12,
        comment13
      ]));
      assert.deepEqual(angular.toJson(user.organization), angular.toJson(organization14));
      assert.deepEqual(angular.toJson(user.profile), angular.toJson(profile15));

      assert.isUndefined(DS.get('comment', 11));
      assert.isUndefined(DS.get('comment', 12));
      assert.isUndefined(DS.get('comment', 13));
      assert.isUndefined(DS.get('organization', 14));
      assert.isUndefined(DS.get('profile', 15));
    }).catch(function (e) {
      fail('should not have failed!');
    });

    setTimeout(function () {
      $httpBackend.flush();
    }, 30);
  });
  it('should correctly propagate errors', function () {
    DS.inject('user', {
      name: 'John Anderson',
      id: 10,
      organizationId: 14
    });

    $httpBackend.expectGET('http://test.angular-cache.com/organization/14/user/10/comment').respond(404, 'Not Found');
    $httpBackend.expectGET('http://test.angular-cache.com/profile?userId=10').respond(404, 'Not Found');
    $httpBackend.expectGET('http://test.angular-cache.com/organization/14').respond(404, 'Not Found');

    DS.loadRelations('user', 10, ['comment', 'profile', 'organization']).then(function () {
      fail('Should not have succeeded!');
    });

    try {
      $httpBackend.flush();
    } catch (err) {
      assert.equal(err.data, 'Not Found');
    }
  });
  it('should handle multiple belongsTo levels', function () {
    var organization = DS.inject('organization', organization14);

    var copy = angular.extend({}, user10);
    delete copy.organization;
    delete copy.comments;
    delete copy.profile;

    $httpBackend.expectGET('http://test.angular-cache.com/organization/14/user').respond(200, [copy]);

    DS.loadRelations('organization', organization, ['user'], { findStrictCache: true }).then(function (organization) {
      assert.equal(organization.users[0].id, 10);

      $httpBackend.expectGET('http://test.angular-cache.com/organization/14/user/10/comment').respond(200, [comment11, comment12]);

      var user = DS.get('user', 10);

      return DS.loadRelations('user', user, ['comment']).then(function (user) {
        assert.isArray(user.comments);
      }, function () {
        fail('Should not have succeeded!');
      });
    }, function (err) {
      console.log(err.stack);
      fail('Should not have succeeded!');
    });

    $httpBackend.flush();
  });
  it('should handle multiple belongsTo levels when the response includes nested resources', function () {
    var organization = DS.inject('organization', {
      id: 1
    });

    $httpBackend.expectGET('http://test.angular-cache.com/organization/1/user').respond(200, [
      {
        organizationId: 1,
        id: 1
      }
    ]);

    DS.loadRelations('organization', organization, ['user']).then(function (organization) {
      assert.equal(organization.users[0].id, 1);

      $httpBackend.expectGET('http://test.angular-cache.com/organization/1/user/1/comment').respond(200, [
        {
          id: 1,
          userId: 1,
          user: {
            id: 1
          }
        },
        {
          id: 2,
          userId: 1,
          user: {
            id: 1
          }
        }
      ]);

      var user = DS.get('user', 1);

      return DS.loadRelations('user', user, ['comment']).then(function (user) {
        assert.isArray(user.comments);
      }, function () {
        fail('Should not have succeeded!');
      });
    }, function () {
      fail('Should not have succeeded!');
    });

    $httpBackend.flush();
  });
});
