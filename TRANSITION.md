### 0.9.x. ---> 0.10.x - 29 June 2014

#### Breaking API changes
##### #76 - Queries and filtering.

###### Before
`IllegalArgumentError` has an `errors` field.

###### After
`IllegalArgumentError` no longer has an `errors` field.

###### Before
```javascript
DS.findAll('post', {
  query: {
    where: {
      name: 'John'
    }
  }
})
```

###### After
```javascript
DS.findAll('post', {
  where: {
    name: 'John'
  }
})
```

###### Before
```javascript
DS.filter('post', {
  query: {
    where: {
      name: 'John'
    }
  }
})
```

###### After
```javascript
DS.filter('post', {
  where: {
    name: 'John'
  }
})
```

###### Before
```javascript
// override how DS.filter handles the "where" clause
DSProvider.defaults.filter = function (resourceName, where, attrs) {
  // return true to keep the item in the result set
  // return false to exclude it
};
```

###### After
```javascript
// override how DS.filter handles the "where", "skip", "limit" and "orderBy" clauses
DSProvider.defaults.filter = function (collection, resourceName, params, options) {
  // examine params and
  // decide whether to exclude items, skip items, start from an offset, or sort the items
  
  // see the [default implementation that ships with js-data-angular](https://github.com/js-data/js-data-angular/blob/master/src/datastore/index.js#L12) 
  // overriding this method is useful when our server only understands a certain
  // params format and you want js-data-angular's filter to behave the same as your server
  
  // js-data-angular looks for the following fields:
  // - where
  // - skip (or offset)
  // - limit
  // - orderBy (or sort)
  
  // return the filtered collection
};
```

###### Before
```javascript
DSHttpAdapter.defaults.queryTransform = function (resourceName, query) {
  // the second argument was the "query" field of the "params" passed in the DSHttpAdapter method
  // return the transformed query
};
```

###### After
```javascript
// This is useful when you don't want to implement the filter method above
// and instead rely on js-data-angular's expectation of where, skip, limit, orderBy, etc.
// This transform is useful when you want to change the where, skip, limit, orderBy, etc. fields
// into something your server understands.
DSHttpAdapter.defaults.queryTransform = function (resourceName, params) {
  // the second argument is now the whole "params" object passed in the DSHttpAdapter method
  // return the transformed params
};
```
