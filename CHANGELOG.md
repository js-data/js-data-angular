##### 3.2.1 - 18 March 2016

###### Backwards compatible bug fixes
- Upgraded to js-data-http 2.2.2

##### 3.2.0 - 17 March 2016

###### Backwards compatible bug fixes
- #347 - BindOne recomputing computed properties
- #353 - jshint or standard?
- #356 - Multiple parents isn't working

##### 3.1.1 - 20 September 2015

Stable Version 3.1.0

###### Backwards compatible API changes
- #335 - Calling $q.reject in http interceptor doesn't resolve to calling reject handler in DS.findAll.then

###### Other
- Built with js-data-http 2.1.1
- Upgraded dependencies

##### 3.0.0 - 02 July 2015

Stable Version 3.0.0

##### 3.0.0-rc.1 - 28 June 2015

Stable Version 3.0.0-rc.1

##### 3.0.0-beta.2 - 19 April 2015

Added examples of various build setups `./build_examples/`

##### 3.0.0-beta.1 - 17 April 2015

###### Backwards compatible API changes
- #306 - Keep it DRY

###### Other
- #314 - Switch to using peerDependencies

##### 2.4.0 - 15 April 2015

###### Backwards compatible API changes
- #327 - `bindOne` now updates computed properties on change

##### 2.3.0 - 15 April 2015

###### Backwards compatible API changes
- #328 - Add support for `js-data-sql` adapter

###### Backwards compatible bug fixes
- #328 - Fixed adapter registration

##### 2.2.3 - 08 March 2015

###### Other
- Converted to ES6, using Babel.js to transpile to ES5.

##### 2.2.2 - 04 March 2015

###### Backwards compatible bug fixes
- #312 - UMDifying js-data-angular
- #313 - DSHttpAdapter#find/create/update/destroy do not call queryTransform

##### 2.2.1 - 25 February 2015

###### Backwards compatible bug fixes
- #311 - Does not properly throw error in find() (like other adapters) when the item cannot be found

##### 2.2.0 - 24 February 2015

###### Backwards compatible API changes
- Added `suffix` option

##### 2.1.0 - 04 February 2015

Now requiring >= js-data 1.1.0 in order to use removeCircular to safely safe cyclic objects

##### 2.0.0 - 03 February 2015

