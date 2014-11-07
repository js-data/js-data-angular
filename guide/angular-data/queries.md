@doc overview
@id queries
@name Queries and Filtering
@description

Items injected into the data store are indexed by their primary key, but they're also stored in collections.

`DS.findAll()` is used to asynchronously query a persistence layer for a collection of items. `DS.filter()` is used to
synchronously query the items already in the data store. Here are some examples:

Translates into a `GET` request to `/post`:
```js
DS.findAll('post', {}).then(function (posts) {
  posts; // [ { ... }, { ... }, ... , { ... } ]

  DS.filter('post', {}); // returns all posts in the data store
}).catch(function (err) {
  err; // reason why query failed
});
```

Translates into a `GET` request to `/post?where={"author":{"==":"John Anderson"}}'` (url encoded of course):
```js
var params = {
  where: {
    author: {
      '==': 'John Anderson'
    }
  }
};

DS.findAll('post', params).then(function (posts) {
  posts; // [ { ... }, { ... }, ... , { ... } ]

  DS.filter('post', params); // filters the posts already in the data store
}).catch(function (err) {
  err; // reason why query failed
});
```

Angular-data has a "query" language that it natively understands. To sync up how your API and the data store query
collections you will need to do one of the following:

##### Option A
Configure your API to understand angular-data's query syntax, translating the query object into the appropriate database query.

##### Option B
Replace Angular-data's filter with your own filter that works the same way your API already works.

If the following `params` argument is passed to `DS.filter`:

```js
var params = {
  where: {
    author: {
      '==': 'John Anderson'
    }
  }
};

DS.filter('post', params);
```

Then `DS.filter` will return the posts (already in the data store) where `post.author == 'John Anderson'`.

Here's how to replace Angular-data's filter:

```js
// override how DS.filter handles the "where", "skip", "limit" and "orderBy" clauses
DSProvider.defaults.defaultFilter = function (collection, resourceName, params, options) {
  // examine params and
  // decide whether to exclude items, skip items, start from an offset, or sort the items
  
  // see the [default implementation that ships with angular-data](https://github.com/jmdobry/angular-data/blob/master/src/datastore/index.js#L12) 
  // overriding this method is useful when our server only understands a certain
  // params format and you want angular-data's filter to behave the same as your server
  
  // angular-data looks for the following fields:
  // - where
  // - skip (or offset)
  // - limit
  // - orderBy (or sort)
  
  // return the filtered collection
};
```

You can even override the filter per-resource:

```js
DS.defineResource({
  name: 'post',
  defaultFilter: function (collection, resourceName, params, options) {
    // ...
  }
});
```

#### angular-data's default filter

Params definition:
```js
{
  where: {
    <field_1>: {
      <op_1>: <val>,
      <op_2>: <val>,
      <op_n>: <val>
    },
    <field_2>: {
      <op_1>: <val>,
      <op_2>: <val>,
      <op_n>: <val>
    },
    <field_n>: {
      <op_1>: <val>,
      <op_2>: <val>,
      <op_n>: <val>
    }
  },
  skip: <number>,
  offset: <number>, // same as skip
  limit: <number>,
  orderBy: <array>,
  sort: <array> // same as orderBy
}
```

##### where
Where <field> can be any top-level field on the item being filtered and <op> is one of the operators angular-data's default filter understands.

__Operators__:

These get ANDed into the final result:
- `==`
- `===`
- `!=`
- `!==`
- `>`
- `>=`
- `<`
- `<=`
- `in`

These get ORed into the final result:
- `|==`
- `|===`
- `|!=`
- `|!==`
- `|>`
- `|>=`
- `|<`
- `|<=`
- `|in`

##### skip or offset
Should be a number

##### limit
Should be a number

##### orderBy or sort
Should be an array of arrays.

#### Examples:

```js
DS.filter('post', {
  where: {
    author: {
      '==': 'John Anderson'
    }
  },
  skip: 20,
  limit: 100
});
```

```js
DS.filter('post', {
  orderBy: [
    ['author', 'DESC'],
    ['created_date', 'DESC']
  ]
});
```

```js
DS.filter('post', {
  where: {
    author: {
      'in': ['John', 'Sally']
    }
  }
});
```

`age` is greater than or equal to 15 AND less than or equal to 30.
```js
DS.filter('user', {
  where: {
    age: {
      '>=': 15,
      '<=': 30
    }
  }
});
```

`age` is less than 15 OR greater than 30.
```js
DS.filter('post', {
  where: {
    age: {
      '|<': 15,
      '|>': 30
    }
  }
});
```

#### Shortcuts

###### `==` operator shortcut

The following are equivalent:
```js
DS.filter('post', {
  author: 'John'
});
DS.filter('post', {
  where: {
    author: 'John'
  }
});
DS.filter('post', {
  where: {
    author: {
      '==': 'John'
    }
  }
});
```

###### `orderBy` shortcut

The following are equivalent:
```js
DS.filter('post', {
  orderBy: 'age'
});
DS.filter('post', {
  orderBy: ['age', 'ASC']
});
DS.filter('post', {
  orderBy: [
    ['age', 'ASC']
  ]
});
```
