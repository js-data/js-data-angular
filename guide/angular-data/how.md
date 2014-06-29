@doc overview
@id how
@name How do I?
@description

#### How do I serialize data before it's saved?
Before the data store sends date to an adapter, you may need to transform it to a custom request object of yours.

Define a global serialization method:
```js
DSProvider.defaults.serialize = function (resourceName, data) {
	// custom payload format
	return {
		payload: data
	};
};
```

Define a serialization method for a specific resource:
```js
DS.defineResource({
	name: 'user',
	serialize: function (resourceName, user) {
		return {
			payload: user
		};
	}
});
```

#### How do I deserialize data?
When an adapter returns data to the data store from the server, for example, you may need to extract data from a custom response object of yours.

Define a global deserialization method:
```js
DSProvider.defaults.deserialize = function (resourceName, data) {
	// extract data from custom payload format
	return data ? data.payload : data;
};
```

Define a deserialization method for a specific resource:
```js
DS.defineResource({
	name: 'user',
	deserialize: function (resourceName, data) {
		return data.data.embedded;
	}
});
```
