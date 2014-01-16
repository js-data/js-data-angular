describe('DS.eject(resourceName, id)', function () {
	var errorPrefix = 'DS.eject(resourceName, id): ';

	it('should throw an error when method pre-conditions are not met', function (done) {
		assert.throws(function () {
			DS.eject('does not exist', 5);
		}, DS.errors.RuntimeError, errorPrefix + 'does not exist is not a registered resource!');

		angular.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
			if (key) {
				assert.throws(function () {
					DS.eject('post', key);
				}, DS.errors.IllegalArgumentError, errorPrefix + 'id: Must be a string or a number!');
			}
		});

		done();
	});
	it('should do nothing if the item is not in the store', function (done) {

		assert.equal(DS.lastModified('post', 5), 0);
		assert.doesNotThrow(function () {
			DS.eject('post', 5);
		});
		assert.equal(DS.lastModified('post', 5), 0);

		done();
	});
	it('should eject an item from the store', function (done) {

		DS.inject('post', p3);
		DS.inject('post', p2);
		DS.inject('post', p1);
		assert.notEqual(DS.lastModified('post', 5), 0);
		assert.doesNotThrow(function () {
			DS.eject('post', 5);
		});
		assert.isUndefined(DS.get('post', 5));
		assert.equal(DS.lastModified('post', 5), 0);

		done();
	});
	it('should eject all items from the store', function (done) {

		DS.inject('post', p1);
		DS.inject('post', p2);
		DS.inject('post', p3);
		DS.inject('post', p4);

		assert.deepEqual(DS.get('post', 5), p1);
		assert.deepEqual(DS.get('post', 6), p2);
		assert.deepEqual(DS.get('post', 7), p3);
		assert.deepEqual(DS.get('post', 8), p4);

		assert.doesNotThrow(function () {
			DS.eject('post');
		});

		assert.isUndefined(DS.get('post', 5));
		assert.isUndefined(DS.get('post', 6));
		assert.isUndefined(DS.get('post', 7));
		assert.isUndefined(DS.get('post', 8));

		done();
	});
});
