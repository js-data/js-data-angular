describe('DSLocalStorageAdapter.find(resourceConfig, id, options)', function () {
	it('should retrieve an item from localStorage', function (done) {
		var path = DSUtils.makePath('api', 'posts', 1);

		localStorage.setItem(path, angular.toJson(p1));

		assert.deepEqual(angular.fromJson(localStorage.getItem(path)), p1, 'p1 should be in localStorage');

		DSLocalStorageAdapter.find({
			baseUrl: 'api',
			endpoint: 'posts'
		}, 1).then(function (data) {
				assert.deepEqual(data, p1, 'post should have been found');

				path = DSUtils.makePath('api2', 'posts', 2);

				localStorage.setItem(path, angular.toJson(p2));

				assert.deepEqual(angular.fromJson(localStorage.getItem(path)), p2, 'p2 should be in localStorage');

				DSLocalStorageAdapter.find({
					baseUrl: 'api',
					endpoint: 'posts'
				}, 2, { baseUrl: 'api2' }).then(function (data) {
						assert.deepEqual(data, p2, 'post should have been found');

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
