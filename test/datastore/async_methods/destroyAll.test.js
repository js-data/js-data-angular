describe('DS.destroyAll', function () {
  beforeEach(startInjector);

  it('should query the server for a collection', function () {
    $httpBackend.expectDELETE('http://test.angular-cache.com/posts?where=%7B%22age%22:33%7D').respond(200);

    DS.inject('post', p1);
    DS.inject('post', p2);
    DS.inject('post', p3);
    DS.inject('post', p4);
    DS.inject('post', p5);

    DS.destroyAll('post', { where: { age: 33 } }).then(null, function (err) {
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

    DS.destroyAll('post', {}).then(null, function (err) {
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
