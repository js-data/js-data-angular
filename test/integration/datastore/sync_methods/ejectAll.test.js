describe('DS.ejectAll(resourceName[, params])', function () {
	var errorPrefix = 'DS.ejectAll(resourceName[, params]): ';

	it('should throw an error when method pre-conditions are not met', function (done) {
		assert.throws(function () {
			DS.ejectAll('does not exist');
		}, DS.errors.RuntimeError, errorPrefix + 'does not exist is not a registered resource!');

		angular.forEach(TYPES_EXCEPT_OBJECT, function (key) {
			if (key) {
				assert.throws(function () {
					DS.ejectAll('post', key);
				}, DS.errors.IllegalArgumentError, errorPrefix + 'params: Must be an object!');
			}
		});

		done();
	});
	it('should eject items that meet the criteria from the store', function (done) {

		DS.inject('post', p1);
		DS.inject('post', p2);
		DS.inject('post', p3);
		DS.inject('post', p4);
		DS.inject('post', p5);
		assert.doesNotThrow(function () {
			DS.ejectAll('post', { query: { where: { author: 'Adam' } } });
		});
		assert.isDefined(DS.get('post', 5));
		assert.isDefined(DS.get('post', 6));
		assert.isDefined(DS.get('post', 7));
		assert.isUndefined(DS.get('post', 8));
		assert.isUndefined(DS.get('post', 9));

		done();
	});
	it('should eject items that meet the criteria from the store 2', function (done) {

		DS.inject('post', p1);
		DS.inject('post', p2);
		DS.inject('post', p3);
		DS.inject('post', p4);
		DS.inject('post', p5);

		try {
			DS.ejectAll('post', { query: { where: { age: 33 } } });
		} catch (err) {
			console.log(err.stack);
		}
		assert.doesNotThrow(function () {
			DS.ejectAll('post', { query: { where: { age: 33 } } });
		});

		assert.isDefined(DS.get('post', 5));
		assert.isDefined(DS.get('post', 6));
		assert.isDefined(DS.get('post', 7));
		assert.isUndefined(DS.get('post', 8));
		assert.isUndefined(DS.get('post', 9));

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
			DS.ejectAll('post');
		});

		assert.isUndefined(DS.get('post', 5));
		assert.isUndefined(DS.get('post', 6));
		assert.isUndefined(DS.get('post', 7));
		assert.isUndefined(DS.get('post', 8));

		done();
	});
});
