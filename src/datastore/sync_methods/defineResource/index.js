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
 *      validate: function (attrs, options, cb) {
 *          console.log('looks good to me');
 *          cb(null);
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
 * - `{string="/"}` - `baseUrl` - The url relative to which all AJAX requests will be made.
 * - `{function=}` - `validate` - The validation function to be executed before create operations.
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
	} else if (services.store[definition.name]) {
		throw new errors.RuntimeError(errorPrefix + definition.name + ' is already registered!');
	}

	try {
		Resource.prototype = services.config;
		services.store[definition.name] = new Resource(definition);
	} catch (err) {
		delete services.store[definition.name];
		throw new errors.UnhandledError(err);
	}
}

module.exports = defineResource;
