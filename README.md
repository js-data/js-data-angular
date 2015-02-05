<img src="https://raw.githubusercontent.com/js-data/js-data/master/js-data.png" alt="js-data logo" title="js-data" align="right" width="64" height="64" />

## js-data-angular [![Bower version](https://badge.fury.io/bo/js-data-angular.png)](http://badge.fury.io/bo/js-data-angular) [![NPM version](https://badge.fury.io/js/js-data-angular.png)](http://badge.fury.io/js/js-data-angular)

Angular wrapper for [js-data](http://www.js-data.io).

#### What happened Angular-data?
Js-data-angular is Angular-data 2.0, with [js-data](http://www.js-data.io) as the framework-agnostic core. Documentation for Angular-data 1.x can be found at [angular-data.pseudobry.com](http://angular-data.pseudobry.com).

## Guides
- [Angular + JSData (js-data-angular)](http://www.js-data.io/docs/js-data-angular)
- [Getting Started with js-data](http://www.js-data.io/docs/home)
- [Resources/Models](http://www.js-data.io/docs/resources)
- [Working with the Data Store](http://www.js-data.io/docs/working-with-the-data-store)
- [Adapters](http://www.js-data.io/docs/working-with-adapters)
- [Model Lifecycle](http://www.js-data.io/docs/model-lifecycle)
- [Custom Instance Behavior](http://www.js-data.io/docs/custom-instance-behavior)
- [Computed Properties](http://www.js-data.io/docs/computed-properties)
- [Relations](http://www.js-data.io/docs/relations)
- [Schemata & Validation](http://www.js-data.io/docs/schemata--validation)
- [FAQ](http://www.js-data.io/docs/faq)

## Js-data-angular API Documentation
- [js-data-angular](http://www.js-data.io/docs/js-data-angular)
- [DS](http://www.js-data.io/docs/ds)
- [js-data-schema](http://www.js-data.io/docs/js-data-schema)
- [DSHttpAdapter](http://www.js-data.io/docs/dshttpadapter)
- [DSLocalStorageAdapter](http://www.js-data.io/docs/dslocalstorageadapter)
- [DSLocalForageAdapter](http://www.js-data.io/docs/dslocalforageadapter)
- [DSFirebaseAdapter](http://www.js-data.io/docs/dsfirebaseadapter)
- [DSRedisAdapter](http://www.js-data.io/docs/dsredisadapter)
- [DSRethinkDBAdapter](http://www.js-data.io/docs/dsrethinkdbadapter)

## Project Status

| Branch | Master |
| ------ | ------ |
| Bower | [![Bower version](https://badge.fury.io/bo/js-data-angular.png)](http://badge.fury.io/bo/js-data-angular) |
| NPM | [![NPM version](https://badge.fury.io/js/js-data-angular.png)](http://badge.fury.io/js/js-data-angular) |
| Build Status | [![Build Status](https://travis-ci.org/js-data/js-data-angular.png?branch=master)](https://travis-ci.org/js-data/js-data-angular) |
| Code Climate | [![Code Climate](https://codeclimate.com/github/js-data/js-data-angular.png)](https://codeclimate.com/github/js-data/js-data-angular) |
| Dependency Status | [![Dependency Status](https://gemnasium.com/js-data/js-data-angular.png)](https://gemnasium.com/js-data/js-data-angular) |
| Coverage | [![Coverage Status](https://coveralls.io/repos/js-data/js-data-angular/badge.png?branch=master)](https://coveralls.io/r/js-data/js-data-angular?branch=master) |

## Quick Start
`bower install --save js-data js-data-angular` or `npm install --save js-data js-data-angular`.

Load `js-data-angular.js` after `js-data.js`.

```js
angular.module('myApp', ['js-data']);
```

```js
angular.module('myApp').factory('Post', function (DS) {
  return DS.defineResource('post');
});
angular.module('myApp').factory('Comment', function (DS) {
  return DS.defineResource('comment');
});
```

```js
app.controller('postCtrl', function ($scope, $routeParams, Post, Comment) {
  // it's up to your server to know how to interpret this query
  // or you can teach js-data how to understand your servers' query language
  var query = {
    postId: $routeParams.id
  };

  Post.find($routeParams.id);
  Comment.findAll(query);

  // My goodness this was easy
  Post.bindOne($routeParams.id, $scope, 'post');
  Comment.bindAll(query, $scope, 'comments');

  // Long form (same effect as above)
  $scope.$watch(function () {
    return Post.lastModified($routeParams.id);
  }, function () {
    $scope.post = Post.get($routeParams.id);
  });
  $scope.$watch(function () {
    // Changes when anything in the Comment collection is modified
    return Comment.lastModified();
  }, function () {
    $scope.comments = Comment.filter(query);
  });
});
```

## Changelog
[CHANGELOG.md](https://github.com/js-data/js-data-angular/blob/master/CHANGELOG.md)

## Community
- [Mailing List](https://groups.io/org/groupsio/jsdata) - Ask your questions!
- [Issues](https://github.com/js-data/js-data-angular/issues) - Found a bug? Feature request? Submit an issue!
- [GitHub](https://github.com/js-data/js-data-angular) - View the source code for js-data.
- [Contributing Guide](https://github.com/js-data/js-data-angular/blob/master/CONTRIBUTING.md)

## Contributing

First, feel free to contact me with questions. [Mailing List](https://groups.io/org/groupsio/jsdata). [Issues](https://github.com/js-data/js-data-angular/issues).

1. Contribute to the issue that is the reason you'll be developing in the first place
1. Fork js-data-angular
1. `git clone https://github.com/<you>/js-data-angular.git`
1. `cd js-data-angular; npm install; bower install;`
1. `grunt go` (builds and starts a watch)
1. (in another terminal) `grunt karma:dev` (runs the tests)
1. Write your code, including relevant documentation and tests
1. Submit a PR and we'll review

## License

The MIT License (MIT)

Copyright (c) 2014-2015 Jason Dobry

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

