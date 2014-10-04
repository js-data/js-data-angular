<img src="https://raw.githubusercontent.com/js-data/js-data/master/js-data.png" alt="js-data logo" title="js-data" align="right" width="64" height="64" />

## js-data-angular

Angular wrapper for [js-data](http://www.js-data.io/js-data).

## API Documentation
[DS](https://github.com/js-data/js-data/wiki/DS)

## Demo
[js-data-angular.firebaseapp.com/](https://js-data-angular.firebaseapp.com/)

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
  Post.bindOne($scope, 'post', $routeParams.id);
  Comment.bindAll($scope, 'comments', query);
  
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

Copyright (c) 2014 Jason Dobry

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

