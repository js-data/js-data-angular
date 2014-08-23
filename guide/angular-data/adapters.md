@doc overview
@id adapters
@name Adapters
@description

Angular-data ships with a `DSHttpAdapter` and a `DSLocalStorageAdapter`. The DSHttpAdapter is the default adapter
used by the data store.

Register a custom adapter:
```js
DS.adapters.myCustomAdapter = { ... };
```

Other available adapters:

- [DSLocalForageAdapter](https://github.com/jmdobry/angular-data-localForage)

The default adapter can be set globally:

```js
DSProvider.defaults.defaultAdapter = 'DSHttpAdapter';
```

per resource:

```js
DS.defineResource({
  name: 'user',
  defaultAdapter: 'DSLocalForageAdapter'
});
```

per method

```js
DS.update('post', 45, { author: 'Sally' }, { adapter: 'DSLocalForageAdapter' });
```

### Write Your Own Adapter

For the data store to be able to use an adapter of yours, your adapter needs to implement the adapter API. Here it is:

- `find`
- `findAll`
- `create`
- `update`
- `updateAll`
- `destroy`
- `destroyAll`

Rather than repeat documentation here, you can find the method signatures and descriptions in the [DSHttpAdapter API](/documentation/api/angular-data/DSHttpAdapter.methods:find) and [DSLocalStorageAdapter API](/documentation/api/angular-data/DSLocalStorageAdapter.methods:find).

The difference between the DSHttpAdapter and your adapter is that yours might not use HTTP, rather, it might interact with indexedDb instead.

You can post any questions on the [mailing list](https://groups.google.com/forum/?fromgroups#!forum/angular-data).
