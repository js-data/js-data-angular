describe('DSCacheFactory integration', function () {

	beforeEach(function () {
		module('angular-data.DSCacheFactory');
	});

	beforeEach(startInjector);

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
});
