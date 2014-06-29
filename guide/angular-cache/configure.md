@doc overview
@id configure
@name Configure a cache
@description

See the [API Documentation](/documentation/api/angular-cache/angular-cache) for information on the available configuration options.

#### Dynamically configure a cache
```javascript
app.service('myService', function (DSCacheFactory) {

    var cache = DSCacheFactory('cache', {
        capacity: 100,
        maxAge: 300000
    });

    // Add 50 items here, for example

    cache.info(); // { ..., size: 50, capacity: 100, maxAge: 300000, ... }

    cache.setOptions({
        capacity: 30
    });

    cache.info(); // { ..., size: 30, capacity: 30, maxAge: 300000, ... }
    // notice that only the 30 most recently added items remain in the cache because
    // the capacity was reduced.

    // setting the second parameter to true will cause the cache's configuration to be
    // reset to defaults before the configuration passed into setOptions() is applied to
    // the cache
    cache.setOptions({
        cacheFlushInterval: 5500
    }, true);

    cache.info(); // { ..., size: 30, cacheFlushInterval: 5500,
                  //   capacity: 1.7976931348623157e+308, maxAge: null, ... }

    cache.put('someItem', 'someValue', { maxAge: 12000, deleteOnExpire: 'aggressive' });
    cache.info('someItem'); // { maxAge: 12000, deleteOnExpire: 'aggressive', isExpired: false, ... }
});
```
See the [API Documentation](/documentation/api/angular-cache/angular-cache) for more information.
