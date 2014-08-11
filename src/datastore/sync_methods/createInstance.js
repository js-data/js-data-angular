function errorPrefix(resourceName) {
  return 'DS.createInstance(' + resourceName + '[, attrs][, options]): ';
}

/**
 * @doc method
 * @id DS.sync_methods:createInstance
 * @name createInstance
 * @description
 * Return a new instance of the specified resource.
 *
 * ## Signature:
 * ```js
 * DS.createInstance(resourceName[, attrs][, options])
 * ```
 *
 * ## Example:
 *
 * ```js
 * // Thanks to createInstance, you don't have to do this anymore
 * var User = DS.definitions.user[DS.definitions.user.class];
 *
 * var user = DS.createInstance('user');
 *
 * user instanceof User; // true
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {object=} attrs Optional attributes to mix in to the new instance.
 * @param {object=} options Optional configuration. Properties:
 *
 * - `{boolean=}` - `useClass` - Whether to use the resource's wrapper class. Default: `true`.
 *
 * @returns {object} The new instance
 */
function createInstance(resourceName, attrs, options) {
  var IA = this.errors.IA;

  attrs = attrs || {};
  options = options || {};

  if (!this.definitions[resourceName]) {
    throw new this.errors.NER(errorPrefix(resourceName) + resourceName);
  } else if (attrs && !this.utils.isObject(attrs)) {
    throw new IA(errorPrefix(resourceName) + 'attrs: Must be an object!');
  } else if (!this.utils.isObject(options)) {
    throw new IA(errorPrefix(resourceName) + 'options: Must be an object!');
  }

  if (!('useClass' in options)) {
    options.useClass = true;
  }

  var item;

  if (options.useClass) {
    var Func = this.definitions[resourceName][this.definitions[resourceName].class];
    item = new Func();
  } else {
    item = {};
  }
  return this.utils.deepMixIn(item, attrs);
}

module.exports = createInstance;
