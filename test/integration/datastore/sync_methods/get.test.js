describe('DS.get(resourceName, id[, options])', function () {
	var errorPrefix = 'DS.get(resourceName, id[, options]): ';

	beforeEach(startInjector);

	it('should throw an error when method pre-conditions are not met', function () {
		assert.throws(function () {
			DS.get('does not exist', {});
		}, DS.errors.RuntimeError, errorPrefix + 'does not exist is not a registered resource!');

		angular.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
			assert.throws(function () {
				DS.get('post', key);
			}, DS.errors.IllegalArgumentError, errorPrefix + 'id: Must be a string or a number!');
		});

		angular.forEach(TYPES_EXCEPT_OBJECT, function (key) {
			if (key) {
				assert.throws(function () {
					DS.get('post', 5, key);
				}, DS.errors.IllegalArgumentError, errorPrefix + 'options: Must be an object!');
			}
		});
	});
	it('should return undefined if the query has never been made before', function () {
		assert.isUndefined(DS.get('post', 5), 'should be undefined');
	});
	it('should return undefined and send the query to the server if the query has never been made before and loadFromServer is set to true', function () {
		$httpBackend.expectGET('http://test.angular-cache.com/posts/5').respond(200, p1);

		assert.isUndefined(DS.get('post', 5, { loadFromServer: true }), 'should be undefined');

		// There should only be one GET request, so this should have no effect.
		assert.isUndefined(DS.get('post', 5, { loadFromServer: true }), 'should be undefined');

		$httpBackend.flush();

		assert.deepEqual(DS.get('post', 5), p1, 'p1 should now be in the store');
		assert.isNumber(DS.lastModified('post', 5));
		assert.isNumber(DS.lastSaved('post', 5));
	});
});
