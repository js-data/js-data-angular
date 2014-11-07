describe('DS.getAll(resourceName)', function () {
  function errorPrefix(resourceName) {
    return 'DS.getAll(' + resourceName + '[, ids]): ';
  }

  beforeEach(startInjector);

  it('should throw an error when method pre-conditions are not met', function () {
  	assert.throws(function () {
      DS.getAll('does not exist');
    }, DS.errors.NonexistentResourceError, errorPrefix('does not exist', {}) + 'does not exist is not a registered resource!');

  	angular.forEach(TYPES_EXCEPT_ARRAY, function (key) {
      if (key) {
        assert.throws(function () {
          DS.getAll('post', key);
        }, DS.errors.IllegalArgumentError, errorPrefix('post', key) + 'ids: Must be an array!');
      }
    });
  });
  it('should return an array of all items in the store', function() {
  	assert.isArray(DS.getAll('post'), 'should be an array');
    assert.equal(DS.getAll('post').length, 0, 'should be an empty array');
    DS.inject('post', p1);
    DS.inject('post', p2);
    DS.inject('post', p3);
    assert.isArray(DS.getAll('post'), 'should be an array');
    assert.equal(DS.getAll('post').length, 3, 'should be an array of length 3');
    assert.deepEqual(DS.getAll('post'), DS.filter('post', {}));
  });
  it('should return results that match a set of ids', function() {
  	DS.inject('post', [ p1, p2, p3 ]);
  	var posts = DS.getAll('post', [ 5, 7 ]);
  	assert.deepEqual(angular.toJson(posts), angular.toJson([ p1, p3 ]));
  });
});
