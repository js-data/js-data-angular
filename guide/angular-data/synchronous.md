@doc overview
@id synchronous
@name Synchronous Methods
@description

Angular-data ships with a number of synchronous methods that provide instance access to data currently in the store.

These methods are meant to be used outside of the context of client-server communication.

Example:

```js
DS.get('document', 45); // { title: 'How to Cook', id: 45 }
```

`get(resourceName, id[ options])` will return the data if it is in the store, otherwise `undefined`. This method is useful inside
of a `$watch` callback function, for example:

```js
$scope.$watch(function () {
  // Here we are watching the "lastModified" timestamp maintained by the data store for this particular document

  return DS.lastModified('document', 45);
}, function () {
  // When this callback is executed, it means that the data store thinks the item changed

  // Retrieve the updated item from the data store's cache
  $scope.myDoc = DS.get('document', 45);
});
```

To make things simpler, angular-data has some bind methods to help with this:

```js
DS.bindOne($scope, 'myDoc', 'document', 45);
Document.bindOne($scope, 'myDoc', 45);
```

The above example shows how to bind an item in the data store to the $scope. Whenever that item changes it will be updated
on the $scope.

When the app starts up, the calls to `lastModified()` and `get()` will both returned undefined, because the item isn't in
the data store yet. If we insert the statement: `DS.find('document', 45);` right above the `$watch` function, the data store will make an
AJAX request for that item. When the item returns from the server, the last modified timestamp for that item will change
from `undefined` to something like `1388809123529`, causing the `get()` call inside the `$watch` callback function to be
executed, retrieving the item from the data store and putting it on the `$scope`.

Various other synchronous methods provide operations that execute immediately on data currently in the store. None of
these methods persist their actions to the server.

#### Another example

Let's say two users both have access to a particular document, but one user deletes the document. If you're using web
sockets or some other method to push data to the client, you can inform user #2 that the document has been
deleted. Example:

This document is in the data store for both users: `{ title: 'How to Cook', id: 45 }`

User #1 (asynchronous)
```js
DS.destroy('document', 45).then(function (id) {...}); // sends DELETE request to the server
```

User #2 receives notification from the server that document 45 was deleted and synchronously ejects it from the data store.
```js
DS.eject('document', 45); // synchronously eject document from the store
```

User #2 doesn't need to destroy document 45, because it's already been deleted on the server by user #1. User #2 just
needs to kick document #45 out of the data store and be done with it.

See the [DS API](/documentation/api/angular-data/DS) for more information.
