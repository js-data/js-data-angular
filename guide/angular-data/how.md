@doc overview
@id how
@name How do I?
@description

## How do I serialize data before it's saved?
Before the data store sends data to an adapter, you may need to transform it into a custom request object of yours.

Define a global serialization method:
```js
DSProvider.defaults.serialize = function (resourceName, data) {
  // custom payload format
  return {
    payload: data
  };
};
```

Define a serialization method for a specific resource:
```js
DS.defineResource({
  name: 'user',
  serialize: function (resourceName, user) {
    return {
      payload: user
    };
  }
});
```

## How do I deserialize data?
When an adapter returns data to the data store from a persistence layer, you may need to extract data from a custom response object of yours.

Define a global deserialization method:
```js
DSProvider.defaults.deserialize = function (resourceName, data) {
  // extract data from custom payload format
  return data ? data.payload : data;
};
```

Define a deserialization method for a specific resource:
```js
DS.defineResource({
  name: 'user',
  deserialize: function (resourceName, data) {
    return data.data.embedded;
  }
});
```

## How do I use angular-cache with angular-data?

First, make sure you have angular-data.js and angular-cache.js loaded and your app has `angular-data.DS` and `angular-data.DSCacheFactory` as dependencies.

Each resource you define will have its own cache instance, so you can pass different options to each resource.

```js
var Document = DS.defineResource({
  name: 'document',
  maxAge: 900000,
  deleteOnExpire: 'aggressive'
});

var User = DS.defineResource({
  name: 'user',
  maxAge: 36000000,
  deleteOnExpire: 'aggressive',
  onExpire: function (id, user) {...}
});
```

## How do I add my own static methods to resources?

```js
app.factory('User', function (DS, $q) {

  var loggedInUser;
  
  var User = DS.defineResource({
    name: 'user',
    methods: {
      // Instance method
      fullName: function () {
        return this.first + ' ' + this.last;
      }
    }
  });
  
  // Static method
  User.getLoggedInUser = function () {
    var deferred = $q.defer();
    
    if (loggedInUser) {
      deferred.resolve(loggedInUser);
    } else {
      DS.find('loggedInUser', { cacheResponse: false })
        .then(function (user) {
          loggedInUser = user;
          deferred.resolve(loggedInUser);
        }, deferred.reject);
    }
      
    return deferred.promise;
  };
  
  return User;
});
```

```js
app.controller('ProfileCtrl', function (User) {

  // use the static method
  User.getLoggedInUser().then(function (user) {
    
    // instance methods would be used here
    user.fullName(); // "John Anderson"
  });
});
```
