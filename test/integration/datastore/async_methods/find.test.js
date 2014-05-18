describe('DS.find(resourceName, id[, options]): ', function () {
	var errorPrefix = 'DS.find(resourceName, id[, options]): ';

	it('should throw an error when method pre-conditions are not met', function () {
		DS.find('does not exist', 5).then(function () {
			fail('should have rejected');
		}, function (err) {
			assert.isTrue(err instanceof DS.errors.RuntimeError);
			assert.equal(err.message, errorPrefix + 'does not exist is not a registered resource!');
		});

		angular.forEach(TYPES_EXCEPT_STRING_OR_NUMBER, function (key) {
			DS.find('post', key).then(function () {
				fail('should have rejected');
			}, function (err) {
				assert.isTrue(err instanceof DS.errors.IllegalArgumentError);
				assert.equal(err.message, errorPrefix + 'id: Must be a string or a number!');
			});
		});

		angular.forEach(TYPES_EXCEPT_OBJECT, function (key) {
			if (key) {
				DS.find('post', 5, key).then(function () {
					fail('should have rejected');
				}, function (err) {
					assert.isTrue(err instanceof DS.errors.IllegalArgumentError);
					assert.equal(err.message, errorPrefix + 'options: Must be an object!');
				});
			}
		});
	});
	it('should get an item from the server', function () {
		$httpBackend.expectGET('http://test.angular-cache.com/posts/5').respond(200, p1);

		DS.find('post', 5).then(function (post) {
			assert.deepEqual(post, p1);
		}, function (err) {
			console.error(err.stack);
			fail('Should not have rejected!');
		});

		assert.isUndefined(DS.get('post', 5), 'The post should not be in the store yet');

		// Should have no effect because there is already a pending query
		DS.find('post', 5).then(function (post) {
			assert.deepEqual(post, p1);
		}, function (err) {
			console.error(err.stack);
			fail('Should not have rejected!');
		});

		$httpBackend.flush();

		assert.deepEqual(DS.get('post', 5), p1, 'The post is now in the store');
		assert.isNumber(DS.lastModified('post', 5));
		assert.isNumber(DS.lastSaved('post', 5));

		// Should not make a request because the request was already completed
		DS.find('post', 5).then(function (post) {
			assert.deepEqual(post, p1);
		}, function (err) {
			console.error(err.stack);
			fail('Should not have rejected!');
		});

		$httpBackend.expectGET('http://test.angular-cache.com/posts/5').respond(200, p1);

		// Should make a request because bypassCache is set to true
		DS.find('post', 5, { bypassCache: true }).then(function (post) {
			assert.deepEqual(post, p1);
		}, function (err) {
			console.error(err.stack);
			fail('Should not have rejected!');
		});

		$httpBackend.flush();

		assert.equal(lifecycle.beforeInject.callCount, 2, 'beforeInject should have been called');
		assert.equal(lifecycle.afterInject.callCount, 2, 'afterInject should have been called');
		assert.equal(lifecycle.serialize.callCount, 0, 'serialize should have been called');
		assert.equal(lifecycle.deserialize.callCount, 2, 'deserialize should have been called');
	});
	it('should get an item from the server and delete when using DSCacheFactory in passive mode', function (done) {
		DS.defineResource({
			name: 'comment',
			endpoint: '/comments',
			deleteOnExpire: 'passive',
			maxAge: 20
		});

		$httpBackend.expectGET('http://test.angular-cache.com/comments/5').respond(200, {
			id: 5,
			text: 'test'
		});

		DS.find('comment', 5).then(function (comment) {
			assert.deepEqual(comment, {
				id: 5,
				text: 'test'
			});
		}, function (err) {
			console.error(err.stack);
			fail('Should not have rejected!');
		});

		$httpBackend.flush();

		assert.deepEqual(DS.get('comment', 5), {
			id: 5,
			text: 'test'
		}, 'The comment is now in the store');
		assert.isNumber(DS.lastModified('comment', 5));
		assert.isNumber(DS.lastSaved('comment', 5));

		setTimeout(function () {
			assert.isUndefined(DS.get('comment', 5));

			assert.equal(lifecycle.beforeInject.callCount, 1, 'beforeInject should have been called');
			assert.equal(lifecycle.afterInject.callCount, 1, 'afterInject should have been called');
			assert.equal(lifecycle.serialize.callCount, 0, 'serialize should have been called');
			assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');

			done();
		}, 100);
	});
	it('should get an item from the server and delete when using DSCacheFactory in aggressive mode', function (done) {
		DS.defineResource({
			name: 'comment',
			endpoint: '/comments',
			deleteOnExpire: 'aggressive',
			recycleFreq: 10,
			maxAge: 20
		});

		$httpBackend.expectGET('http://test.angular-cache.com/comments/5').respond(200, {
			id: 5,
			text: 'test'
		});

		DS.find('comment', 5).then(function (comment) {
			assert.deepEqual(comment, {
				id: 5,
				text: 'test'
			});
		}, function (err) {
			console.error(err.stack);
			fail('Should not have rejected!');
		});

		$httpBackend.flush();

		assert.deepEqual(DS.get('comment', 5), {
			id: 5,
			text: 'test'
		}, 'The comment is now in the store');
		assert.isNumber(DS.lastModified('comment', 5));
		assert.isNumber(DS.lastSaved('comment', 5));

		setTimeout(function () {
			assert.isUndefined(DS.get('comment', 5));

			assert.equal(lifecycle.beforeInject.callCount, 1, 'beforeInject should have been called');
			assert.equal(lifecycle.afterInject.callCount, 1, 'afterInject should have been called');
			assert.equal(lifecycle.serialize.callCount, 0, 'serialize should have been called');
			assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');

			done();
		}, 100);
	});
	it('should get an item from the server but not store it if cacheResponse is false', function () {
		$httpBackend.expectGET('http://test.angular-cache.com/posts/5').respond(200, p1);

		DS.find('post', 5, { cacheResponse: false }).then(function (post) {
			assert.deepEqual(post, p1);
		}, function (err) {
			console.error(err.stack);
			fail('Should not have rejected!');
		});

		$httpBackend.flush();

		assert.isUndefined(DS.get('post', 5), 'The post should not have been injected into the store');
		assert.equal(lifecycle.beforeInject.callCount, 0, 'beforeInject should have been called');
		assert.equal(lifecycle.afterInject.callCount, 0, 'afterInject should have been called');
		assert.equal(lifecycle.serialize.callCount, 0, 'serialize should have been called');
		assert.equal(lifecycle.deserialize.callCount, 1, 'deserialize should have been called');
	});
});
