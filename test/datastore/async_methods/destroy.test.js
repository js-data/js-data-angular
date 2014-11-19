describe('DS.destroy', function () {
  beforeEach(startInjector);

  it('should delete an item from the data store', function () {
    $httpBackend.expectDELETE('http://test.angular-cache.com/posts/5').respond(200, 5);

    DS.inject('post', p1);

    DS.destroy('post', 5).then(function (id) {
      assert.equal(id, 5, 'post 5 should have been deleted');
      assert.equal(lifecycle.beforeDestroy.callCount, 1, 'beforeDestroy should have been called');
      assert.equal(lifecycle.afterDestroy.callCount, 1, 'afterDestroy should have been called');
      assert.isUndefined(DS.get('post', 5));
      assert.equal(DS.lastModified('post', 5), 0);
      assert.equal(DS.lastSaved('post', 5), 0);
    }, function (err) {
      console.error(err.stack);
      fail('should not have rejected');
    });

    $httpBackend.flush();
  });
  it('should handle nested resources', function () {
    var testComment = {
      id: 5,
      content: 'test'
    };
    var testComment2 = {
      id: 6,
      content: 'test',
      approvedBy: 4
    };

    DS.inject('comment', testComment);

    $httpBackend.expectDELETE('http://test.angular-cache.com/user/4/comment/5').respond(204);

    DS.destroy('comment', 5, {
      params: {
        approvedBy: 4
      }
    }).then(null, function () {
      fail('Should not have failed!');
    });

    $httpBackend.flush();

    $httpBackend.expectDELETE('http://test.angular-cache.com/user/4/comment/6').respond(204);

    DS.inject('comment', testComment2);

    DS.destroy('comment', 6, {
      bypassCache: true
    }).then(null, function () {
      fail('Should not have failed!');
    });

    $httpBackend.flush();

    $httpBackend.expectDELETE('http://test.angular-cache.com/comment/6').respond(204);
    DS.inject('comment', testComment2);
    DS.destroy('comment', 6, {
      params: {
        approvedBy: false
      }
    }).then(null, function (err) {
      console.log(err.stack);
      fail('Should not have failed!');
    });

    $httpBackend.flush();
  });
  // not yet implemented in js-data
  //it('should eager eject', function (done) {
  //  $httpBackend.expectDELETE('http://test.angular-cache.com/posts/5').respond(200, 5);
  //
  //  DS.inject('post', p1);
  //
  //  DS.destroy('post', 5, { eagerEject: true }).then(function (id) {
  //    assert.equal(id, 5, 'post 5 should have been deleted');
  //  }, function (err) {
  //    console.error(err.stack);
  //    fail('should not have rejected');
  //  });
  //
  //  $rootScope.$apply();
  //
  //  assert.isUndefined(DS.get('post', 5));
  //
  //  setTimeout(function () {
  //    try {
  //      $httpBackend.flush();
  //
  //      setTimeout(function () {
  //        try {
  //          assert.equal(lifecycle.beforeDestroy.callCount, 1, 'beforeDestroy should have been called');
  //          assert.equal(lifecycle.afterDestroy.callCount, 1, 'afterDestroy should have been called');
  //          assert.isUndefined(DS.get('post', 5));
  //          assert.equal(DS.lastModified('post', 5), 0);
  //          assert.equal(DS.lastSaved('post', 5), 0);
  //
  //          done();
  //        } catch (e) {
  //          done(e);
  //        }
  //      });
  //    } catch (e) {
  //      done(e);
  //    }
  //  }, 30);
  //});
});
