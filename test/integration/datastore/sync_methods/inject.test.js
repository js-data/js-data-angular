describe('DS.inject(resourceName, attrs[, options])', function () {
	var errorPrefix = 'DS.inject(resourceName, attrs[, options]): ';

	beforeEach(startInjector);

	it('should throw an error when method pre-conditions are not met', function () {
		assert.throws(function () {
			DS.inject('does not exist', {});
		}, DS.errors.RuntimeError, errorPrefix + 'does not exist is not a registered resource!');

		angular.forEach(TYPES_EXCEPT_OBJECT, function (key) {
			assert.throws(function () {
				DS.inject('post', key);
			}, DS.errors.IllegalArgumentError, errorPrefix + 'attrs: Must be an object or an array!');
		});

		angular.forEach(TYPES_EXCEPT_OBJECT, function (key) {
			if (key) {
				assert.throws(function () {
					DS.inject('post', {}, key);
				}, DS.errors.IllegalArgumentError, errorPrefix + 'options: Must be an object!');
			}
		});

		assert.throws(function () {
			DS.inject('post', {});
		}, DS.errors.RuntimeError, errorPrefix + 'attrs: Must contain the property specified by `idAttribute`!');
	});
	it('should inject an item into the store', function () {

		assert.equal(DS.lastModified('post', 5), 0);
		assert.doesNotThrow(function () {
			assert.deepEqual(DS.inject('post', p1), p1);
		});
		assert.notEqual(DS.lastModified('post', 5), 0);
		assert.isNumber(DS.lastModified('post', 5));
	});
	it('should inject an item into the store', function () {

		assert.equal(DS.lastModified('post', 5), 0);
		assert.doesNotThrow(function () {
			assert.deepEqual(DS.inject('post', p1), p1);
		});
		assert.notEqual(DS.lastModified('post', 5), 0);
		assert.isNumber(DS.lastModified('post', 5));

		var post = DS.get('post', 5);

		post.id = 10;

		DS.digest();

		assert.deepEqual('Doh! You just changed the primary key of an object! ' +
			'I don\'t know how to handle this yet, so your data for the "post' +
			'" resource is now in an undefined (probably broken) state.', $log.error.logs[0][0]);
	});
	it('should inject multiple items into the store', function () {

		assert.doesNotThrow(function () {
			assert.deepEqual(DS.inject('post', [p1, p2, p3, p4]), [p1, p2, p3, p4]);
		});

		assert.deepEqual(DS.get('post', 5), p1);
		assert.deepEqual(DS.get('post', 6), p2);
		assert.deepEqual(DS.get('post', 7), p3);
		assert.deepEqual(DS.get('post', 8), p4);
	});
});
