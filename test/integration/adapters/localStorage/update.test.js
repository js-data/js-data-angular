describe('DSLocalStorageAdapter.update(resourceConfig, id, attrs, options)', function () {
	it('should make a PUT request', function (done) {
		var path = DSUtils.makePath('api', 'posts', 1);

		localStorage.setItem(path, angular.toJson(p1));

		assert.deepEqual(angular.fromJson(localStorage.getItem(path)), p1, 'p1 should be in localStorage');

		DSLocalStorageAdapter.update({
			baseUrl: 'api',
			endpoint: 'posts'
		}, 1, { author: 'Sally' }).then(function (data) {
				assert.isUndefined(data, 'data should be undefined');
				assert.deepEqual(angular.fromJson(localStorage.getItem(path)), { author: 'Sally', age: 30, id: 5 }, 'p1 should be in localStorage');

				path = DSUtils.makePath('api2', 'posts', 2);

				localStorage.setItem(path, angular.toJson(p2));

				assert.deepEqual(angular.fromJson(localStorage.getItem(path)), p2, 'p2 should be in localStorage');

				DSLocalStorageAdapter.update({
					baseUrl: 'api',
					endpoint: 'posts'
				}, 2, { age: 44 }, { baseUrl: 'api2' }).then(function (data) {
						assert.isUndefined(data, 'data should be undefined');

						assert.deepEqual(angular.fromJson(localStorage.getItem(path)), { author: 'Sally', age: 44, id: 6 }, 'p1 should be in localStorage');

						done();
					}, function (err) {
						console.error(err.stack);
						fail('should not have rejected');
					});

				$rootScope.$apply();
			}, function (err) {
				console.error(err.stack);
				fail('should not have rejected');
			});

		$rootScope.$apply();
	});
});
