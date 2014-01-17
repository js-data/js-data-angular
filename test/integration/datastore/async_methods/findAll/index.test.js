describe('DS.findAll(resourceName, params[, options]): ', function () {
	var errorPrefix = 'DS.findAll(resourceName, params[, options]): ';

	it('should throw an error when method pre-conditions are not met', function (done) {
		DS.findAll('does not exist', {}).then(function () {
			fail('should have rejected');
		}, function (err) {
			assert.isTrue(err instanceof DS.errors.RuntimeError);
			assert.equal(err.message, errorPrefix + 'does not exist is not a registered resource!');
		});

		angular.forEach(TYPES_EXCEPT_OBJECT, function (key) {
			DS.findAll('post', key).then(function () {
				fail('should have rejected');
			}, function (err) {
				assert.isTrue(err instanceof DS.errors.IllegalArgumentError);
				assert.equal(err.message, errorPrefix + 'params: Must be an object!');
			});
		});

		angular.forEach(TYPES_EXCEPT_OBJECT, function (key) {
			if (key) {
				DS.findAll('post', {}, key).then(function () {
					fail('should have rejected');
				}, function (err) {
					assert.isTrue(err instanceof DS.errors.IllegalArgumentError);
					assert.equal(err.message, errorPrefix + 'options: Must be an object!');
				});
			}
		});

		done();
	});
	it('should query the server for a collection', function (done) {
		$httpBackend.expectGET('http://test.angular-cache.com/posts?').respond(200, [p1, p2, p3, p4]);

		DS.findAll('post', {}).then(function (data) {
			assert.deepEqual(data, [p1, p2, p3, p4]);
		}, function (err) {
			console.error(err.stack);
			fail('Should not have rejected!');
		});

		assert.deepEqual(DS.filter('post', {}), [], 'The posts should not be in the store yet');

		// Should have no effect because there is already a pending query
		DS.findAll('post', {}).then(function (data) {
			assert.deepEqual(data, [p1, p2, p3, p4]);
		}, function (err) {
			console.error(err.stack);
			fail('Should not have rejected!');
		});

		$httpBackend.flush();

		assert.deepEqual(DS.filter('post', {}), [p1, p2, p3, p4], 'The posts are now in the store');
		assert.isNumber(DS.lastModified('post', 5));
		assert.isNumber(DS.lastSaved('post', 5));

		// Should not make a request because the request was already completed
		DS.findAll('post', {}).then(function (data) {
			assert.deepEqual(data, [p1, p2, p3, p4]);
		}, function (err) {
			console.error(err.stack);
			fail('Should not have rejected!');
		});

		$httpBackend.expectGET('http://test.angular-cache.com/posts?').respond(200, [p1, p2, p3, p4]);

		// Should make a request because bypassCache is set to true
		DS.findAll('post', {}, { bypassCache: true }).then(function (data) {
			assert.deepEqual(data, [p1, p2, p3, p4]);
		}, function (err) {
			console.error(err.stack);
			fail('Should not have rejected!');
		});

		$httpBackend.flush();

		done();
	});
});