_Note:_ Please see the [js-data CHANGELOG](https://github.com/js-data/js-data/blob/master/CHANGELOG.md).

###### Breaking API changes
- Angular module renamed from `angular-data.DS` to `js-data`
- Refactored to be a wrapper for [js-data](https://github.com/js-data/js-data)
- `deserialize` and `serialize` are now properties of `DSHttpAdapter.defaults`
- `deserialize` and `serialize` are now configuration options used solely by the http adapter
- All hooks (`validate`, `afterCreate`, `serialize`, etc.) now take the actual resource definition as the first argument instead of just the name of the resource
- `DSLocalStorageAdapter` is no longer bundled, but is each separate from js-data-angular.
- The API for `bindOne` and `bindAll` has been changed to be more consistent with the rest of the API
- `eagerInject` has not yet been implemented in `js-data`.

##### Backwards compatible API changes
- GitHub project renamed to js-data-angular
- GitHub project moved to the js-data organization

###### Other
- #199 - Re-implement bindOne & bindAll in js-data-angular (they're missing from js-data)
- #200 - Need to properly trigger digest where angular-data would have before
- Added DSHttpAdapter fallback that uses $http if js-data-http isn't loaded
- Load an es6-style version of `$q` instead of `es6-promises` to maintain `$scope` integration with the promise lifecycle
- Updated dependencies. Now safely making copies of the `options` passed into methods

##### 1.0.0 - 04 October 2014

Stable Version 1.0.0

##### 1.0.0-rc.2-1 - 25 September 2014

###### Backwards compatible bug fixes
- #191 - Invalid reference in _eject

##### 1.0.0-rc.2 - 25 September 2014

###### Backwards compatible bug fixes
- #191 - Add "useClass" option to inject, find, findAll, create
- #155 - Allow deserialize and serialize to be configured per-method as well
- #159 - Find which items from collection have changed with lastModified
- #161 - Allow the http method of DSHttpAdapter methods to be configured
- #166 - Add ID Resolver
- #167 - Default params argument of bindAll to empty object
- #169 - Added eager inject and eager eject options
- #170 - Global callbacks
- #171 - "not in" query
- #175 - Explore adding support for collection-based methods to the DSLocalStorageAdapter
- #177 - Allow promises to be returned in lifecycle hooks
- #182 - option to force trailing slash (DSHttpAdapterProvider.defaults.forceTrailingSlash)
- #185 - eagerInject/eagerEject should default to definition's options
- #186 - eagerInject doesn't add the model to the list after HTTP success
- #187 - Proxy some static methods to instance methods
- Made the `notify` option configurable globally and per-resource

###### Backwards compatible bug fixes
- #156 - cached findAll pending query doesn't get removed sometimes
- #163 - loadRelations shouldn't try to load a relation if the id for it is missing
- #165 - DS.hasChanges() reports changes after loading relations

##### 1.0.0-rc.1 - 03 September 2014

###### Backwards compatible API changes
- #142 - Update references on eject (Added `DS.unlinkInverse`)

##### 1.0.0-beta.3 - 30 August 2014

###### Backwards compatible bug fixes
- Unfroze resource definitions

##### 1.0.0-beta.2 - 27 August 2014

###### Breaking API changes
- `findBelongsTo` option of `DS.inject` now defaults to `false`

###### Backwards compatible API changes
- #132 - Added `findHasMany` option and capability to `DS.inject`
- #133 - Override resource end point in async methods
- #136 - Add a way to force computed properties to be computed. Added `DS.compute`. Added `DSCompute` to prototype of instances.
- #137 - Add `DS.link`, `DS.linkAll`, and `DS.linkInverse`, and added `linkInverse` option to `DS.inject`

###### Backwards compatible bug fixes
- #135 - loadrelations loop
- #140 - lastModified changes when loading distant related objects

###### Other
- #138 - Performance optimizations
- #139 - Documentation error

##### 1.0.0-beta.1 - 23 August 2014

###### Backwards compatible API changes
- #40 - Support for nested resource endpoints
- #118, #122 - Multiple relationships to the same model
- #120 - When using DSCacheFactory, allow onExpire to be specified
- #132 - Inject relations for parent resource on create
- #141 - Allow lifecycle hooks to be overridden per method as well

###### Backwards compatible bug fixes
- #126 - injectRelations isn't running when injecting an array

###### Other
- #121 - Documentation errors
- #123 - Send query params with DS.find()
- #124 - Documentation overhaul

##### 0.10.5 - 14 August 2014

###### Backwards compatible API changes
- #111 - DSHttpAdapter default $http config
- #114 - Include resourceName in error messages
- #117 - Event system

###### Backwards compatible bug fixes
- #113 - FindAll with object as a result

##### 0.10.4 - 04 August 2014

###### Breaking API changes
- #110 - `DS.refresh` now always returns a promise

###### Backwards compatible API changes
- #103 - Add `upsert` option to `DS.create`
- #107 - Computed properties no dependencies

###### Backwards compatible bug fixes
- #104 - Only hijack $rootScope digest when Object.observe is unavailable
- #105 - prototype methods shouldn't be included in change sets
- #106 - cacheResponse: false should force bypassCache to true
- #108 - Computed properties array syntax and primary id
- #110 - `DS.refresh` should still return a promise if the item isn't already in the data store

##### 0.10.3 - 24 July 2014

###### Backwards compatible bug fixes
- #100 - defineResource can't handle names that aren't [a-zA-z0-9]
- #101 - DS.findAll isn't added to completedQueries
- #102 - Resource objects are missing the changes, eject, and ejectAll methods

##### 0.10.2 - 21 July 2014

###### Backwards compatible bug fixes
- #99 - Computed properties + uglify

##### 0.10.1 - 20 July 2014

###### Backwards compatible API changes
- #93 - Added `DS.createInstance(resourceName[, attrs][, options])`
- #96 - Resource definitions should be able to proxy DS methods

###### Backwards compatible bug fixes
- #90 - DS.create isn't added to completedQueries (`DS.create` now adds a completed query entry)
- #91 - dist/js-data-angular(.min).js doesn't end with a semicolon (upgraded Browserify)
- #94 - Resource object name/class inconsistency (added `useClass` option to `DS.defineResource`)
- #95 - observe-js outdated (Upgraded observe-js.js an refactored to new API)
- #98 - Missing id warning

##### 0.10.0 - 18 July 2014

Official Release

##### 0.10.0-beta.2 - 10 July 2014

###### Backwards compatible API changes
- #89 - Added the `cacheResponse` option to `DS.create` and `DS.save`

###### Backwards compatible bug fixes
- #87 - Filter where boolean values

###### Other
- #88 - Fixed guide documentation for the simple default `where` filter

##### 0.10.0-beta.1 - 28 June 2014

###### Breaking API changes
- #76 - Queries and filtering. See [TRANSITION.md](https://github.com/js-data/js-data-angular/blob/master/TRANSITION.md).
- #82 - Simplify error handling. Reduced size of js-data-angular.min.js by 4kb.
- #42 - Relations/Associations. `DS.inject` now looks for relations and injects them as well.

###### Backwards compatible API changes
- #17 - Where predicates should be able to handle OR, not just AND
- #23 - Computed Properties
- #78 - Added optional callback to `bindOne` and `bindAll`
- #79 - `ejectAll` should clear matching completed queries
- #83 - Implement `DS.loadRelations(resourceName, instance(Id), relations[, options])`
- #84 - idAttribute of a resource can be a computed property

##### 0.9.1 - 30 May 2014

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
- #2 - js-data-angular query language
- #4 - Query caching
- #17 - Where predicates should be able to handle OR, not just AND
- #22 - Reorganize infrastructure to utilize angular's DI

##### 0.5.0 - 16 January 2014

###### Backwards API changes
- #1 - Pluggable adapters
- #6 - Observable objects
- #7 - Model lifecycle hooks

###### Backwards compatible bug fixes
- #19 - Null pointer exception in several places where js-data-angular tries to use the $q service

##### Other
- #15 - Integration test coverage

##### 0.4.2 - 15 January 2014

###### Backwards compatible bug fixes
- #18 - observers aren't created for items injected into the store from a findAll() call.
