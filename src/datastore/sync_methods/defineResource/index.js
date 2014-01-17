var utils = require('utils'),
	errors = require('errors'),
	services = require('services'),
	errorPrefix = 'DS.defineResource(definition): ';

function Resource(options) {
	services.BaseConfig.apply(this, [options]);

	if ('name' in options) {
		this.name = options.name;
	}

	if ('endpoint' in options) {
		this.endpoint = options.endpoint;
	} else {
		this.endpoint = this.name;
	}

	this.collection = [];
	this.completedQueries = {};
	this.pendingQueries = {};
	this.index = {};
	this.modified = {};
	this.changes = {};
	this.previous_attributes = {};
	this.saved = {};
	this.observers = {};
	this.collectionModified = 0;
}

Resource.prototype = services.config;

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
	if (utils.isString(definition)) {
		definition = {
			name: definition
		};
	}
	if (!utils.isObject(definition)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'definition: Must be an object!', { definition: { actual: typeof definition, expected: 'object' } });
	} else if (!utils.isString(definition.name)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'definition.name: Must be a string!', { definition: { name: { actual: typeof definition.name, expected: 'string' } } });
	} else if (definition.idAttribute && !utils.isString(definition.idAttribute)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'definition.idAttribute: Must be a string!', { definition: { idAttribute: { actual: typeof definition.idAttribute, expected: 'string' } } });
	} else if (definition.endpoint && !utils.isString(definition.endpoint)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'definition.endpoint: Must be a string!', { definition: { endpoint: { actual: typeof definition.endpoint, expected: 'string' } } });
	} else if (services.store[definition.name]) {
		throw new errors.RuntimeError(errorPrefix + definition.name + ' is already registered!');
	}

	try {
		services.store[definition.name] = new Resource(definition);
	} catch (err) {
		delete services.store[definition.name];
		throw new errors.UnhandledError(err);
	}
}

module.exports = defineResource;
