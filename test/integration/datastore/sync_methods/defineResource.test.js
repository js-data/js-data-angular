describe('DS.defineResource(definition)', function () {
	var errorPrefix = 'DS.defineResource(definition): ';

	it('should throw an error when method pre-conditions are not met', function () {
		angular.forEach(TYPES_EXCEPT_STRING_OR_OBJECT, function (key) {
			if (!angular.isArray(key)) {
				assert.throws(function () {
					DS.defineResource(key);
				}, DS.errors.IllegalArgumentError, errorPrefix + 'definition: Must be an object!');
			}
		});

		angular.forEach(TYPES_EXCEPT_STRING, function (key) {
			assert.throws(function () {
				DS.defineResource({ name: key });
			}, DS.errors.IllegalArgumentError, errorPrefix + 'definition.name: Must be a string!');
		});

		angular.forEach(TYPES_EXCEPT_STRING, function (key) {
			if (key) {
				assert.throws(function () {
					DS.defineResource({ name: 'name', idAttribute: key });
				}, DS.errors.IllegalArgumentError, errorPrefix + 'definition.idAttribute: Must be a string!');
			}
		});

		angular.forEach(TYPES_EXCEPT_STRING, function (key) {
			if (key) {
				assert.throws(function () {
					DS.defineResource({ name: 'name', endpoint: key });
				}, DS.errors.IllegalArgumentError, errorPrefix + 'definition.endpoint: Must be a string!');
			}
		});

		DS.defineResource('name');

		assert.throws(function () {
			DS.defineResource('name');
		}, DS.errors.RuntimeError, errorPrefix + 'name is already registered!');

		assert.doesNotThrow(function () {
			DS.defineResource('new resource');
		}, 'Should not throw');
	});

	it('should correctly register a resource', function () {

		var callCount = 0,
			test = {
				validate: function (resourceName, attrs, cb) {
					callCount += 1;
					cb(null, attrs);
				}
			};

		DS.defineResource({
			name: 'comment',
			baseUrl: 'hello/',
			validate: test.validate
		});

		assert.doesNotThrow(function () {
			assert.isUndefined(DS.get('comment', 5), 'should be undefined');
		});

		// Should override global baseUrl
		$httpBackend.expectGET('hello/comment/1').respond(200, { name: 'Sally', id: 1 });

		assert.isUndefined(DS.get('comment', 1, { loadFromServer: true }), 'should be undefined');

		$httpBackend.flush();

		assert.deepEqual(DS.get('comment', 1), { name: 'Sally', id: 1 });

		$httpBackend.expectPOST('hello/comment').respond(200, { name: 'John', id: 2 });

		DS.create('comment', { name: 'John' }).then(function (comment) {
			assert.deepEqual(comment, { name: 'John', id: 2 });
		});

		$httpBackend.flush();

		assert.equal(callCount, 1, 'overridden validate should have been called once');
		assert.equal(lifecycle.validate.callCount, 0, 'global validate should not have been called');
	});
});
