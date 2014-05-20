describe('DS.create(resourceName, attrs[, options])', function () {
	var errorPrefix = 'DS.create(resourceName, attrs[, options]): ';

	beforeEach(startInjector);

	it('should throw an error when method pre-conditions are not met', function () {
		DS.create('does not exist', 5).then(function () {
			fail('should have rejected');
		}, function (err) {
			assert.isTrue(err instanceof DS.errors.RuntimeError);
			assert.equal(err.message, errorPrefix + 'does not exist is not a registered resource!');
		});

		angular.forEach(TYPES_EXCEPT_OBJECT, function (key) {
			DS.create('post', key).then(function () {
				fail('should have rejected');
			}, function (err) {
				assert.isTrue(err instanceof DS.errors.IllegalArgumentError);
				assert.equal(err.message, errorPrefix + 'attrs: Must be an object!');
			});
		});
	});
	it('should create an item and save it to the server', function () {
		$httpBackend.expectPOST('http://test.angular-cache.com/posts').respond(200, p1);

		DS.create('post', { author: 'John', age: 30 }).then(function (post) {
			assert.deepEqual(post, p1, 'post 5 should have been created');
		}, function (err) {
			console.error(err.stack);
			fail('should not have rejected');
		});

		$httpBackend.flush();

		assert.equal(lifecycle.beforeCreate.callCount, 1, 'beforeCreate should have been called');
		assert.equal(lifecycle.afterCreate.callCount, 1, 'afterCreate should have been called');
		assert.equal(lifecycle.beforeInject.callCount, 1, 'beforeInject should have been called');
		assert.equal(lifecycle.afterInject.callCount, 1, 'afterInject should have been called');
		assert.equal(lifecycle.serialize.callCount, 1, 'serialize should have been called');
		assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
		assert.deepEqual(DS.get('post', 5), p1);
	});
});
