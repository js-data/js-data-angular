describe('DSProvider.config(options)', function () {
	var errorPrefix = 'DSProvider.config(options): ';

	it('should throw an error when method pre-conditions are not met', function (done) {
		angular.forEach(TYPES_EXCEPT_OBJECT, function (key) {
			if (key) {
				assert.throws(function () {
					DSProvider.config(key);
				}, DS.errors.IllegalArgumentError, errorPrefix + 'options: Must be an object!');
			} else {
				assert.doesNotThrow(function () {
					DSProvider.config(key);
				}, 'Should not fail');
			}
		});

		angular.forEach(TYPES_EXCEPT_STRING, function (key) {
			assert.throws(function () {
				DSProvider.config({
					baseUrl: key
				});
			}, DS.errors.IllegalArgumentError, errorPrefix + 'options.baseUrl: Must be a string!');
		});

		angular.forEach(TYPES_EXCEPT_STRING, function (key) {
			assert.throws(function () {
				DSProvider.config({
					idAttribute: key
				});
			}, DS.errors.IllegalArgumentError, errorPrefix + 'options.idAttribute: Must be a string!');
		});

		angular.forEach(TYPES_EXCEPT_STRING, function (key) {
			assert.throws(function () {
				DSProvider.config({
					mergeStrategy: key
				});
			}, DS.errors.IllegalArgumentError, errorPrefix + 'options.mergeStrategy: Must be a string!');
		});

		angular.forEach(TYPES_EXCEPT_FUNCTION, function (key) {
			assert.throws(function () {
				DSProvider.config({
					beforeValidate: key
				});
			}, DS.errors.IllegalArgumentError, errorPrefix + 'options.beforeValidate: Must be a function!');
		});

		angular.forEach(TYPES_EXCEPT_FUNCTION, function (key) {
			assert.throws(function () {
				DSProvider.config({
					validate: key
				});
			}, DS.errors.IllegalArgumentError, errorPrefix + 'options.validate: Must be a function!');
		});

		angular.forEach(TYPES_EXCEPT_FUNCTION, function (key) {
			assert.throws(function () {
				DSProvider.config({
					afterValidate: key
				});
			}, DS.errors.IllegalArgumentError, errorPrefix + 'options.afterValidate: Must be a function!');
		});

		angular.forEach(TYPES_EXCEPT_FUNCTION, function (key) {
			assert.throws(function () {
				DSProvider.config({
					beforeCreate: key
				});
			}, DS.errors.IllegalArgumentError, errorPrefix + 'options.beforeCreate: Must be a function!');
		});

		angular.forEach(TYPES_EXCEPT_FUNCTION, function (key) {
			assert.throws(function () {
				DSProvider.config({
					afterCreate: key
				});
			}, DS.errors.IllegalArgumentError, errorPrefix + 'options.afterCreate: Must be a function!');
		});

		angular.forEach(TYPES_EXCEPT_FUNCTION, function (key) {
			assert.throws(function () {
				DSProvider.config({
					beforeUpdate: key
				});
			}, DS.errors.IllegalArgumentError, errorPrefix + 'options.beforeUpdate: Must be a function!');
		});

		angular.forEach(TYPES_EXCEPT_FUNCTION, function (key) {
			assert.throws(function () {
				DSProvider.config({
					afterUpdate: key
				});
			}, DS.errors.IllegalArgumentError, errorPrefix + 'options.afterUpdate: Must be a function!');
		});

		angular.forEach(TYPES_EXCEPT_FUNCTION, function (key) {
			assert.throws(function () {
				DSProvider.config({
					beforeDestroy: key
				});
			}, DS.errors.IllegalArgumentError, errorPrefix + 'options.beforeDestroy: Must be a function!');
		});

		angular.forEach(TYPES_EXCEPT_FUNCTION, function (key) {
			assert.throws(function () {
				DSProvider.config({
					afterDestroy: key
				});
			}, DS.errors.IllegalArgumentError, errorPrefix + 'options.afterDestroy: Must be a function!');
		});

		done();
	});
});
