describe('DS.destroy(resourceName, id)', function () {
	var errorPrefix = 'DS.destroy(resourceName, id): ';

	it('should throw an error when method pre-conditions are not met', function (done) {
		DS.destroy('does not exist', 5).then(function () {
			fail('should have rejected');
		}, function (err) {
			assert.isTrue(err instanceof DS.errors.RuntimeError);
			assert.equal(err.message, errorPrefix + 'does not exist is not a registered resource!');
		});

		angular.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
			DS.destroy('post', key).then(function () {
				fail('should have rejected');
			}, function (err) {
				assert.isTrue(err instanceof DS.errors.IllegalArgumentError);
				assert.equal(err.message, errorPrefix + 'id: Must be a string or a number!');
			});
		});

		done();
	});
	it('should delete an item from the data store', function (done) {
		$httpBackend.expectDELETE('http://test.angular-cache.com/posts/5').respond(200, 5);

		DS.inject('post', p1);

		DS.destroy('post', 5).then(function (id) {
			assert.equal(id, 5, 'post 5 should have been deleted');
		}, function (err) {
			console.error(err.stack);
			fail('should not have rejected');
		});

		$httpBackend.flush();

		assert.equal(lifecycle.beforeDestroy.callCount, 1, 'beforeDestroy should have been called');
		assert.equal(lifecycle.afterDestroy.callCount, 1, 'afterDestroy should have been called');
		assert.isUndefined(DS.get('post', 5));
		assert.equal(DS.lastModified('post', 5), 0);
		assert.equal(DS.lastSaved('post', 5), 0);

		done();
	});
});
