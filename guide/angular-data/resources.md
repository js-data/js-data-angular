@doc overview
@id resources
@name Define a resource
@description

Angular-data keeps track of _resource definitions_ to know what kind of data should be managed by the data store.

```js
myApp.run(function (DS) {

  // This is a basic resource definition
  var Document = DS.defineResource({
    name: 'document'
  });

  // angular-data now knows it can perform
  // operations related to the "document" resource
  
  // These are the same
  Document.find(5).then(function (document) {...});
  DS.find('document', 5).then(function (document) {...});
});
```

See the [Resource Guide](/documentation/guide/angular-data-resource/index) for detailed information on defining resources.
