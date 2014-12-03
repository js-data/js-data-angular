## angular-data [![Stories in Backlog](https://badge.waffle.io/jmdobry/angular-data.svg?label=backlog&title=Backlog)](http://waffle.io/jmdobry/angular-data) [![Stories in Ready](https://badge.waffle.io/jmdobry/angular-data.svg?label=ready&title=Ready)](http://waffle.io/jmdobry/angular-data) [![Stories in progress](https://badge.waffle.io/jmdobry/angular-data.svg?label=in%20progress&title=In%20Progress)](http://waffle.io/jmdobry/angular-data)

Inspired by [Ember Data](https://github.com/emberjs/data), Angular-data is the model layer Angular is missing. It consists of a convenient in-memory cache for managing your data, and several adapters for communicating with various persistence layers.

By default angular-data uses the http adapter–perfect for communicating with your RESTful backend. It includes a localStorage adapter, and another [localforage adapter](https://github.com/jmdobry/angular-data-localForage) is also available. More adapters are coming, and you're free to implement your own.

Unlike Backbone and Ember Models, angular-data does not require the use of getters and setters, and doesn't wrap your data with custom classes if you don't want it to. Angular-data's internal dirty-checking (via [observe-js](https://github.com/Polymer/observe-js) or `Object.observe` in supporting browsers) allows for powerful use cases and an easy avenue for implementing your own [3-way data-binding](https://www.firebase.com/blog/2013-10-04-firebase-angular-data-binding.html).

Supporting relations, computed properties, model lifecycle control and a slew of other features, angular-data is the tool for giving your data the respect it deserves.

__Latest Release:__ [1.5.3](https://github.com/jmdobry/angular-data/releases/tag/1.5.3)

Angular-data is finally 1.0.!

Angular-data 1.x will continue to see bug fixes, but most new development will be on [js-data](https://github.com/js-data/js-data) and [js-data-angular](https://github.com/jmdobry/angular-data/pull/198) (Angular-data 2.0).

#### A note about Angular-data 2.0 (in development)
See [angular-data/pull/198](https://github.com/jmdobry/angular-data/pull/198).

## 1.x Documentation
[http://angular-data.pseudobry.com](http://angular-data.pseudobry.com)

## Project Status

| Branch | Master |
| ------ | ------ |
| Bower | [![Bower version](https://badge.fury.io/bo/angular-data.png)](http://badge.fury.io/bo/angular-data) |
| NPM | [![NPM version](https://badge.fury.io/js/angular-data.png)](http://badge.fury.io/js/angular-data) |
| Build Status | [![Build Status](https://travis-ci.org/jmdobry/angular-data.png?branch=master)](https://travis-ci.org/jmdobry/angular-data) |
| Code Climate | [![Code Climate](https://codeclimate.com/github/jmdobry/angular-data.png)](https://codeclimate.com/github/jmdobry/angular-data) |
| Dependency Status | [![Dependency Status](https://gemnasium.com/jmdobry/angular-data.png)](https://gemnasium.com/jmdobry/angular-data) |
| Coverage | [![Coverage Status](https://coveralls.io/repos/jmdobry/angular-data/badge.png?branch=master)](https://coveralls.io/r/jmdobry/angular-data?branch=master) |

## Quick Start
`bower install --save angular-data` or `npm install --save angular-data`.

```js
var app = angular.module('myApp', ['angular-data.DS']);
```

```js
app.factory('Post', function (DS) {
  // Simplest resource definition
  return DS.defineResource('post');
});
app.factory('Comment', function (DS) {
  return DS.defineResource('comment');
});
```

```js
app.controller('postCtrl', function ($scope, $routeParams, Post, Comment) {
  // it's up to your server to know how to interpret this query
  // or you can teach angular-data how to understand your servers' query language
  var query = {
    postId: $routeParams.id
  };

  Post.find($routeParams.id);
  Comment.findAll(query);

  // My goodness this was easy
  Post.bindOne($scope, 'post', $routeParams.id);
  Comment.bindAll($scope, 'comments', query);

  // Long form, functionally the same as above
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

## Guide
- [Overview](http://angular-data.pseudobry.com/documentation/guide/angular-data/index)
- [Basics](http://angular-data.pseudobry.com/documentation/guide/angular-data/overview)
- [Defining Resources](http://angular-data.pseudobry.com/documentation/guide/angular-data-resource/basic)
- [Asynchronous Methods](http://angular-data.pseudobry.com/documentation/guide/angular-data/asynchronous)
- [Synchronous Methods](http://angular-data.pseudobry.com/documentation/guide/angular-data/synchronous)
- [Queries & Filtering](http://angular-data.pseudobry.com/documentation/guide/angular-data/queries)
- [Adapters](http://angular-data.pseudobry.com/documentation/guide/angular-data/adapters)
- [How do I...?](http://angular-data.pseudobry.com/documentation/guide/angular-data/how)

## API
- [Overview](http://angular-data.pseudobry.com/documentation/api/angular-data/angular-data)
- [DS](http://angular-data.pseudobry.com/documentation/api/angular-data/DS)
- [DSHttpAdapter](http://angular-data.pseudobry.com/documentation/api/angular-data/DSHttpAdapter)

## Changelog
[CHANGELOG.md](https://github.com/jmdobry/angular-data/blob/master/CHANGELOG.md)

## Version Migration
[TRANSITION.md](https://github.com/jmdobry/angular-data/blob/master/TRANSITION.md)

## Community
- [Mailing List](https://groups.google.com/forum/?fromgroups#!forum/angular-data) - Ask your questions!
- [Issues](https://github.com/jmdobry/angular-data/issues) - Found a bug? Feature request? Submit an issue!
- [Contributing Guide](https://github.com/jmdobry/angular-data/blob/master/CONTRIBUTING.md)

## Contributing

First, feel free to contact me with questions. [Mailing List](https://groups.google.com/forum/?fromgroups#!forum/angular-data). [Issues](https://github.com/jmdobry/angular-data/issues).

1. Contribute to the issue that is the reason you'll be developing in the first place
1. Fork angular-data
1. `git clone https://github.com/<you>/angular-data.git`
1. `cd angular-data; npm install; bower install;`
1. `grunt go` (builds and starts a watch)
1. (in another terminal) `grunt karma:dev` (runs the tests)
1. Write your code, including relevant documentation and tests
1. Submit a PR and we'll review

## License

The MIT License (MIT)

Copyright (c) 2014 Jason Dobry

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
