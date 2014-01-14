var utils = require('utils'),
	errors = require('errors'),
	store = require('store'),
	PUT = require('../../HTTP').PUT,
	errorPrefix = 'DS.refresh(resourceName, id): ';

/**
 * @doc method
 * @id DS.async_methods:refresh
 * @name refresh
 * @description
 * Like find(), except the resource is only refreshed from the server if it already exists in the data store.
 *
 * ## Signature:
 * ```js
 * DS.refresh(resourceName, id)
 * ```
 * ## Example:
 *
 * ```js
 *  // Exists in the data store, but we want a fresh copy
 *  DS.get('document', 'ee7f3f4d-98d5-4934-9e5a-6a559b08479f');
 *
 *  DS.refresh('document', 'ee7f3f4d-98d5-4934-9e5a-6a559b08479f')
 *  .then(function (document) {
 *      document; // The fresh copy
 *  });
 *
 *  // Does not exist in the data store
 *  DS.get('document', 'aab7ff66-e21e-46e2-8be8-264d82aee535');
 *
 *  DS.refresh('document', 'aab7ff66-e21e-46e2-8be8-264d82aee535'); // false
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{RuntimeError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to refresh from the server.
 * @param {object=} options Optional configuration. Properties:
 * - `{string=}` - `mergeStrategy` - Specify what merge strategy is to be used when the fresh item returns from the
 * server and needs to be inserted into the data store. Default `"mergeWithExisting"`.
 * @returns {false|Promise} `false` if the item doesn't already exist in the data store. A `Promise` if the item does
 * exist in the data store and is being refreshed.
 *
 * ## Resolves with:
 *
 * - `{object}` - `item` - A reference to the refreshed item.
 *
 * ## Rejects with:
 *
 * - `{IllegalArgumentError}`
 * - `{RuntimeError}`
 * - `{UnhandledError}`
 */
function refresh(resourceName, id, options) {
	if (!store[resourceName]) {
		throw new errors.RuntimeError(errorPrefix + resourceName + ' is not a registered resource!');
	} else if (!utils.isString(id) && !utils.isNumber(id)) {
		throw new errors.IllegalArgumentError('DS.refresh(resourceName, id): id: Must be a string or a number!', { id: { actual: typeof id, expected: 'string|number' } });
	} else if (!utils.isObject(options)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'options: Must be an object!', { options: { actual: typeof options, expected: 'object' } });
	}

	if (id in store[resourceName].index) {
		return this.find(resourceName, id, true);
	} else {
		return false;
	}
}

module.exports = refresh;
