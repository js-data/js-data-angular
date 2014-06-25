describe('DS.filter(resourceName[, params][, options])', function () {
  var errorPrefix = 'DS.filter(resourceName[, params][, options]): ';

  beforeEach(startInjector);

  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      DS.filter('does not exist');
    }, DS.errors.RuntimeError, errorPrefix + 'does not exist is not a registered resource!');

    angular.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (key) {
        assert.throws(function () {
          DS.filter('post', key);
        }, DS.errors.IllegalArgumentError, errorPrefix + 'params: Must be an object!');
      }
    });

    DS.inject('post', p1);

    angular.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (key) {
        assert.throws(function () {
          DS.filter('post', {}, key);
        }, DS.errors.IllegalArgumentError, errorPrefix + 'options: Must be an object!');
      }
    });

    DS.filter('post');
  });
  it('should return an empty array if the query has never been made before', function () {
    $httpBackend.expectGET('http://test.angular-cache.com/posts?where=%7B%22author%22:%7B%22%3D%3D%22:%22John%22%7D%7D').respond(200, [p1]);

    assert.deepEqual(DS.filter('post', {
      where: {
        author: {
          '==': 'John'
        }
      }
    }, { loadFromServer: true }), [], 'should be an empty array');

    assert.deepEqual(DS.filter('post', {
      where: {
        author: {
          '==': 'John'
        }
      }
    }, { loadFromServer: true }), [], 'should still be an empty array because the request is pending');

    $httpBackend.flush();

    assert.deepEqual(DS.filter('post', {
      where: {
        author: {
          '==': 'John'
        }
      }
    }), [
      p1
    ], 'should no longer be empty');
  });
  it('should correctly apply "where" predicates', function () {
    assert.doesNotThrow(function () {
      DS.inject('post', p1);
      DS.inject('post', p2);
      DS.inject('post', p3);
      DS.inject('post', p4);
    }, Error, 'should not throw an error');

    assert.equal(lifecycle.beforeInject.callCount, 4);
    assert.equal(lifecycle.afterInject.callCount, 4);

    var params = {
      where: {
        author: 'John'
      }
    };

    assert.deepEqual(DS.filter('post', params), [p1], 'should default a string to "=="');

    params.where.author = {
      '==': 'John'
    };

    assert.deepEqual(DS.filter('post', params), [p1], 'should accept normal "==" clause');

    params.where.author = {
      '===': null
    };

    assert.deepEqual(DS.filter('post', params), [], 'should accept normal "===" clause');

    params.where.author = {
      '!=': 'John'
    };

    assert.deepEqual(DS.filter('post', params), [p2, p3, p4], 'should accept normal "!=" clause');

    params.where = {
      age: {
        '>': 31
      }
    };

    assert.deepEqual(DS.filter('post', params), [p3, p4], 'should accept normal ">" clause');

    params.where = {
      age: {
        '>=': 31
      }
    };

    assert.deepEqual(DS.filter('post', params), [p2, p3, p4], 'should accept normal ">=" clause');

    params.where = {
      age: {
        '<': 31
      }
    };

    assert.deepEqual(DS.filter('post', params), [p1], 'should accept normal "<" clause');

    params.where = {
      age: {
        '<=': 31
      }
    };

    assert.deepEqual(DS.filter('post', params), [p1, p2], 'should accept normal "<=" clause');

    params.where = {
      age: {
        'in': [30, 33]
      },
      author: {
        'in': ['John', 'Sally', 'Adam']
      }
    };

    assert.deepEqual(DS.filter('post', params), [p1, p4], 'should accept normal "in" clause');

    params.where = { age: { garbage: 'should have no effect' } };

    assert.deepEqual(DS.filter('post', params), [p1, p2, p3, p4], 'should return all elements');
  });
  it('should correctly apply "orderBy" predicates', function () {
    assert.doesNotThrow(function () {
      DS.inject('post', p1);
      DS.inject('post', p2);
      DS.inject('post', p3);
      DS.inject('post', p4);
    }, Error, 'should not throw an error');

    var params = {
      orderBy: 'age'
    };

    assert.deepEqual(DS.filter('post', params), [p1, p2, p3, p4], 'should accept a single string and sort in ascending order for numbers');

    params.orderBy = 'author';

    assert.deepEqual(DS.filter('post', params), [p4, p1, p3, p2], 'should accept a single string and sort in ascending for strings');

    params.orderBy = [
      ['age', 'DESC']
    ];

    assert.deepEqual(DS.filter('post', params), [p4, p3, p2, p1], 'should accept an array of an array and sort in descending for numbers');

    params.orderBy = [
      ['author', 'DESC']
    ];

    assert.deepEqual(DS.filter('post', params), [p2, p3, p1, p4], 'should accept an array of an array and sort in descending for strings');

    params.orderBy = ['age'];

    assert.deepEqual(DS.filter('post', params), [p1, p2, p3, p4], 'should accept an array of a string and sort in ascending for numbers');

    params.orderBy = ['author'];

    assert.deepEqual(DS.filter('post', params), [p4, p1, p3, p2], 'should accept an array of a string and sort in ascending for strings');
  });
  it('should correctly apply "skip" predicates', function () {
    assert.doesNotThrow(function () {
      DS.inject('post', p1);
      DS.inject('post', p2);
      DS.inject('post', p3);
      DS.inject('post', p4);
    }, Error, 'should not throw an error');

    var params = {
      skip: 1
    };

    assert.deepEqual(DS.filter('post', params), [p2, p3, p4], 'should skip 1');

    params.skip = 2;
    assert.deepEqual(DS.filter('post', params), [p3, p4], 'should skip 2');

    params.skip = 3;
    assert.deepEqual(DS.filter('post', params), [p4], 'should skip 3');

    params.skip = 4;
    assert.deepEqual(DS.filter('post', params), [], 'should skip 4');
  });
  it('should correctly apply "limit" predicates', function () {
    assert.doesNotThrow(function () {
      DS.inject('post', p1);
      DS.inject('post', p2);
      DS.inject('post', p3);
      DS.inject('post', p4);
    }, Error, 'should not throw an error');

    var params = {
      limit: 1
    };

    assert.deepEqual(DS.filter('post', params), [p1], 'should limit to 1');

    params.limit = 2;
    assert.deepEqual(DS.filter('post', params), [p1, p2], 'should limit to 2');

    params.limit = 3;
    assert.deepEqual(DS.filter('post', params), [p1, p2, p3], 'should limit to 3');

    params.limit = 4;
    assert.deepEqual(DS.filter('post', params), [p1, p2, p3, p4], 'should limit to 4');
  });
  it('should correctly apply "limit" and "skip" predicates together', function () {
    assert.doesNotThrow(function () {
      DS.inject('post', p1);
      DS.inject('post', p2);
      DS.inject('post', p3);
      DS.inject('post', p4);
    }, Error, 'should not throw an error');

    var params = {
      limit: 1,
      skip: 1
    };

    assert.deepEqual(DS.filter('post', params), [p2], 'should limit to 1 and skip 2');

    params.limit = 2;
    assert.deepEqual(DS.filter('post', params), [p2, p3], 'should limit to 2 and skip 1');

    params.skip = 2;
    assert.deepEqual(DS.filter('post', params), [p3, p4], 'should limit to 2 and skip 2');

    params.limit = 1;
    params.skip = 3;
    assert.deepEqual(DS.filter('post', params), [p4], 'should limit to 1 and skip 3');

    params.limit = 8;
    params.skip = 0;
    assert.deepEqual(DS.filter('post', params), [p1, p2, p3, p4], 'should return all items');

    params.limit = 1;
    params.skip = 5;
    assert.deepEqual(DS.filter('post', params), [], 'should return nothing if skip if greater than the number of items');

    params.limit = 8;
    delete params.skip;
    assert.deepEqual(DS.filter('post', params), [p1, p2, p3, p4], 'should return all items');

    delete params.limit;
    params.skip = 5;
    assert.deepEqual(DS.filter('post', params), [], 'should return nothing if skip if greater than the number of items');
  });
  it('should allow custom filter function', function () {
    DS.defineResource({
      name: 'comment',
      filter: function (collection, resourceName, params, options) {
        var filtered = collection;
        var where = params.where;
        filtered = this.utils.filter(filtered, function (attrs) {
          return attrs.author === where.author.EQUALS || attrs.age % where.age.MOD === 1;
        });
        return filtered;
      }
    });
    assert.doesNotThrow(function () {
      DS.inject('comment', p1);
      DS.inject('comment', p2);
      DS.inject('comment', p3);
      DS.inject('comment', p4);
    }, Error, 'should not throw an error');

    var params = {
      where: {
        author: {
          'EQUALS': 'John'
        },
        age: {
          'MOD': 30
        }
      }
    };

    assert.deepEqual(DS.filter('comment', params), [p1, p2], 'should keep p1 and p2');
  });
});
