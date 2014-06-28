var errorPrefix = 'DS.refresh(resourceName, id[, options]): ';

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
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to refresh from the server.
 * @param {object=} options Optional configuration. Properties:
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
 * - `{NonexistentResourceError}`
 */
function refresh(resourceName, id, options) {
  var IA = this.errors.IA;

  options = options || {};

  if (!this.definitions[resourceName]) {
    throw new this.errors.NER(errorPrefix + resourceName);
  } else if (!this.utils.isString(id) && !this.utils.isNumber(id)) {
    throw new IA(errorPrefix + 'id: Must be a string or a number!');
  } else if (!this.utils.isObject(options)) {
    throw new IA(errorPrefix + 'options: Must be an object!');
  } else {
    options.bypassCache = true;

    if (this.get(resourceName, id)) {
      return this.find(resourceName, id, options);
    } else {
      return false;
    }
  }
}

module.exports = refresh;
