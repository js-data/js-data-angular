@doc overview
@id testing
@name Testing
@description

Once you're setup to test using angular-data-mocks you can use it much like `$httpBackend`. For the asynchronous methods
you declare expectations and then flush pending requests.

## Example:
`app.js`:

```js
angular.module('testApp', ['angular-data.DS'])
	.controller('MyCtrl', function ($scope, DS) {
		'use strict';
		DS.find('post', 45);

		$scope.update = function (attrs) {
			return DS.update('post', 45, attrs);
		}
	});
```

`test.js`:

```js
describe('test', function () {
	var MyCtrl, $scope;

	beforeEach(function (done) {
		$scope = $rootScope.$new();

		DS.expectFind('post', 45).respond({
            author: 'John Anderson',
            id: 5
        });

		inject(function ($controller) {
			MyCtrl = $controller('MyCtrl', {
				$scope: $scope,
				DS: DS
			});

			DS.flush();

			done();
		});
	});

	it('should update the post', function () {
		DS.expectUpdate('post', 45, { author: 'Sally' })
			.respond({ id: 5, author: 'Sally' });

		$scope.update().then(function (post) {
			assert.deepEqual(post, { id: 5, author: 'Sally' });
		});

		DS.flush();
	});
});
```

Refer to the [angular-data-mocks API](/documentation/api/angular-data-mocks/angular-data-mocks) for more detailed information.
