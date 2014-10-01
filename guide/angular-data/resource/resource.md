@doc overview
@id index
@name Resource Guide
@description

# Resource Guide

<page-list></page-list>

@doc overview
@id overview
@name Overview
@description

An angular-data _resource_ is the data and meta data associated with a particular RESTful resource.

You define _resources_ and register them with the data store. A _resource definition_ tells angular-data
about a particular _resource_, like what its root endpoint is and which attribute refers to the primary key of the
resource. A _resource definition_ can also specify validation functions to be executed before create and update
operations.

Resource definitions proxy `DS` methods that require a `resourceName` argument (a convenient shorthand!). Example:

```js
var User = DS.defineResource('user');

// The following are equivalent
DS.find('user', 5);
User.find(5);

DS.destroy('user', 5);
User.destroy(5);
```

See [defineResource(definition)](documentation/api/angular-data/DS.sync%20methods_defineResource) for detailed API information.

@doc overview
@id basic
@name Define a basic resource
@description

The simplest resource definition:

```js
var Document = DS.defineResource('document');
```

With this definition the data store assumes the following:

- Resource will be referred to as `"document"`
- The RESTful endpoint for this resource is `DSProvider.defaults.baseUrl + "/document"`
- The primary key is specified by the `"id"` property (or whatever is specified by `DSProvider.defaults.idAttribute`)
- This resource has no custom lifecycle hooks (unless `DSProvider.defaults` has some lifecycle hooks defined)
- No computed properties
- No instance methods
- No extra configuration for angular-cache (if you have it loaded)
- No relations

@doc overview
@id advanced
@name Advanced example
@description

An advanced resource definition:

```js
var Document = DS.defineResource({
  name: 'document',
  idAttribute: '_id',
  endpoint: 'documents',
  baseUrl: 'https://example.com/api',
  
  // hook for the validate step in the model lifecycle
  validate: function (attrs, cb) {
    if (!angular.isObject(attrs) {
      cb('Must be an object!');
    } else if (!angular.isString(attrs.title)) {
      cb('title must be a string!');
    }
  },
  
  // the "meta" property is reserved for developer use
  // it will never be used by the API
  meta: {},
  
  // instance methods
  methods: {
    filename: function () {
      return this.title + '.' + this.extension;
    }
  }
});
```

With this definition the data store understands the following:

- Resource will be referred to as `"document"`
- The RESTful endpoint for this resource is `"https://example.com/api/documents"`
- The primary key is specified by the `"_id"` property
- Before create/update operations, the provided `validate` function is executed (and any lifecycle hooks defined in `DSProvider.defaults`)
- documents will have one instance method

See [DS.defineResource](/documentation/api/api/DS.sync_methods:defineResource) for the full resource definition specification.

@doc overview
@id lifecycle
@name Model Lifecycle Hooks
@description

The following asynchronous operations support a model lifecycle:

### DS.create()

- `beforeValidate` - Default: `noop`
- `validate` - Default: `noop`
- `afterValidate` - Default: `noop`
- `beforeCreate` - Default: `noop`
- `create` - Implementation provided by adapter
- `afterCreate` - Default: `noop`

### DS.save() & DS.update()

- `beforeValidate` - Default: `noop`
- `validate` - Default: `noop`
- `afterValidate` - Default: `noop`
- `beforeUpdate` - Default: `noop`
- `save` - Implementation provided by adapter
- `afterUpdate` - Default: `noop`

### DS.destroy()

- `beforeValidate` - Default: `noop`
- `validate` - Default: `noop`
- `afterValidate` - Default: `noop`
- `beforeDestroy` - Default: `noop`
- `destroy` - Implementation provided by adapter
- `afterDestroy` - Default: `noop`

### Additional hooks

- `serialize` - Default: `noop` - Called before data is sent through adapters.
- `deserialize` - Default: `noop` - Called after data is returned from adapters.
- `beforeInject` - Default: `noop` - Called before data is injected into the data store.
- `afterInject` - Default: `noop` - Called after data is injected into the data store.

See the [DSProvider.defaults API](/documentation/api/angular-data/DSProvider.properties:defaults) for detailed information.

### Define lifecycle hooks
All lifecycle hooks will be executed according to the following signature:
```js
exampleHook(resourceName, attrs, cb) {...}
```

