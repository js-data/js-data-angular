function errorPrefix(resourceName) {
  return 'DS.compute(' + resourceName + ', instance): ';
}

function _compute(fn, field) {
  var _this = this;
  var args = [];
  angular.forEach(fn.deps, function (dep) {
    args.push(_this[dep]);
  });
  // compute property
  this[field] = fn[fn.length - 1].apply(this, args);
}

/**
 * @doc method
 * @id DS.sync methods:compute
 * @name compute
 * @description
 * Force the given instance or the item with the given primary key to recompute its computed properties.
 *
 * ## Signature:
 * ```js
 * DS.compute(resourceName, instance)
 * ```
 *
 * ## Example:
 *
 * ```js
 * var User = DS.defineResource({
 *   name: 'user',
 *   computed: {
 *     fullName: ['first', 'last', function (first, last) {
 *       return first + ' ' + last;
 *     }]
 *   }
 * });
 *
 * var user = User.createInstance({ first: 'John', last: 'Doe' });
 * user.fullName; // undefined
 *
 * User.compute(user);
 *
 * user.fullName; // "John Doe"
 *
 * var user2 = User.inject({ id: 2, first: 'Jane', last: 'Doe' });
 * user2.fullName; // undefined
 *
 * User.compute(1);
 *
 * user2.fullName; // "Jane Doe"
 *
 * // if you don't pass useClass: false then you can do:
 * var user3 = User.createInstance({ first: 'Sally', last: 'Doe' });
 * user3.fullName; // undefined
 * user3.DSCompute();
 * user3.fullName; // "Sally Doe"
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {object|string|number} instance Instance or primary key of the instance (must be in the store) for which to recompute properties.
 * @returns {Object} The instance.
 */
function compute(resourceName, instance) {
  var DS = this;
  var IA = DS.errors.IA;
  var definition = DS.definitions[resourceName];

  instance = DS.utils.resolveItem(DS.store[resourceName], instance);
  if (!definition) {
    throw new DS.errors.NER(errorPrefix(resourceName) + resourceName);
  } else if (!DS.utils.isObject(instance) && !DS.utils.isString(instance) && !DS.utils.isNumber(instance)) {
    throw new IA(errorPrefix(resourceName) + 'instance: Must be an object, string or number!');
  }

  if (DS.utils.isString(instance) || DS.utils.isNumber(instance)) {
    instance = DS.get(resourceName, instance);
  }

  DS.utils.forEach(definition.computed, function (fn, field) {
    _compute.call(instance, fn, field);
  });

  return instance;
}

module.exports = {
  compute: compute,
  _compute: _compute
};
