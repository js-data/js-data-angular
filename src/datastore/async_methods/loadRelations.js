function errorPrefix(resourceName) {
  return 'DS.loadRelations(' + resourceName + ', instance(Id), relations[, options]): ';
}

/**
 * @doc method
 * @id DS.async methods:loadRelations
 * @name loadRelations
 * @description
 * Asynchronously load the indicated relations of the given instance.
 *
 * ## Signature:
 * ```js
 * DS.loadRelations(resourceName, instance|id, relations[, options])
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
 * @param {object=} options Optional configuration. Also passed along to the adapter's `find` or `findAll` methods.
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
  var DS = this;
  var DSUtils = DS.utils;
  var deferred = DS.$q.defer();

  try {
    var IA = DS.errors.IA;
    var definition = DS.definitions[resourceName];

    options = options || {};

    if (DSUtils.isString(instance) || DSUtils.isNumber(instance)) {
      instance = DS.get(resourceName, instance);
    }

    if (angular.isString(relations)) {
      relations = [relations];
    }

    if (!definition) {
      throw new DS.errors.NER(errorPrefix(resourceName) + resourceName);
    } else if (!DSUtils.isObject(instance)) {
      throw new IA(errorPrefix(resourceName) + 'instance(Id): Must be a string, number or object!');
    } else if (!DSUtils.isArray(relations)) {
      throw new IA(errorPrefix(resourceName) + 'relations: Must be a string or an array!');
    } else if (!DSUtils.isObject(options)) {
      throw new IA(errorPrefix(resourceName) + 'options: Must be an object!');
    }

    options = DSUtils._(definition, options);

    if (!options.hasOwnProperty('findBelongsTo')) {
      options.findBelongsTo = true;
    }
    if (!options.hasOwnProperty('findHasMany')) {
      options.findHasMany = true;
    }

    var tasks = [];
    var fields = [];

    DSUtils.forEach(definition.relationList, function (def) {
      var relationName = def.relation;
      if (DSUtils.contains(relations, relationName)) {
        var task;
        var params = {};
        if (options.allowSimpleWhere) {
          params[def.foreignKey] = instance[definition.idAttribute];
        } else {
          params.where = {};
          params.where[def.foreignKey] = {
            '==': instance[definition.idAttribute]
          };
        }

        if (def.type === 'hasMany' && params[def.foreignKey]) {
          task = DS.findAll(relationName, params, options);
        } else if (def.type === 'hasOne') {
          if (def.localKey && instance[def.localKey]) {
            task = DS.find(relationName, instance[def.localKey], options);
          } else if (def.foreignKey && params[def.foreignKey]) {
            task = DS.findAll(relationName, params, options).then(function (hasOnes) {
              return hasOnes.length ? hasOnes[0] : null;
            });
          }
        } else if (instance[def.localKey]) {
          task = DS.find(relationName, instance[def.localKey], options);
        }

        if (task) {
          tasks.push(task);
          fields.push(def.localField);
        }
      }
    });

    deferred.resolve();

    return deferred.promise
      .then(function () {
        return DS.$q.all(tasks);
      })
      .then(function (loadedRelations) {
        angular.forEach(fields, function (field, index) {
          instance[field] = loadedRelations[index];
        });
        return instance;
      });
  } catch (err) {
    deferred.reject(err);
    return deferred.promise;
  }
}

module.exports = loadRelations;