`resourceName` is the name of the resource that `attrs` belong to, which is a reference to the object on which `create`,
 `save` or `destroy` was originally called.

`cb` is the callback function to be executed when the lifecycle hook is done. `cb` follows the Node style of callbacks,
where the first passed argument will be the error, if any, and the second is the result. In the case of these lifecycle
functions, `attrs` _is_ the result. So, `attrs` is available for inspection and/or modification, and then should be passed
to `cb`. For example:

```js
validate(resourceName, attrs, cb) {
  console.log('hmm, looks good to me!');
  cb(null, attrs); // no error
}
```

```js
validate(resourceName, attrs, cb) {
  console.log('something went wrong!');
  cb('some error'); // error!
}
```

The lifecycle will be aborted if `cb` receives an error or an error is thrown.

Finally, model lifecycle hooks can be defined at the global level or per-resource. For example:

```js
angular.module('myApp', ['angular-data.DS'])
  .config(function (DSProvider) {

    // Global definition
    DSProvider.defaults.beforeCreate = function (resourceName, attrs, cb) {
      console.log('Global beforeCreate');
      cb(null, attrs);
    };

  })
  .run(function (DS) {

    DS.defineResource({
      name: 'post',

      // Local definition, overrides the global definition
      beforeCreate: function (resourceName, attrs, cb) {
        console.log('beforeCreate defined for ' + resourceName);
        cb(null, attrs);
      }
    });

    // Will use the global definition
    DS.defineResource({
      name: 'comment'
    });

  });
```

@doc overview
@id custom
@name Custom Model Behavior
@description

If you provide a `methods` field in the options passed to `DS.defineResource`, angular-data wrap items of that resource
with an empty constructor function. The `methods` option should be an object where the keys are method names and the
values are functions. This object will be mixed in to the prototype empty constructor function used to wrap items of the
new resource. In this way you can add custom behavior to what will now be "instances" of the new resource.

## Example:
```js
DS.defineResource({
  name: 'user',
  methods: {
    fullName: function () {
      return this.first + ' ' + this.last;
    }
  }
});

DS.inject('user', { id: 1, first: 'John', last: 'Anderson' });

var user = DS.get('user', 1);

user.fullName(); // "John Anderson"

user.constructor; // function User() { ... }
```

@doc overview
@id relations
@name Defining Relations
@description

Angular-data supports relations to some extent. If `GET /user/10` returns:

```js
{
  id: 10,
  name: 'John Anderson',
  profile: {
    email: 'John Anderson',
    id: 18,
    userId: 10
  }
}
```

then only the user object is injected into the store. If you've defined the `hasOne` relationship of users to profiles, 
not only will the user be injected into the store, but the profile as well. Example:

Without defining relations:
```js
var userJson = {
  id: 10,
  name: 'John Anderson',
  profile: {
    email: 'John Anderson',
    id: 18,
    userId: 10
  }
};

DS.inject('user', userJson);

assert.deepEqual(DS.get('user', 10), userJson);
assert.isUndefined(DS.get('profile', 18));
```

With relations defined:
```js
var userJson = {
  id: 10,
  name: 'John Anderson',
  profile: {
    email: 'John Anderson',
    id: 18,
    userId: 10
  }
};

DS.inject('user', userJson);

assert.deepEqual(DS.get('user', 10), userJson);
assert.deepEqual(DS.get('profile', 18), userJson.profile);
assert.deepEqual(DS.get('profile', 18), DS.get('user', 10).profile);
```

## Defining relations:
```js
DS.defineResource({
  name: 'user',
  relations: {
    hasMany: {
      comment: {
        localField: 'comments',
        foreignKey: 'userId'
      }
    },
    hasOne: {
      profile: {
        localField: 'profile',
        foreignKey: 'userId'
      }
    },
    belongsTo: {
      organization: {
        localKey: 'organizationId',
        localField: 'organization',
        
        // if you add this to a belongsTo relation
        // then angular-data will attempt to use
        // a nested url structure, e.g. /organization/15/user/4
        parent: true
      }
    }
  }
});

DS.defineResource({
  name: 'organization',
  relations: {
    hasMany: {
      // this is an example of multiple relations
      // of the same type to the same resource
      user: [
        {
          localField: 'users',
          foreignKey: 'organizationId'
        },
        {
          localField: 'owners',
          foreignKey: 'organizationId'
        }
      ]
    }
  }
});

DS.defineResource({
  name: 'profile',
  relations: {
    belongsTo: {
      user: {
        localField: 'user',
        localKey: 'userId'
      }
    }
  }
});

DS.defineResource({
  name: 'comment',
  relations: {
    belongsTo: {
      user: {
        localField: 'user',
        localKey: 'userId'
      }
    }
  }
});
```

