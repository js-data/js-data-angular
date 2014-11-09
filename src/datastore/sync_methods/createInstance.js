function errorPrefix(resourceName) {
  return 'DS.createInstance(' + resourceName + '[, attrs][, options]): ';
}

/**
 * @doc method
 * @id DS.sync methods:createInstance
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
 * var User = DS.defineResource({
 *   name: 'user',
 *   methods: {
 *     say: function () {
 *       return 'hi';
 *     }
 *   }
 * });
 *
 * var user = User.createInstance();
 * var user2 = DS.createInstance('user');
 *
 * user instanceof User[User.class]; // true
 * user2 instanceof User[User.class]; // true
 *
 * user.say(); // hi
 * user2.say(); // hi
 *
 * var user3 = User.createInstance({ name: 'John' }, { useClass: false });
 * var user4 = DS.createInstance('user', { name: 'John' }, { useClass: false });
 *
 * user3; // { name: 'John' }
 * user3 instanceof User[User.class]; // false
 *
 * user4; // { name: 'John' }
 * user4 instanceof User[User.class]; // false
 *
 * user3.say(); // TypeError: undefined is not a function
 * user4.say(); // TypeError: undefined is not a function
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
 * - `{boolean=}` - `useClass` - Whether to wrap the injected item with the resource's instance constructor.
 *
 * @returns {object} The new instance.
 */
function createInstance(resourceName, attrs, options) {
  var DS = this;
  var IA = DS.errors.IA;
  var definition = DS.definitions[resourceName];

  attrs = attrs || {};
  options = options || {};

  if (!definition) {
    throw new DS.errors.NER(errorPrefix(resourceName) + resourceName);
  } else if (attrs && !DS.utils.isObject(attrs)) {
    throw new IA(errorPrefix(resourceName) + 'attrs: Must be an object!');
  } else if (!DS.utils.isObject(options)) {
    throw new IA(errorPrefix(resourceName) + 'options: Must be an object!');
  }

  if (!('useClass' in options)) {
    options.useClass = definition.useClass;
  }

  var item;

  if (options.useClass) {
    var Func = definition[definition['class']];
    item = new Func();
  } else {
    item = {};
  }
  return DS.utils.deepMixIn(item, attrs);
}

module.exports = createInstance;
