module.exports = {
	/**
	 * @doc method
	 * @id DS.async_methods:create
	 * @name create
	 * @methodOf DS
	 * @description
	 * `create(resourceName, attrs)`
	 *
	 * Create a new resource.
	 *
	 * Example:
	 *
	 * ```js
	 * TODO: create(resourceName, attrs)
	 * ```
	 *
	 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
	 * @param {object} attrs The attributes with which to update the item of the type specified by `resourceName` that has
	 * the primary key specified by `id`.
	 * @returns {Promise} Promise produced by the `$q` service.
	 *
	 * ## ResolvesWith:
	 *
	 * - `{object}` - `item` - A reference to the newly created item.
	 *
	 * ## RejectsWith:
	 *
	 * - `{IllegalArgumentError}` - `err` - Argument `attrs` must be an object.
	 * - `{RuntimeError}` - `err` - Argument `resourceName` must refer to an already registered resource.
	 * - `{UnhandledError}` - `err` - Thrown for any uncaught exception.
	 */
	create: require('./create'),

	/**
	 * @doc method
	 * @id DS.async_methods:destroy
	 * @name destroy
	 * @methodOf DS
	 * @description
	 * `destroy(resourceName, id)`
	 *
	 * Delete the item of the type specified by `resourceName` with the primary key specified by `id` from the data store
	 * and the server.
	 *
	 * Example:
	 *
	 * ```js
	 * TODO: destroy(type, id) example
	 * ```
	 *
	 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
	 * @param {string|number} id The primary key of the item to remove.
	 * @returns {Promise} Promise produced by the `$q` service.
	 *
	 * ## ResolvesWith:
	 *
	 * - `{string|number}` - `id` - The primary key of the destroyed item.
	 *
	 * ## RejectsWith:
	 *
	 * - `{IllegalArgumentError}` - `err` - Argument `id` must be a string or a number.
	 * - `{RuntimeError}` - `err` - Argument `resourceName` must refer to an already registered resource.
	 * - `{UnhandledError}` - `err` - Thrown for any uncaught exception.
	 */
	destroy: require('./destroy'),

	/**
	 * @doc method
	 * @id DS.async_methods:find
	 * @name find
	 * @methodOf DS
	 * @description
	 * `find(resourceName, id[, forceRefresh])`
	 *
	 * Asynchronously return the resource with the given id from the server. The result will be added to the data
	 * store when it returns from the server.
	 *
	 * Example:
	 *
	 * ```js
	 * TODO: find(resourceName, id[, forceRefresh]) example
	 * ```
	 *
	 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
	 * @param {string|number} id The primary key of the item to retrieve.
	 * @param {boolean=} forceRefresh Bypass the cache.
	 * @returns {Promise} Promise produced by the `$q` service.
	 *
	 * ## ResolvesWith:
	 *
	 * - `{array}` - `item` - The item with the primary key specified by `id`.
	 *
	 * ## RejectsWith:
	 *
	 * - `{IllegalArgumentError}` - `err` - Argument `id` must be a string or a number.
	 * - `{RuntimeError}` - `err` - Argument `resourceName` must refer to an already registered resource.
	 * - `{UnhandledError}` - `err` - Thrown for any uncaught exception.
	 */
	find: require('./find'),

	/**
	 * @doc method
	 * @id DS.async_methods:findAll
	 * @name findAll
	 * @methodOf DS
	 * @description
	 * `findAll(resourceName[, params][, forceRefresh])`
	 *
	 * Asynchronously return the resource from the server filtered by the query. The results will be added to the data
	 * store when it returns from the server.
	 *
	 * Example:
	 *
	 * ```js
	 * TODO: findAll(resourceName[, params][, forceRefresh]) example
	 * ```
	 *
	 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
	 * @param {object=} params Parameter object that is serialized into the query string. Properties:
	 *
	 * - `{object=}` - `query` - The query object by which to filter items of the type specified by `resourceName`. Properties:
	 *      - `{object=}` - `where` - Where clause.
	 *      - `{number=}` - `limit` - Limit clause.
	 *      - `{skip=}` - `skip` - Skip clause.
	 *
	 * @param {boolean=} forceRefresh Bypass the cache.
	 *
	 * @returns {Promise} Promise produced by the `$q` service.
	 *
	 * ## ResolvesWith:
	 *
	 * - `{array}` - `items` - The collection of items returned by the server.
	 *
	 * ## RejectsWith:
	 *
	 * - `{IllegalArgumentError}` - `err` - Argument `params` must be an object.
	 * - `{RuntimeError}` - `err` - Argument `resourceName` must refer to an already registered resource.
	 * - `{UnhandledError}` - `err` - Thrown for any uncaught exception.
	 */
	findAll: require('./findAll'),

	/**
	 * @doc method
	 * @id DS.async_methods:refresh
	 * @name refresh
	 * @methodOf DS
	 * @description
	 * `refresh(resourceName, id)`
	 *
	 * Like find(), except the resource is only refreshed from the server if it already exists in the data store.
	 *
	 * Example:
	 *
	 * ```js
	 * TODO: refresh(resourceName, id) example
	 * ```
	 *
	 * ## Throws
	 *
	 * - `{IllegalArgumentError}` - Argument `id` must be a string or a number.
	 * - `{RuntimeError}` - Argument `resourceName` must refer to an already registered resource.
	 *
	 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
	 * @param {string|number} id The primary key of the item to refresh from the server.
	 * @returns {false|Promise} `false` if the item doesn't already exist in the data store. A `Promise` if the item does
	 * exist in the data store and is being refreshed.
	 *
	 * ## ResolvesWith:
	 *
	 * - `{object}` - `item` - A reference to the refreshed item.
	 *
	 * ## RejectsWith:
	 *
	 * - `{IllegalArgumentError}` - `err` - Argument `id` must be a string or a number.
	 * - `{RuntimeError}` - `err` - Argument `resourceName` must refer to an already registered resource.
	 * - `{UnhandledError}` - `err` - Thrown for any uncaught exception.
	 */
	refresh: require('./refresh'),

	/**
	 * @doc method
	 * @id DS.async_methods:update
	 * @name update
	 * @methodOf DS
	 * @description
	 * `update(resourceName, id, attrs)`
	 *
	 * Update the item of the type specified by `resourceName` that has the primary key specified by `id` with the given
	 * attributes.
	 *
	 * Example:
	 *
	 * ```js
	 * TODO: update(resourceName, id, attrs) example
	 * ```
	 *
	 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
	 * @param {string|number} id The primary key of the item to retrieve.
	 * @param {object} attrs The attributes with which to update the item of the type specified by `resourceName` that has
	 * the primary key specified by `id`.
	 * @returns {Promise} Promise produced by the `$q` service.
	 *
	 * ## ResolvesWith:
	 *
	 * - `{object}` - `item` - A reference to the newly updated item.
	 *
	 * ## RejectsWith:
	 *
	 * - `{IllegalArgumentError}` - `err` - Argument `id` must be a string or a number.
	 * - `{RuntimeError}` - `err` - Argument `resourceName` must refer to an already registered resource.
	 * - `{UnhandledError}` - `err` - Thrown for any uncaught exception.
	 */
	update: require('./update')
};
