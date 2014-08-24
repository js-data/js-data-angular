@doc overview
@id asynchronous
@name Asynchronous Methods
@description

Angular-data ships with a number of asynchronous methods that facilitate communication between the data store and a
persistence layer. These methods cover CRUD operations.

The asynchronous methods return Promises produced by Angular's `$q` service.

Example:

```js
// synchronous, looks only at the cache
DS.get('document', 45); // undefined

// asynchronous, works through an adapter
DS.find('document', 45).then(function (document) {
  document; // { title: 'How to Cook', id: 45 }

  // document 45 has already been injected into the store at this point
  DS.get('document', 45); // { title: 'How to Cook', id: 45 }
});

DS.get('document', 45); // still undefined, because the find operation has not completed yet
```

#### Another example

```js
var document = DS.get('document', 45); // { title: 'How to Cook', id: 45 }

document.title = 'How NOT to cook';

DS.save('document', 45).then(function (document) {
  document; // { title: 'How NOT to Cook', id: 45 }

  // document 45 in the store has been updated
  DS.get('document', 45); // { title: 'How NOT to Cook', id: 45 }
});

DS.get('document', 45); // { title: 'How to Cook', id: 45 }
```

See the [DS API](/documentation/api/angular-data/DS) for more information.
