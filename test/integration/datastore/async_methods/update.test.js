describe('DS.update(resourceName, id, attrs[, options])', function () {
	var errorPrefix = 'DS.update(resourceName, id, attrs[, options]): ';

	beforeEach(startInjector);

	it('should throw an error when method pre-conditions are not met', function () {
		DS.update('does not exist', 5).then(function () {
			fail('should have rejected');
		}, function (err) {
			assert.isTrue(err instanceof DS.errors.RuntimeError);
			assert.equal(err.message, errorPrefix + 'does not exist is not a registered resource!');
		});

		angular.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
			DS.update('post', key).then(function () {
				fail('should have rejected');
			}, function (err) {
				assert.isTrue(err instanceof DS.errors.IllegalArgumentError);
				assert.equal(err.message, errorPrefix + 'id: Must be a string or a number!');
			});
		});

		angular.forEach(TYPES_EXCEPT_OBJECT, function (key) {
			if (key) {
				DS.update('post', 5, key).then(function () {
					fail('should have rejected');
				}, function (err) {
					assert.isTrue(err instanceof DS.errors.IllegalArgumentError);
					assert.equal(err.message, errorPrefix + 'attrs: Must be an object!');
				});
			}
		});

		angular.forEach(TYPES_EXCEPT_OBJECT, function (key) {
			if (key) {
				DS.update('post', 5, {}, key).then(function () {
					fail('should have rejected');
				}, function (err) {
					assert.isTrue(err instanceof DS.errors.IllegalArgumentError);
					assert.equal(err.message, errorPrefix + 'options: Must be an object!');
				});
			}
		});
	});
	it('should update an item', function () {
		$httpBackend.expectPUT('http://test.angular-cache.com/posts/5').respond(200, { author: 'Jake', age: 30, id: 5 });

		var post = DS.inject('post', p1);

		var initialModified = DS.lastModified('post', 5),
			initialSaved = DS.lastSaved('post', 5);

		DS.update('post', 5, { author: 'Jake' }).then(function (p) {
			assert.deepEqual(p, post, 'post 5 should have been updated');
			assert.equal(p.author, 'Jake');
			assert.equal(post.author, 'Jake');
		}, function (err) {
			console.error(err.stack);
			fail('should not have rejected');
		});

		$httpBackend.flush();
		$httpBackend.expectPUT('http://test.angular-cache.com/posts/6').respond(200, { author: 'Jane', age: 31, id: 6 });

		assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
		assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
		assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called');
		assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called');
		assert.equal(lifecycle.serialize.callCount, 1, 'serialize should have been called');
		assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
		assert.deepEqual(DS.get('post', 5), post);
		assert.notEqual(DS.lastModified('post', 5), initialModified);
		assert.notEqual(DS.lastSaved('post', 5), initialSaved);

		DS.update('post', 6, { author: 'Jane' }).then(function (p) {
			assert.deepEqual(p, DS.get('post', 6));
			assert.deepEqual(p, { author: 'Jane', age: 31, id: 6 });
		}, function (err) {
			console.error(err.stack);
			fail('should not have rejected');
		});

		$httpBackend.flush();

		assert.equal(lifecycle.beforeInject.callCount, 3, 'beforeInject should have been called');
		assert.equal(lifecycle.afterInject.callCount, 3, 'afterInject should have been called');
		assert.equal(lifecycle.serialize.callCount, 2, 'serialize should have been called');
		assert.equal(lifecycle.deserialize.callCount, 2, 'deserialize should have been called');
	});
});