You can manually load items into the data store via `DS.inject`.

## Loading relations

#### Lazy
```js
DS.find('user', 10).then(function (user) {
  // let's assume the server only returned the user
  user.comments; // undefined
  user.profile; // undefined
  
  DS.loadRelations('user', user, ['comment', 'profile']).then(function (user) {
    user.comments; // array
    user.profile; // object
  });
});
```

#### Direct (requires server-side support)

When you call `DS.find` you can pass `params` to the http adapter like so:
```js
DS.find('user', 10, {
  // will be serialized to the query string
  params: {...}
});
```

For `findAll` it works like this:
```js
var params = {...}; // will be serialized to the query string
DS.findAll('user', params);
```

You could, for example, configure your server to look for a query string parameter called `with` or something, which tells
the server which relations to include with the response, for example:

```js
DS.find('user', 10, {
  params: {
    with: ['comment', 'organization']
  }
});
```

With default settings (and using the http adapter) this will produce `GET /user/10with=comment&with=organization`.

You can configure your server to also return the `comment` and `organization` relations in the response:

```js
{
  id: 10,
  name: 'John Anderson',
  organizationId: 15,
  comments: [...],
  organization: {...}
}
```

If you've told angular-data about the relations, then the comments and organization will be injected into the data store in addition to the user.

## Nested Resource Endpoints

Add `parent: true` to a belongsTo relationship to activate nested resource endpoints for the resource. Angular-data will attempt to find the appropriate key in order to build the url. If the parent key cannot be found then angular-data will resort to a non-nested url unless you manually provide the id of the parent.

Example:

```js
DS.defineResource({
  name: 'comment',
  relations: {
    belongsTo: {
      post: {
        parent: true,
        localKey: 'postId',
        localField: 'post'
      }
    }
  }
});

// The comment isn't in the data store yet, so angular-data wouldn't know 
// what the id of the parent "post" would be, so we pass it in manually
DS.find('comment', 5, { params: { postId: 4 } }); // GET /post/4/comment/5

// vs 

DS.find('comment', 5); // GET /comment/5

DS.inject('comment', { id: 1, postId: 2 });

// We don't have to provide the parentKey here
// because angular-data found it in the comment
DS.update('comment', 1, { content: 'stuff' }); // PUT /post/2/comment/1

// If you don't want the nested for just one of the calls then
// you can do the following:
DS.update('comment', 1, { content: 'stuff' }, { params: { postId: false } }); // PUT /comment/1
```

@doc overview
@id computed
@name Computed Properties
@description

Angular-data supports computed properties. When you define a computed property you also define the fields that it depends on.
The computed property will only be updated when one of those fields changes.

## Example
```js
DS.defineResource('user', {
  computed: {
    // each function's argument list defines the fields
    // that the computed property depends on
    fullName: ['first', 'last', function (first, last) {
      return first + ' ' + last;
    }],
    // shortand, use the array syntax above if you want
    // you computed properties to work after you've
    // minified your code
    initials: function (first, last) {
      return first.toUppercase()[0] + '. ' + last.toUppercase()[0] + '.';
    }
  }
});

var user = DS.inject('user', {
  id: 1,
  first: 'John',
  last: 'Anderson'
});

user.fullName; // "John Anderson"

user.first = 'Fred';

// angular-data relies on dirty-checking, so the
// computed property hasn't been updated yet
user.fullName; // "John Anderson"

DS.digest(); // or $scope.$apply()

user.fullName; // "Fred Anderson"

user.first = 'George';
  
$timeout(function () {
  user.fullName; // "George Anderson"
});

user.first = 'William';
  
$scope.$apply(function () {
  user.fullName; // "William Anderson"
});
```
