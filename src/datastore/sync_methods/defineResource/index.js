var errorPrefix = 'DS.defineResource(definition): ';

function Resource(utils, options) {

	utils.deepMixIn(this, options);

	if ('endpoint' in options) {
		this.endpoint = options.endpoint;
	} else {
		this.endpoint = this.name;
	}
}

/**
 * @doc method
 * @id DS.sync_methods:defineResource
 * @name defineResource
 * @description
 * Define a resource and register it with the data store.
 *
 * ## Signature:
 * ```js
 * DS.defineResource(definition)
 * ```
 *
 * ## Example:
 *
 * ```js
 *  DS.defineResource({
 *      name: 'document',
 *      idAttribute: '_id',
 *      endpoint: '/documents
 *      baseUrl: 'http://myapp.com/api',
 *      beforeDestroy: function (resourceName attrs, cb) {
 *          console.log('looks good to me');
 *          cb(null, attrs);
 *      }
 *  });
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{RuntimeError}`
 * - `{UnhandledError}`
 *
 * @param {string|object} definition Name of resource or resource definition object: Properties:
 *
 * - `{string}` - `name` - The name by which this resource will be identified.
 * - `{string="id"}` - `idAttribute` - The attribute that specifies the primary key for this resource.
 * - `{string=}` - `endpoint` - The attribute that specifies the primary key for this resource. Default is the value of `name`.
 * - `{string=}` - `baseUrl` - The url relative to which all AJAX requests will be made.
 * - `{function=}` - `beforeValidate` - Lifecycle hook. Overrides global. Signature: `beforeValidate(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `validate` - Lifecycle hook. Overrides global. Signature: `validate(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `afterValidate` - Lifecycle hook. Overrides global. Signature: `afterValidate(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `beforeCreate` - Lifecycle hook. Overrides global. Signature: `beforeCreate(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `afterCreate` - Lifecycle hook. Overrides global. Signature: `afterCreate(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `beforeUpdate` - Lifecycle hook. Overrides global. Signature: `beforeUpdate(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `afterUpdate` - Lifecycle hook. Overrides global. Signature: `afterUpdate(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `beforeDestroy` - Lifecycle hook. Overrides global. Signature: `beforeDestroy(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 * - `{function=}` - `afterDestroy` - Lifecycle hook. Overrides global. Signature: `afterDestroy(resourceName, attrs, cb)`. Callback signature: `cb(err, attrs)`.
 */
function defineResource(definition) {
	if (this.utils.isString(definition)) {
		definition = {
			name: definition
		};
	}
	if (!this.utils.isObject(definition)) {
		throw new this.errors.IllegalArgumentError(errorPrefix + 'definition: Must be an object!', { definition: { actual: typeof definition, expected: 'object' } });
	} else if (!this.utils.isString(definition.name)) {
		throw new this.errors.IllegalArgumentError(errorPrefix + 'definition.name: Must be a string!', { definition: { name: { actual: typeof definition.name, expected: 'string' } } });
	} else if (definition.idAttribute && !this.utils.isString(definition.idAttribute)) {
		throw new this.errors.IllegalArgumentError(errorPrefix + 'definition.idAttribute: Must be a string!', { definition: { idAttribute: { actual: typeof definition.idAttribute, expected: 'string' } } });
	} else if (definition.endpoint && !this.utils.isString(definition.endpoint)) {
		throw new this.errors.IllegalArgumentError(errorPrefix + 'definition.endpoint: Must be a string!', { definition: { endpoint: { actual: typeof definition.endpoint, expected: 'string' } } });
	} else if (this.store[definition.name]) {
		throw new this.errors.RuntimeError(errorPrefix + definition.name + ' is already registered!');
	}

	try {
		Resource.prototype = this.defaults;
		this.definitions[definition.name] = new Resource(this.utils, definition);

		this.store[definition.name] = {
			collection: [],
			completedQueries: {},
			pendingQueries: {},
			index: {},
			changes: {},
			modified: {},
			saved: {},
			previousAttributes: {},
			observers: {},
			collectionModified: 0
		};
	} catch (err) {
		delete this.definitions[definition.name];
		delete this.store[definition.name];
		throw new this.errors.UnhandledError(err);
	}
}

module.exports = defineResource;
