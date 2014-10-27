describe('DS.findAll', function () {

  beforeEach(startInjector);

  it('should query the server for a collection', function (done) {
    $httpBackend.expectGET(/http:\/\/test\.angular-cache\.com\/posts\??/).respond(200, [p1, p2, p3, p4]);

    DS.findAll('post', {}).then(function (data) {
      assert.deepEqual(angular.toJson(data), angular.toJson([p1, p2, p3, p4]));
    }, function (err) {
      console.error(err.stack);
      fail('Should not have rejected!');
    });

    assert.deepEqual(DS.filter('post', {}), [], 'The posts should not be in the store yet');

    // Should have no effect because there is already a pending query
    DS.findAll('post', {}).then(function (data) {
      assert.deepEqual(angular.toJson(data), angular.toJson([p1, p2, p3, p4]));
    }, function (err) {
      console.error(err.stack);
      fail('Should not have rejected!');
    });

    setTimeout(function () {
      try {
        $httpBackend.flush();

        setTimeout(function () {
          try {
            assert.deepEqual(angular.toJson(DS.filter('post', {})), angular.toJson([p1, p2, p3, p4]), 'The posts are now in the store');
            assert.isNumber(DS.lastModified('post', 5));
            assert.isNumber(DS.lastSaved('post', 5));
            DS.find('post', p1.id); // should not trigger another XHR


            // Should not make a request because the request was already completed
            DS.findAll('post', {}).then(function (data) {
              assert.deepEqual(angular.toJson(data), angular.toJson([p1, p2, p3, p4]));
            }, function (err) {
              console.error(err.stack);
              fail('Should not have rejected!');
            });

            $httpBackend.expectGET(/http:\/\/test\.angular-cache\.com\/posts\??/).respond(200, [p1, p2, p3, p4]);

            // Should make a request because bypassCache is set to true
            DS.findAll('post', {}, { bypassCache: true }).then(function (data) {
              assert.deepEqual(angular.toJson(data), angular.toJson([p1, p2, p3, p4]));
            }, function (err) {
              console.error(err.stack);
              fail('Should not have rejected!');
            });

            setTimeout(function () {
              try {
                $httpBackend.flush();

                setTimeout(function () {
                  try {
                    assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called');
                    assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called');
                    assert.equal(lifecycle.serialize.callCount, 0, 'serialize should have been called');
                    assert.equal(lifecycle.deserialize.callCount, 2, 'deserialize should have been called');
                    done();
                  } catch (e) {
                    done(e);
                  }
                });
              } catch (e) {
                done(e);
              }
            }, 30);
          } catch (e) {
            done(e);
          }
        });
      } catch (e) {
        done(e);
      }
    }, 30);
  });
  it('should query the server for a collection but not store the data if cacheResponse is false', function (done) {
    $httpBackend.expectGET(/http:\/\/test\.angular-cache\.com\/posts\??/).respond(200, [p1, p2, p3, p4]);

    DS.findAll('post', {}, { cacheResponse: false }).then(function (data) {
      assert.deepEqual(angular.toJson(data), angular.toJson([p1, p2, p3, p4]));
    }, function (err) {
      console.error(err.stack);
      fail('Should not have rejected!');
    });

    setTimeout(function () {
      try {
        $httpBackend.flush();

        setTimeout(function () {
          try {
            assert.deepEqual(angular.toJson(DS.filter('post', {})), angular.toJson([]), 'The posts should not have been injected into the store');

            assert.equal(lifecycle.beforeInject.callCount, 0, 'beforeInject should have been called');
            assert.equal(lifecycle.afterInject.callCount, 0, 'afterInject should have been called');
            assert.equal(lifecycle.serialize.callCount, 0, 'serialize should have been called');
            assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');

            done();
          } catch (e) {
            done(e);
          }
        });
      } catch (e) {
        done(e);
      }
    }, 30);
  });
  it('should correctly propagate errors', function (done) {
    $httpBackend.expectGET(/http:\/\/test\.angular-cache\.com\/posts\??/).respond(404, 'Not Found');

    DS.findAll('post', {}).then(function () {
      done('Should not have succeeded!');
    }, function (err) {
      assert.equal(err.data, 'Not Found');
      done();
    });

    setTimeout(function () {
      try {
        $httpBackend.flush();
      } catch (e) {
        done(e);
      }
    }, 30);
  });
  it('"params" argument is optional', function (done) {
    $httpBackend.expectGET(/http:\/\/test\.angular-cache\.com\/posts\??/).respond(200, [p1, p2, p3, p4]);

    DS.findAll('post').then(function (data) {
      assert.deepEqual(angular.toJson(data), angular.toJson([p1, p2, p3, p4]));
    }, function (err) {
      console.error(err.message);
      fail('Should not have rejected!');
    });

    setTimeout(function () {
      try {
        $httpBackend.flush();

        setTimeout(function () {
          try {
            assert.deepEqual(angular.toJson(DS.filter('post', {})), angular.toJson([p1, p2, p3, p4]), 'The posts are now in the store');

            assert.equal(lifecycle.beforeInject.callCount, 1 , 'beforeInject should have been called');
            assert.equal(lifecycle.afterInject.callCount, 1, 'afterInject should have been called');
            assert.equal(lifecycle.serialize.callCount, 0, 'serialize should have been called');
            assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');

            done();
          } catch (e) {
            done(e);
          }
        });
      } catch (e) {
        done(e);
      }
    }, 30);
  });
  it('"params"', function (done) {
    $httpBackend.expectGET('http://test.angular-cache.com/posts?where=%7B%22author%22:%22Adam%22%7D').respond(200, [p4, p5]);

    var params = {
      where: {
        author: 'Adam'
      }
    };
    DS.findAll('post', params).then(function (data) {
      assert.deepEqual(angular.toJson(data), angular.toJson([p4, p5]));
    }, function (err) {
      console.error(err.message);
      fail('Should not have rejected!');
    });

    setTimeout(function () {
      try {
        $httpBackend.flush();

        setTimeout(function () {
          try {
            assert.deepEqual(angular.toJson(DS.filter('post', params)), angular.toJson([p4, p5]), 'The posts are now in the store');
            assert.deepEqual(angular.toJson(DS.filter('post', {
              where: {
                id: {
                  '>': 8
                }
              }
            })), angular.toJson([p5]), 'The posts are now in the store');

            assert.equal(lifecycle.beforeInject.callCount, 1, 'beforeInject should have been called');
            assert.equal(lifecycle.afterInject.callCount, 1, 'afterInject should have been called');
            assert.equal(lifecycle.serialize.callCount, 0, 'serialize should have been called');
            assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');

            done();
          } catch (e) {
            done(e);
          }
        });
      } catch (e) {
        done(e);
      }
    }, 30);
  });
  it('should return already injected items', function (done) {
    var u1 = {
        id: 1,
        name: 'John'
      },
      u2 = {
        id: 2,
        name: 'Sally'
      };

    DS.defineResource({
      name: 'person',
      endpoint: 'users',
      methods: {
        fullName: function () {
          return this.first + ' ' + this.last;
        }
      }
    });

    $httpBackend.expectGET(/http:\/\/test\.angular-cache\.com\/users\??/).respond(200, [u1, u2]);

    DS.findAll('person').then(function (data) {
      assert.deepEqual(angular.toJson(data), angular.toJson([
        DSUtils.deepMixIn(new DS.definitions.person[DS.definitions.person.class](), u1),
        DSUtils.deepMixIn(new DS.definitions.person[DS.definitions.person.class](), u2)
      ]));
      angular.forEach(data, function (person) {
        assert.isTrue(person instanceof DS.definitions.person[DS.definitions.person.class], 'should be an instance of User');
      });
    }, function (err) {
      console.error(err.message);
      fail('Should not have rejected!');
    });

    setTimeout(function () {
      try {
        $httpBackend.flush();

        setTimeout(function () {
          try {
            assert.deepEqual(angular.toJson(DS.filter('person')), angular.toJson([
              DSUtils.deepMixIn(new DS.definitions.person[DS.definitions.person.class](), u1),
              DSUtils.deepMixIn(new DS.definitions.person[DS.definitions.person.class](), u2)
            ]), 'The users are now in the store');

            assert.equal(lifecycle.beforeInject.callCount, 1, 'beforeInject should have been called');
            assert.equal(lifecycle.afterInject.callCount, 1, 'afterInject should have been called');
            assert.equal(lifecycle.serialize.callCount, 0, 'serialize should have been called');
            assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');

            done();
          } catch (e) {
            done(e);
          }
        });
      } catch (e) {
        done(e);
      }
    }, 30);
  });
  it('should handle nested resources', function (done) {
    var testComment = {
      id: 5,
      content: 'test',
      approvedBy: 4
    };
    var testComment2 = {
      id: 6,
      content: 'test',
      approvedBy: 4
    };
    $httpBackend.expectGET('http://test.angular-cache.com/user/4/comment?content=test').respond(200, [testComment, testComment2]);

    DS.findAll('comment', {
      content: 'test'
    }, {
      params: {
        approvedBy: 4
      }
    }).then(function (comments) {
      assert.deepEqual(angular.toJson(comments), angular.toJson([testComment, testComment2]));
      assert.deepEqual(angular.toJson(comments), angular.toJson(DS.filter('comment', {
        content: 'test'
      })));
      done();
    }, function () {
      done('Should not have failed!');
    });

    setTimeout(function () {
      try {
        $httpBackend.flush();
      } catch (e) {
        done(e);
      }
    }, 30);
  });
  it('should handle nested resources 2', function (done) {
    var testComment = {
      id: 5,
      content: 'test',
      approvedBy: 4
    };
    var testComment2 = {
      id: 6,
      content: 'test',
      approvedBy: 4
    };

    $httpBackend.expectGET('http://test.angular-cache.com/comment?content=test').respond(200, [testComment, testComment2]);

    DS.findAll('comment', {
      content: 'test'
    }, {
      bypassCache: true
    }).then(function (comments) {
      assert.deepEqual(angular.toJson(comments), angular.toJson([testComment, testComment2]));
      assert.deepEqual(angular.toJson(comments), angular.toJson(DS.filter('comment', {
        content: 'test'
      })));
      done();
    }, function () {
      done('Should not have failed!');
    });

    setTimeout(function () {
      try {
        $httpBackend.flush();
      } catch (e) {
        done(e);
      }
    }, 30);
  });
  it('should handle nested resources 3', function (done) {
    var testComment = {
      id: 5,
      content: 'test',
      approvedBy: 4
    };
    var testComment2 = {
      id: 6,
      content: 'test',
      approvedBy: 4
    };

    DS.ejectAll('comment');

    $httpBackend.expectGET('http://test.angular-cache.com/comment?content=test').respond(200, [testComment, testComment2]);

    DS.findAll('comment', {
      content: 'test'
    }, {
      bypassCache: true,
      params: {
        approvedBy: false
      }
    }).then(function (comments) {
      assert.deepEqual(angular.toJson(comments), angular.toJson([testComment, testComment2]));
      assert.deepEqual(angular.toJson(comments), angular.toJson(DS.filter('comment', {
        content: 'test'
      })));
      done();
    }, function () {
      done('Should not have failed!');
    });

    setTimeout(function () {
      try {
        $httpBackend.flush();
      } catch (e) {
        done(e);
      }
    }, 30);
  });
});
