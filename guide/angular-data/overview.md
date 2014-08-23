@doc overview
@id overview
@name Overview of Angular-data
@description

Okay, here's the scoop.

Before writing angular-data I used to create fleets of services for my various resources, each performing data management and communicating with a persistence layer. I needed to easily share data across controllers and directives all over my apps. I abstracted as much as I could into a reusable base service. Eventually I wanted features like change detection, computed properties and relationships, but I still wanted the simplicity of the raw POJO objects that Angular is famous for. I didn't want heavy wrapper classes like the one's in Ember, Backbone, and even ngResource and Restangular. Angular-data was born.

At it's core angular-data is an in-memory data store. How data gets into the store is up to you. Angular-data handles meta information about what is in the store and which things have changed. It provides an api of synchronous methods for interacting directly with whatever data is already in the store: get, filter, inject, eject, etc. (all of which return their result synchronously). The synchronous methods have asynchronous analogs (all of which return promises) that work through adapters. Adapters abstract the specifics of various persistence layers away from the data store itself. The http adapter is default. The data store is continually updated with the results returned by adapters.

## Quick Start
<code>npm install --save angular-data</code> or <code>bower install --save angular-data</code> then add
<code>angular-data.DS</code> as a dependency of your angular app.

```js
var app = angular.module('myApp', ['angular-data.DS']);
```

```js
app.factory('User', function (DS) {
  // Simplest resource definition
  return DS.defineResource('user');
});
```

```js
app.controller('friendsCtrl', function ($scope, $routeParams, User) {
  // it's up to your server to know how to interpret this query
  // or you can teach angular-data how to understand your servers' query language
  var query = {
    where: {
      friendIds: {
        in: $routeParams.id
      }
    }
  };
  
  User.find($routeParams.id);
  User.findAll(query);
  
  // My goodness this was easy
  User.bindOne($scope, 'me', $routeParams.id);
  User.bindAll($scope, 'friends', query);
  
  // Long form
  $scope.$watch(function () {
    return User.lastModified($routeParams.id);
  }, function () {
    $scope.me = User.get($routeParams.id);
  });
  $scope.$watch(function () {
    // Changes when anything in the User collection is modified
    return User.lastModified();
  }, function () {
    $scope.friends = User.filter(query);
  });
});
```

Angular-data is very optimistic when it comes to caching. If you do DS.find('user', 5) angular-data will first look for that user in the data store. If that user is already in the data store then the promise returned by DS.find('user', 5) will immediately resolve with the user. If no user exists then (if using the http adapter) a GET request will be made, and the user returned by the server will be injected into the data store. From that point on that user can be synchronously retrieved from the data store using DS.get('user', 5).

The previous example is for single items. When working with collections you use DS.filter and DS.findAll. When you use DS.findAll you often pass some parameters that describe the subset you want returned by the adapter. Example:

```js
DS.findAll('user', {
  where: {
    age: {
      '>': 30
    }
  }
}).then(function (users) { ... });
```

This will result in a GET request will some query string parameters. Using angular-data's default query language syntax, it's up to your server to interpret the parameters and return the correct subset of users. Once those users have been injected into the data store, you can call DS.filter('user', { ... }) with the exact same parameters and the correct subset of users will be synchronously filtered out of the data store (this assumes you're using angular-data's default query syntax). If your server already uses some query format that you've defined and you don't want to change it, then you can override angular-data's default filter with one that understands your custom query syntax. The filter you provide should be able to synchronously return the correct subset from the data store, the same subset your server would return.

The first time you do DS.findAll angular-data records the hashed parameters used in your query. At that point angular-data assumes the items have already been injected into the data store and it won't make the GET request again when you pass those exact same parameters to another DS.findAll call. (Most of this default behavior can be overridden with options. You can force requests to be made again, skip injection into the data store, etc.)

## Another example

Here is a common usage pattern:

```js
angular.module('myApp', ['ngRoute', 'angular-data.DS'])
  .config(function ($routeProvider) {
    $routeProvider.when('/user/:userId/posts', {
      template: '<div ng-repeat="post in posts">{{ post.title }}</div>',
      controller: 'PostsCtrl',
      resolve: {
        user: function ($route, User, DS) {
          return User.find($route.current.params.userId);
          // the above is the same as
          // return DS.find('user', $route.current.params.userId);
          // but like injecting the resources themselves when I use them
          // which is why I use a factory for each defined resource, seen below
        },
        posts: function ($route, Post) {
          // these are equivalent (assuming your server can interpret them that way)
          //
          // return Post.findAll({
          //   userId: $route.current.params.userId
          // });
          // return Post.findAll({
          //   where: {
          //     userId: $route.current.params.userId
          //   }
          // });

          return Post.findAll({
            where: {
              userId: {
                '==': $route.current.params.userId
              }
            }
          });
        }
      }
    });
  })
  .run(function (Post) {
    // Let's say you're using some pub/sub service
    socket.on('createPost', function (post) {
      // Someone in another browser created a new post
      // Inject the new post into the data store of this browser
      Post.inject(post);
    });
  })
  .factory('User', function (DS) {
    return DS.defineResource({
      name: 'user'
    });
  })
  .factory('Post', function (DS) {
    return DS.defineResource({
      name: 'post'
    });
  })
  .controller('PostsCtrl', function ($scope, $routeParams, User, Post) {
    // short form
    Post.bindAll($scope, 'posts', { userId: $routeParams.userId });

    // long form
    $scope.$watch(function () {
      // a timestamp maintained by angular-data
      // changes when anything in the "post" collection changes
      return Post.lastModified();
    }, function () {
      // synchronously filter out the correct posts from the data store
      // new/changed posts will trigger this callback, and they will
      // automagically appear on your screen. 3-way data-binding!
      $scope.posts = Post.filter({ userId: $routeParams.userId });
    });
  });
```

This is pretty basic, and makes a lot of assumptions and uses a lot of defaults. It can all be configured to your needs. Angular-data optimistically assumes that you as a developer will be proactive in removing stale data from the browser, and pulling in new data as it is created, wherever it is created. If you need to "bust the cache", that's where bypassCache: true, DS.eject, DS.ejectAll, and even integrating the advanced caching features of angular-cache come in handy. 

You define _resources_ and register them with the data store. A _resource definition_ tells angular-data
about a particular resource, like what its root endpoint is and which attribute refers to the primary key of the
resource. A _resource definition_ can also specify functions to be executed during model lifecycle operations.

```js
DS.defineResource({
  name: 'post',
  endpoint: 'posts',
  idAttribute: '_id',
  validate: function (resourceName, attrs, cb) {
    if (!attrs.title) {
      cb('Title is required');
    } else {
      cb(null, attrs);
    }
  }
});
```

`validate` will be executed at the beginning of the lifecycle initiated by a calls to `DS.create`, `DS.save`, etc.
```js
DS.create('post', { author: 'Sally', title: 'Angular gotchas' })
  .then(function (post) {
    post; // { id: 65, author: 'Sally', title: 'Angular gotchas' }
  });

DS.create('post', { author: 'Sally' })
  .then(null, function (err) {
    err; // 'Title is required'
  });
```
