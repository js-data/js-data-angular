describe('DS.hasChanges(resourceName, id)', function () {
  function errorPrefix(resourceName, id) {
    return 'DS.hasChanges(' + resourceName + ', ' + id + '): ';
  }

  beforeEach(startInjector);

  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      DS.hasChanges('does not exist', {});
    }, DS.errors.NonexistentResourceError, errorPrefix('does not exist', {}) + 'does not exist is not a registered resource!');

    angular.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      assert.throws(function () {
        DS.hasChanges('post', key);
      }, DS.errors.IllegalArgumentError, errorPrefix('post', key) + 'id: Must be a string or a number!');
    });
  });
  it('should return false if the item is not in the store', function () {
    assert.isFalse(DS.hasChanges('post', 5));
  });
  it('should return whether an item has changes', function () {

    DS.inject('post', p1);

    assert.isFalse(DS.hasChanges('post', 5));

    var post = DS.get('post', 5);
    post.author = 'Jake';

    DS.digest();

    assert.isTrue(DS.hasChanges('post', 5));
  });
  it('should return false for resources with defined methods', function () {
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

    assert.isFalse(DS.hasChanges('person', 1));
  });
  it('should return false after loading relations', function () {
    DS.inject('user', user10);

    $httpBackend.expectGET('http://test.angular-cache.com/organization/14?userId=10').respond(200, organization14);
    $httpBackend.expectGET('http://test.angular-cache.com/user/10/comment?userId=10').respond(200, [
      comment11,
      comment12,
      comment13
    ]);
    $httpBackend.expectGET('http://test.angular-cache.com/profile?userId=10').respond(200, profile15);

    DS.loadRelations('user', 10, ['comment', 'profile', 'organization'], { params: { approvedBy: 10 } }).then(function () {
      assert.isFalse(DS.hasChanges('user', 10));
    }, fail);

    $httpBackend.flush();

    // try a comment that has a belongsTo relationship to multiple users:
    DS.inject('comment', comment19);
    $httpBackend.expectGET('http://test.angular-cache.com/user/20').respond(200, user20);
    $httpBackend.expectGET('http://test.angular-cache.com/user/19').respond(200, user19);
    DS.loadRelations('comment', 19, ['user']).then(function () {
      assert.isFalse(DS.hasChanges('comment', 19));
    }, fail);
    $httpBackend.flush();
  });
});
