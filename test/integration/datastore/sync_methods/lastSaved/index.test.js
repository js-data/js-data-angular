describe('DS.lastSaved(resourceName[, id])', function () {
	var errorPrefix = 'DS.lastSaved(resourceName[, id]): ';

	it('should throw an error when method pre-conditions are not met', function (done) {
		assert.throws(function () {
			DS.lastSaved('does not exist', {});
		}, DS.errors.RuntimeError, errorPrefix + 'does not exist is not a registered resource!');

		angular.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
			if (key) {
				assert.throws(function () {
					DS.lastSaved('post', key);
				}, DS.errors.IllegalArgumentError, errorPrefix + 'id: Must be a string or a number!');
			}
		});

		done();
	});
	it('should lastSaved an item into the store', function (done) {

		assert.equal(DS.lastSaved('post', 5), 0);
		assert.equal(DS.lastSaved('post'), 0);

		assert.doesNotThrow(function () {
			DS.inject('post', p1);
		});

		$httpBackend.expectPUT('http://test.angular-cache.com/posts/5').respond(200, p1);

		var post = DS.get('post', 5);

		post.author = 'Jake';

		DS.save('post', 5);

		$httpBackend.flush();

		assert.notEqual(DS.lastSaved('post', 5), 0);
		assert.isNumber(DS.lastSaved('post', 5));

		done();
	});
//	it('should lastSaved an item into the store', function (done) {
//
//		assert.equal(DS.lastSaved('post', 5), 0);
//		assert.doesNotThrow(function () {
//			assert.deepEqual(DS.lastSaved('post', p1), p1);
//		});
//		assert.notEqual(DS.lastSaved('post', 5), 0);
//		assert.isNumber(DS.lastSaved('post', 5));
//
//		var post = DS.get('post', 5);
//
//		post.id = 10;
//
//		DS.digest();
//
//		assert.deepEqual('Doh! You just changed the primary key of an object! ' +
//			'I don\'t know how to handle this yet, so your data for the "post' +
//			'" resource is now in an undefined (probably broken) state.', $log.error.logs[0][0]);
//
//		done();
//	});
});
