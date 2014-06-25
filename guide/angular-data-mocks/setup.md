@doc overview
@id setup
@name Setting Up
@description

Angular-data-mocks works just like [angular-mocks](https://docs.angularjs.org/api/ngMock). Angular-data-mocks simply needs
to be loaded after angular, angular-mocks, and angular-data in your tests. After you declare your test module, and before
you create the injector, activate angular-data-mocks by calling `module('angular-data.mocks')`.

## Example (Mocha)
`karma.start.js`

```js
var DS, DSHttpAdapter;

angular.module('myApp', ['angular-data.DS']);

beforeEach(function () {
	angular.mocks.module('myApp');
});

beforeEach(function () {
	angular.mocks.module('angular-data.mocks');
});

beforeEach(function (done) {
	inject(function (_DS_, _DSHttpAdapter_) {
		DS = _DS_;
		DSHttpAdapter = _DSHttpAdapter_;

		done();
	});
});
```

If you're using [KarmaJS](http://karma-runner.github.io/0.12/index.html) to test your app, look through the tests in the
[angular-data-mocks repo](https://github.com/jmdobry/angular-data-mocks) for an example Karma setup.

Refer to the [angular-data-mocks API](/documentation/api/angular-data-mocks/angular-data-mocks) for more detailed information.
