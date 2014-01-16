describe('DS.save(resourceName, id[, options])', function () {
	var errorPrefix = 'DS.save(resourceName, id[, options]): ';

	it('should throw an error when method pre-conditions are not met', function (done) {
		DS.save('does not exist', 5).then(function () {
			fail('should have rejected');
		}, function (err) {
			assert.isTrue(err instanceof DS.errors.RuntimeError);
			assert.equal(err.message, errorPrefix + 'does not exist is not a registered resource!');
		});

		angular.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
			DS.save('post', key).then(function () {
				fail('should have rejected');
			}, function (err) {
				assert.isTrue(err instanceof DS.errors.IllegalArgumentError);
				assert.equal(err.message, errorPrefix + 'id: Must be a string or a number!');
			});
		});

		angular.forEach(TYPES_EXCEPT_OBJECT, function (key) {
			if (key) {
				DS.save('post', 5, key).then(function () {
					fail('should have rejected');
				}, function (err) {
					assert.isTrue(err instanceof DS.errors.IllegalArgumentError);
					assert.equal(err.message, errorPrefix + 'options: Must be an object!');
				});
			}
		});

		done();
	});
	it('should save an item to the server', function (done) {
		$httpBackend.expectPUT('http://test.angular-cache.com/posts/5').respond(200, p1);

		DS.inject('post', p1);

		var initialModified = DS.lastModified('post', 5),
			initialSaved = DS.lastSaved('post', 5);

		p1.author = 'Jake';

		DS.save('post', 5).then(function (post) {
			assert.deepEqual(post, p1, 'post 5 should have been saved');
			assert.equal(post.author, 'Jake');
		}, function (err) {
			console.error(err.stack);
			fail('should not have rejected');
		});

		$httpBackend.flush();

		assert.equal(lifecycle.beforeUpdate.callCount, 1, 'beforeUpdate should have been called');
		assert.equal(lifecycle.afterUpdate.callCount, 1, 'afterUpdate should have been called');
		assert.deepEqual(DS.get('post', 5), p1);
		assert.notEqual(DS.lastModified('post', 5), initialModified);
		assert.notEqual(DS.lastSaved('post', 5), initialSaved);

		DS.save('post', 6).then(function () {
			fail('should not have succeeded');
		}, function (err) {
			assert.isTrue(err instanceof DS.errors.RuntimeError);
			assert.equal(err.message, errorPrefix + 'id: "6" not found!');
		});

		done();
	});
});
