module.exports = {
	/**
	 * @doc method
	 * @id DS.sync_methods:defineResource
	 * @name defineResource
	 * @methodOf DS
	 * @description
	 * `defineResource(definition)`
	 *
	 * Register a resource definition with the data store.
	 *
	 * Example:
	 *
	 * ```js
	 * TODO: defineResource(definition)
	 * ```
	 *
	 * ## Throws
	 *
	 * - `{IllegalArgumentError}` - Argument `definition` must be a string or an object.
	 * - `{RuntimeError}` - Property `name` of argument `definition` must not refer to an already registered resource.
	 * - `{UnhandledError}` - Thrown for any uncaught exception.
	 *
	 * @param {string|object} definition Name of resource or resource definition object: Properties:
	 *
	 * - `{string}` - `name` - The name by which this resource will be identified.
	 * - `{string="id"}` - `idAttribute` - The attribute that specifies the primary key for this resource.
	 * - `{string=}` - `endpoint` - The attribute that specifies the primary key for this resource. Default is the value of `name`.
	 * - `{string="/"}` - `baseUrl` - The url relative to which all AJAX requests will be made.
	 * - `{function=}` - `validate` - The validation function to be executed before create operations.
	 * - `{function=}` - `updateValidate` - The validation function to be executed before update operations. If this function
	 * isn't provided but the `validate` function is, then the `validate` function will be used for both create and update
	 * operations.
	 */
	defineResource: require('./defineResource'),

	/**
	 * @doc method
	 * @id DS.sync_methods:eject
	 * @name eject
	 * @methodOf DS
	 * @description
	 * `eject(resourceName[, id])`
	 *
	 * Eject the item of the specified type that has the given primary key from the data store. If no primary key is
	 * provided, eject all items of the specified type from the data store. Ejection only removes items from the data store
	 * and does not attempt to delete items on the server.
	 *
	 * Example:
	 *
	 * ```js
	 * DS.get('document', 45); // { title: 'How to Cook', id: 45 }
	 *
	 * DS.eject('document', 45);
	 *
	 * DS.get('document', 45); // undefined
	 * ```
	 *
	 * Eject all items of the specified type from the data store.
	 *
	 * ```js
	 * DS.filter('document'); // [ { title: 'How to Cook', id: 45 }, { title: 'How to Eat', id: 46 } ]
	 *
	 * DS.eject('document');
	 *
	 * DS.filter('document'); // [ ]
	 * ```
	 *
	 * ## Throws
	 *
	 * - `{IllegalArgumentError}` - If provided, argument `id` must be a string or a number.
	 * - `{RuntimeError}` - Argument `resourceName` must refer to an already registered resource.
	 * - `{UnhandledError}` - Thrown for any uncaught exception.
	 *
	 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
	 * @param {string|number} id The primary key of the item to eject.
	 */
	eject: require('./eject'),

	/**
	 * @doc method
	 * @id DS.sync_methods:filter
	 * @name filter
	 * @methodOf DS
	 * @description
	 * `filter(resourceName[, params][, loadFromServer])`
	 *
	 * Example:
	 *
	 * ```js
	 * TODO: get(resourceName, id) example
	 * ```
	 *
	 * ## Throws
	 *
	 * - `{IllegalArgumentError}` - Argument `params` must be an object.
	 * - `{RuntimeError}` - Argument `resourceName` must refer to an already registered resource.
	 * - `{UnhandledError}` - Thrown for any uncaught exception.
	 *
	 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
	 * @param {object=} params Parameter object that is serialized into the query string. Properties:
	 *
	 * - `{object=}` - `query` - The query object by which to filter items of the type specified by `resourceName`. Properties:
	 *      - `{object=}` - `where` - Where clause.
	 *      - `{number=}` - `limit` - Limit clause.
	 *      - `{skip=}` - `skip` - Skip clause.
	 * @param {boolean=} loadFromServer Whether to load the query from the server if it hasn't been loaded yet.
	 * @returns {array} The filtered collection of items of the type specified by `resourceName`.
	 */
	filter: require('./filter'),

	/**
	 * @doc method
	 * @id DS.sync_methods:get
	 * @name get
	 * @methodOf DS
	 * @description
	 * `get(resourceName, id)`
	 *
	 * Synchronously return the resource with the given id. The data store will forward the request to the server if the
	 * item is not in the cache.
	 *
	 * Example:
	 *
	 * ```js
	 * TODO: get(resourceName, id) example
	 * ```
	 *
	 * ## Throws
	 *
	 * - `{IllegalArgumentError}` - Argument `id` must be a string or a number.
	 * - `{RuntimeError}` - Argument `resourceName` must refer to an already registered resource.
	 * - `{UnhandledError}` - Thrown for any uncaught exception.
	 *
	 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
	 * @param {string|number} id The primary key of the item to retrieve.
	 * @returns {object} The item of the type specified by `resourceName` with the primary key specified by `id`.
	 */
	get: require('./get'),

	/**
	 * @doc method
	 * @id DS.sync_methods:inject
	 * @name inject
	 * @description
	 * `inject(resourceName, attrs)`
	 *
	 * Inject the given item into the data store as the specified type. If `attrs` is an array, inject each item into the
	 * data store. Injecting an item into the data store does not save it to the server.
	 *
	 * Example:
	 *
	 * ```js
	 * DS.get('document', 45); // undefined
	 *
	 * DS.inject('document', { title: 'How to Cook', id: 45 });
	 *
	 * DS.get('document', 45); // { title: 'How to Cook', id: 45 }
	 * ```
	 *
	 * Inject a collection into the data store:
	 *
	 * ```js
	 * DS.filter('document'); // [ ]
	 *
	 * DS.inject('document', [ { title: 'How to Cook', id: 45 }, { title: 'How to Eat', id: 46 } ]);
	 *
	 * DS.filter('document'); // [ { title: 'How to Cook', id: 45 }, { title: 'How to Eat', id: 46 } ]
	 * ```
	 *
	 * ## Throws
	 *
	 * - `{IllegalArgumentError}` - Argument `attrs` must be an object.
	 * - `{RuntimeError}` - Argument `resourceName` must refer to an already registered resource.
	 * - `{UnhandledError}` - Thrown for any uncaught exception.
	 *
	 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
	 * @param {object|array} attrs The item or collection of items to inject into the data store.
	 * @returns {object|array} A reference to the item that was injected into the data store or an array of references to
	 * the items that were injected into the data store.
	 */
	inject: require('./inject'),

	/**
	 * @doc method
	 * @id DS.sync_methods:lastModified
	 * @name lastModified
	 * @methodOf DS
	 * @description
	 * `lastModified(resourceName[, id])`
	 *
	 * Return the timestamp of the last time either the collection for `resourceName` or the item of type `resourceName`
	 * with the given primary key was modified.
	 *
	 * Example:
	 *
	 * ```js
	 * TODO: lastModified(resourceName, id) example
	 * ```
	 *
	 * ## Throws
	 *
	 * - `{IllegalArgumentError}` - Argument `id` must be a string or a number.
	 * - `{RuntimeError}` - Argument `resourceName` must refer to an already registered resource.
	 * - `{UnhandledError}` - Thrown for any uncaught exception.
	 *
	 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
	 * @param {string|number=} id The primary key of the item to remove.
	 * @returns {number} The timestamp of the last time either the collection for `resourceName` or the item of type
	 * `resourceName` with the given primary key was modified.
	 */
	lastModified: require('./lastModified')
};
