var errorPrefix = 'DS.loadRelations(resourceName, instance(Id), relations[, options]): ';

/**
 * @doc method
 * @id DS.async_methods:loadRelations
 * @name loadRelations
 * @description
 * Asynchronously load the indicated relations of the given instance.
 *
 * ## Signature:
 * ```js
 * DS.loadRelations(resourceName, instance(Id), relations[, options])
 * ```
 *
 * ## Examples:
 *
 * ```js
 * DS.loadRelations('user', 10, ['profile']).then(function (user) {
 *   user.profile; // object
 *   assert.deepEqual(user.profile, DS.filter('profile', { userId: 10 })[0]);
 * });
 * ```
 *
 * ```js
 * var user = DS.get('user', 10);
 *
 * DS.loadRelations('user', user, ['profile']).then(function (user) {
 *   user.profile; // object
 *   assert.deepEqual(user.profile, DS.filter('profile', { userId: 10 })[0]);
 * });
 * ```
 *
 * ```js
 * DS.loadRelations('user', 10, ['profile'], { cacheResponse: false }).then(function (user) {
 *   user.profile; // object
 *   assert.equal(DS.filter('profile', { userId: 10 }).length, 0);
 * });
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number|object} instance The instance or the id of the instance for which relations are to be loaded.
 * @param {string|array=} relations The relation(s) to load.
 * @param {object=} options Optional configuration that is passed to the `find` and `findAll` methods that may be called.
 *
 * @returns {Promise} Promise produced by the `$q` service.
 *
 * ## Resolves with:
 *
 * - `{object}` - `item` - The instance with its loaded relations.
 *
 * ## Rejects with:
 *
 * - `{IllegalArgumentError}`
 * - `{NonexistentResourceError}`
 */
function loadRelations(resourceName, instance, relations, options) {
  var deferred = this.$q.defer();
  var promise = deferred.promise;

  try {
    var IA = this.errors.IA;

    options = options || {};

    if (angular.isString(instance) || angular.isNumber(instance)) {
      instance = this.get(resourceName, instance);
    }

    if (angular.isString(relations)) {
      relations = [relations];
    }

    if (!this.definitions[resourceName]) {
      throw new this.errors.NER(errorPrefix + resourceName);
    } else if (!this.utils.isObject(instance)) {
      throw new IA(errorPrefix + 'instance(Id): Must be a string, number or object!');
    } else if (!this.utils.isArray(relations)) {
      throw new IA(errorPrefix + 'relations: Must be a string or an array!');
    } else if (!this.utils.isObject(options)) {
      throw new IA(errorPrefix + 'options: Must be an object!');
    }

    var definition = this.definitions[resourceName];
    var _this = this;
    var tasks = [];
    var fields = [];

    _this.utils.forOwn(definition.relations, function (relation, type) {
      _this.utils.forOwn(relation, function (def, relationName) {
        if (_this.utils.contains(relations, relationName)) {
          var task;
          var params = {};
          params[def.foreignKey] = instance[definition.idAttribute];

          if (type === 'hasMany') {
            task = _this.findAll(relationName, params, options);
          } else if (type === 'hasOne') {
            if (def.localKey && instance[def.localKey]) {
              task = _this.find(relationName, instance[def.localKey], options);
            } else if (def.foreignKey) {
              task = _this.findAll(relationName, params, options);
            }
          } else {
            task = _this.find(relationName, instance[def.localKey], options);
          }

          if (task) {
            tasks.push(task);
            fields.push(def.localField);
          }
        }
      });
    });

    promise = promise
      .then(function () {
        return _this.$q.all(tasks);
      })
      .then(function (loadedRelations) {
        angular.forEach(fields, function (field, index) {
          instance[field] = loadedRelations[index];
        });
        return instance;
      });

    deferred.resolve();
  } catch (err) {
    deferred.reject(err);
  }

  return promise;
}

module.exports = loadRelations;
