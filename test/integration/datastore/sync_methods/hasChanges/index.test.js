describe('DS.hasChanges(resourceName, id)', function () {
	var errorPrefix = 'DS.hasChanges(resourceName, id): ';

	it('should throw an error when method pre-conditions are not met', function (done) {
		assert.throws(function () {
			DS.hasChanges('does not exist', {});
		}, DS.errors.RuntimeError, errorPrefix + 'does not exist is not a registered resource!');

		angular.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
			assert.throws(function () {
				DS.hasChanges('post', key);
			}, DS.errors.IllegalArgumentError, errorPrefix + 'id: Must be a string or a number!');
		});

		done();
	});
	it('should return false if the item is not in the store', function (done) {

		assert.isFalse(DS.hasChanges('post', 5));
		done();
	});
	it('should return whether an item has changes', function (done) {

		DS.inject('post', p1);

		assert.isFalse(DS.hasChanges('post', 5));

		var post = DS.get('post', 5);
		post.author = 'Jake';

		DS.digest();

		assert.isTrue(DS.hasChanges('post', 5));

		done();
	});
});
