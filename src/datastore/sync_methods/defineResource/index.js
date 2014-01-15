var utils = require('utils'),
	errors = require('errors'),
	services = require('services');

/**
 * @doc method
 * @id DS.sync_methods:defineResource
 * @name defineResource
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
 */
function defineResource(definition) {
	if (utils.isString(definition)) {
		definition = {
			name: definition
		};
	}
	if (!utils.isObject(definition)) {
		throw new errors.IllegalArgumentError('DS.defineResource(definition): definition: Must be an object!', { definition: { actual: typeof definition, expected: 'object' } });
	} else if (!utils.isString(definition.name)) {
		throw new errors.IllegalArgumentError('DS.defineResource(definition): definition.name: Must be a string!', { definition: { name: { actual: typeof definition.name, expected: 'string' } } });
	} else if (definition.idAttribute && !utils.isString(definition.idAttribute)) {
		throw new errors.IllegalArgumentError('DS.defineResource(definition): definition.idAttribute: Must be a string!', { definition: { idAttribute: { actual: typeof definition.idAttribute, expected: 'string' } } });
	} else if (services.store[definition.name]) {
		throw new errors.RuntimeError('DS.defineResource(definition): ' + definition.name + ' is already registered!');
	}

	try {
		services.store[definition.name] = definition;

		var resource = services.store[definition.name];
		resource.collection = [];
		resource.completedQueries = {};
		resource.pendingQueries = {};
		resource.index = {};
		resource.modified = {};
		resource.changes = {};
		resource.previous_attributes = {};
		resource.saved = {};
		resource.observers = {};
		resource.collectionModified = 0;
		resource.idAttribute = resource.idAttribute || services.config.idAttribute || 'id';
	} catch (err) {
		throw new errors.UnhandledError(err);
	}
}

module.exports = defineResource;
