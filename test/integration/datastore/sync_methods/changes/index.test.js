describe('DS.changes(resourceName, id)', function () {
	var errorPrefix = 'DS.changes(resourceName, id): ';

	it('should throw an error when method pre-conditions are not met', function (done) {
		assert.throws(function () {
			DS.changes('does not exist', {});
		}, DS.errors.RuntimeError, errorPrefix + 'does not exist is not a registered resource!');

		angular.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
			assert.throws(function () {
				DS.changes('post', key);
			}, DS.errors.IllegalArgumentError, errorPrefix + 'id: Must be a string or a number!');
		});

		done();
	});
	it('should return false if the item is not in the store', function (done) {

		assert.isUndefined(DS.changes('post', 5));
		done();
	});
	it('should return the changes in an object', function (done) {

		DS.inject('post', p1);

		assert.deepEqual(DS.changes('post', 5), {added: {}, changed: {}, removed: {}});

		var post = DS.get('post', 5);
		post.author = 'Jake';

		DS.digest();

		assert.deepEqual(DS.changes('post', 5), {added: {}, changed: {
			author: 'Jake'
		}, removed: {}});

		done();
	});
});
