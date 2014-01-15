var utils = require('utils'),
	errors = require('errors'),
	services = require('services'),
	PUT = require('../../http').PUT,
	errorPrefix = 'DS.save(resourceName, id[, options]): ';

function _save(deferred, resource, id, options) {
	var _this = this;
	var url = utils.makePath(resource.baseUrl || services.config.baseUrl, resource.endpoint || resource.name, id);
	PUT(url, resource.index[id], null).then(function (data) {
		var saved = _this.inject(resource.name, data, options);
		resource.saved[id] = utils.updateTimestamp(resource.saved[id]);
		deferred.resolve(saved);
	}, deferred.reject);
}

/**
 * @doc method
 * @id DS.async_methods:save
 * @name save
 * @description
 * Save the item of the type specified by `resourceName` that has the primary key specified by `id`.
 *
 * ## Signature:
 * ```js
 * DS.save(resourceName, id[, options])
 * ```
 *
 * ## Example:
 *
 * ```js
 *  var document = DS.get('document', 'ee7f3f4d-98d5-4934-9e5a-6a559b08479f');
 *
 *  document.title = 'How to cook in style';
 *
 *  DS.save('document', 'ee7f3f4d-98d5-4934-9e5a-6a559b08479f')
 *  .then(function (document) {
 *      document; // A reference to the document that's been saved to the server
 *  });
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to retrieve.
 * @param {object=} options Optional configuration. Properties:
 * - `{string=}` - `mergeStrategy` - When the updated item returns from the server, specify the merge strategy that
 * should be used when the updated item is injected into the data store. Default: `"mergeWithExisting"`.
 *
 * @returns {Promise} Promise produced by the `$q` service.
 *
 * ## Resolves with:
 *
 * - `{object}` - `item` - A reference to the newly saved item.
 *
 * ## Rejects with:
 *
 * - `{IllegalArgumentError}`
 * - `{RuntimeError}`
 * - `{UnhandledError}`
 */
function save(resourceName, id, options) {
	var deferred = $q.defer();

	options = options || {};

	if (!services.store[resourceName]) {
		deferred.reject(new errors.RuntimeError(errorPrefix + resourceName + ' is not a registered resource!'));
	} else if (!utils.isString(id) && !utils.isNumber(id)) {
		deferred.reject(new errors.IllegalArgumentError(errorPrefix + 'id: Must be a string or a number!', { id: { actual: typeof id, expected: 'string|number' } }));
	} else if (!utils.isObject(options)) {
		deferred.reject(new errors.IllegalArgumentError(errorPrefix + 'id: Must be an object!', { options: { actual: typeof options, expected: 'object' } }));
	} else {
		var _this = this;

		try {
			var resource = services.store[resourceName];

			if (resource.schema) {
				resource.schema.validate(resource.index[id], function (err) {
					if (err) {
						deferred.reject(err);
					} else {
						_save.call(_this, deferred, resource, id, options);
					}
				});
			} else {
				_save.call(_this, deferred, resource, id, options);
			}
		} catch (err) {
			if (!(err instanceof errors.UnhandledError)) {
				deferred.reject(new errors.UnhandledError(err));
			} else {
				deferred.reject(err);
			}
		}
	}

	return deferred.promise;
}

module.exports = save;
