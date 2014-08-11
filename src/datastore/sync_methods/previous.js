function errorPrefix(resourceName, id) {
  return 'DS.previous(' + resourceName + '[, ' + id + ']): ';
}

/**
 * @doc method
 * @id DS.sync_methods:previous
 * @name previous
 * @description
 * Synchronously return the previous attributes of the item of the type specified by `resourceName` that has the primary key
 * specified by `id`. This object represents the state of the item the last time it was saved via an async adapter.
 *
 * ## Signature:
 * ```js
 * DS.previous(resourceName, id)
 * ```
 *
 * ## Example:
 *
 * ```js
 * var d = DS.get('document', 5); // { author: 'John Anderson', id: 5 }
 *
 * d.author = 'Sally';
 *
 * d; // { author: 'Sally', id: 5 }
 *
 * DS.previous('document', 5); // { author: 'John Anderson', id: 5 }
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item whose previous attributes are to be retrieved.
 * @returns {object} The previous attributes of the item of the type specified by `resourceName` with the primary key specified by `id`.
 */
function previous(resourceName, id) {
  if (!this.definitions[resourceName]) {
    throw new this.errors.NER(errorPrefix(resourceName, id) + resourceName);
  } else if (!this.utils.isString(id) && !this.utils.isNumber(id)) {
    throw new this.errors.IA(errorPrefix(resourceName, id) + 'id: Must be a string or a number!');
  }

  // return resource from cache
  return angular.copy(this.store[resourceName].previousAttributes[id]);
}

module.exports = previous;
