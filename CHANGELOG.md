##### 0.9.1 - xx May 2014

###### Backwards compatible bug fixes
- #68 - Async methods should honor methods on a resource definition.
- #69 - Failed requests should throw an error, not just return it
- #70 - Make `params` and `params.query` optional

##### 0.9.0 - 22 May 2014

###### Breaking API changes
- #61 - Make custom serializers/deserializers more valuable
- #59, #62 - Make queryTransform() consistent with the rest of the API

__Before:__

```js
DSHttpAdapterProvider.defaults.serialize = function (data) { ... };
```

__After:__

```js
DSProvider.defaults.serialize = function (resourceName, data) { ... };
```

__Before:__

```js
DSHttpAdapterProvider.defaults.deserialize = function (data) { ... };
```

__After:__

```js
DSProvider.defaults.deserialize = function (resourceName, data) { ... };
```

__Before:__

```js
DSHttpAdapterProvider.defaults.queryTransform = function (query) { ... };
```

__After:__

```js
DSHttpAdapterProvider.defaults.queryTransform = function (resourceName, query) { ... };
```

###### Backwards compatible API changes
- #30, #48, #66 - DSCacheFactory integration
- #49 - DS.bindOne($scope, prop, resourceName, id)
- #50 - DS.bindAll($scope, prop, resourceName, query)
- #51 - Allow baseUrl to be overridable at the method level
- #52 - DS.update(resourceName, id, attrs[, options]) (different from DS.save())
- #54 - Adding functionality to resources
- #56 - DS.updateAll(resourceName, attrs, params[, options])
- #60 - DSHttpAdapterProvider.defaults is undefined
- #63 - DSLocalStorageAdapter

##### 0.8.1 - 02 May 2014

###### Backwards compatible Bug fixes
- #44 - Pending query isn't deleted when the response is a failure
- #47 - Minification error in $q $delegate

##### 0.8.0 - 13 March 2014

###### Backwards compatible API changes
- #37 - Add option to only save changed attributes when calling DS.save()

###### Backwards compatible bug fixes
- #38 - "saved" attribute item isn't being updated properly

##### 0.7.1 - 26 February 2014

###### Backwards compatible bug fixes
- #36 - Fixed inconsistencies in `DS.filter` when using skip or limit in the query

##### 0.7.0 - 24 February 2014

###### Breaking API changes
- `DS.eject(resourceName, id)` can now only eject individual items

###### Backwards compatible API changes
- #34 - Added `DS.ejectAll(resourceName, params)`
- #33 - Added `DS.destroyAll(resourceName, params[, options])`
- #35 - Add options for asynchronous getter methods to return data without putting it into the data store

##### 0.6.0 - 17 January 2014

Added pluggable filters for the "where" clause of a query. Angular-data's "query language" will remain small and simple.
Developers can provide their own more robust filters for more powerful queries.

###### Breaking API changes
- #3 - Pluggable async adapters

###### Backwards API changes
- #2 - angular-data query language
- #4 - Query caching
- #17 - Where predicates should be able to handle OR, not just AND
- #22 - Reorganize infrastructure to utilize angular's DI

##### 0.5.0 - 16 January 2014

###### Backwards API changes
- #1 - Pluggable adapters
- #6 - Observable objects
- #7 - Model lifecycle hooks

###### Backwards compatible bug fixes
- #19 - Null pointer exception in several places where angular-data tries to use the $q service

##### Other
- #15 - Integration test coverage

##### 0.4.2 - 15 January 2014

###### Backwards compatible bug fixes
- #18 - observers aren't created for items injected into the store from a findAll() call.
