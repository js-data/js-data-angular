describe('DS.createInstance(resourceName[, attrs][, options])', function () {
  function errorPrefix(resourceName) {
    return 'DS.createInstance(' + resourceName + '[, attrs][, options]): ';
  }

  beforeEach(startInjector);

  it('should throw an error when method pre-conditions are not met', function () {
    assert.throws(function () {
      DS.createInstance('fruit loops');
    }, DS.errors.NonexistentResourceError, errorPrefix('fruit loops') + 'fruit loops is not a registered resource!');

    angular.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (!key) {
        return;
      }
      assert.throws(function () {
        DS.createInstance('post', key);
      }, DS.errors.IllegalArgumentError, errorPrefix('post') + 'attrs: Must be an object!');
    });

    angular.forEach(TYPES_EXCEPT_OBJECT, function (key) {
      if (!key) {
        return;
      }
      assert.throws(function () {
        DS.createInstance('post', {}, key);
      }, DS.errors.IllegalArgumentError, errorPrefix('post') + 'options: Must be an object!');
    });
  });

  it('create an instance', function () {
    DS.defineResource({
      name: 'person',
      methods: {
        fullName: function () {
          return this.first + ' ' + this.last;
        }
      },
      computed: {
        fullName: ['first', 'last', function (first, last) {
          return first + ' ' + last;
        }]
      }
    });

    DS.defineResource({
      name: 'dog',
      useClass: true
    });

    DS.defineResource({
      name: 'cat'
    });

    var personAttrs = {
      first: 'John',
      last: 'Anderson'
    };

    var dogAttrs = {
      name: 'Spot'
    };

    var person = DS.createInstance('person', personAttrs);
    var dog = DS.createInstance('dog', dogAttrs, { useClass: false });
    var cat = DS.createInstance('cat');

    assert.deepEqual(JSON.stringify(person), JSON.stringify(personAttrs));
    assert.deepEqual(dog, dogAttrs);
    assert.deepEqual(JSON.stringify(cat), JSON.stringify({}));

    assert.isTrue(person instanceof DS.definitions.person[DS.definitions.person.class]);
    assert.isTrue(dog instanceof Object);
    assert.isTrue(cat instanceof DS.definitions.cat[DS.definitions.cat.class]);

    person = DS.createInstance('person', { first: 'John', last: 'Doe' });

    person.DSCompute();

    assert.equal(person.fullName, 'John Doe');

    var person2 = DS.inject('person', { id: 2, first: 'John', last: 'Doe' });

    DS.compute('person', 2);

    assert.equal(person2.fullName, 'John Doe');

    var person3 = DS.inject('person', { id: 3, first: 'John', last: 'Doe' });

    DS.compute('person', person3);

    assert.equal(person3.fullName, 'John Doe');
  });
});
