describe('DS.changes(resourceName, id)', function () {
  function errorPrefix(resourceName) {
    return 'DS.changes(' + resourceName + ', id): ';
  }

  beforeEach(startInjector);

  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      DS.changes('does not exist', {});
    }, DS.errors.NonexistentResourceError, errorPrefix('does not exist') + 'does not exist is not a registered resource!');

    angular.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
      assert.throws(function () {
        DS.changes('post', key);
      }, DS.errors.IllegalArgumentError, errorPrefix('post') + 'id: Must be a string or a number!');
    });
  });
  it('should return false if the item is not in the store', function () {
    assert.isUndefined(DS.changes('post', 5));
  });
  it('should return the changes in an object', function () {

    DS.inject('post', p1);

    assert.deepEqual(DS.changes('post', 5), {added: {}, changed: {}, removed: {}});

    var post = DS.get('post', 5);
    post.author = 'Jake';

    DS.digest();

    assert.deepEqual(DS.changes('post', 5), {added: {}, changed: {
      author: 'Jake'
    }, removed: {}});
  });
  it('should ignore default blacklisted changes in an object', function () {

    DS.inject('post', p1);

    assert.deepEqual(DS.changes('post', 5), {added: {}, changed: {}, removed: {}});
    var post = DS.get('post', 5);

    post.$$hashKey = '$123';
    post.$$id = '321';

    DS.digest();

    assert.deepEqual(DS.changes('post', 5), {added: {}, changed: {}, removed: {}});
  });
  it('should ignore per resource blacklisted changes in an object', function () {

    var Thing = DS.defineResource({
      name: 'thing',
      ignoredChanges: [/\$|\_/]
    });

    var thing = Thing.inject({ id: 1, $$hashKey: '$123', _thing: 'thing' });

    assert.deepEqual(Thing.changes(1), {added: {}, changed: {}, removed: {}});

    thing.$$hashKey = '$567';
    thing._thing = 'gniht';

    Thing.digest();

    assert.deepEqual(Thing.changes(1), {added: {}, changed: {}, removed: {}});
  });
  it('should ignore per method call blacklisted changes in an object', function () {

    var Thing = DS.defineResource({
      name: 'thing',
      ignoredChanges: [/\$|\_/]
    });

    var thing = Thing.inject({ id: 1, $$hashKey: '$123', _thing: 'thing' });

    assert.deepEqual(Thing.changes(1, {
      ignoredChanges: [/\$/]
    }), {added: {}, changed: {}, removed: {}});

    thing.$$hashKey = '$567';
    thing._thing = 'gniht';

    Thing.digest();

    assert.deepEqual(Thing.changes(1, {
      ignoredChanges: [/\$/]
    }), {added: {}, changed: {
      '_thing': 'gniht'
    }, removed: {}});
  });
});
