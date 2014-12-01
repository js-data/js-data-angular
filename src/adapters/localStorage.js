/*!
 * @doc function
 * @id DSLocalStorageAdapterProvider
 * @name DSLocalStorageAdapterProvider
 */
function DSLocalStorageAdapterProvider() {

  this.$get = ['$q', 'DSUtils', 'DSErrors', function ($q, DSUtils) {

    /**
     * @doc method
     * @id DSLocalStorageAdapter.methods:getPath
     * @name getPath
     * @description
     * Return the path that would be used by this adapter for a given operation.
     *
     * ## Signature:
     * ```js
     * DSLocalStorageAdapter.getPath(method, resourceConfig, id|attrs|params, options))
     * ```
     *
     * @param {string} method The name of the method .
     * @param {object} resourceConfig The object returned by DS.defineResource.
     * @param {string|object} id|attrs|params The id, attrs, or params that you would pass into the method.
     * @param {object} options Configuration options.
     * @returns {string} The path.
     */
    function getPath(method, resourceConfig, id, options) {
      options = options || {};
      var args = [
        options.baseUrl || resourceConfig.baseUrl,
        resourceConfig.getEndpoint((DSUtils.isString(id) || DSUtils.isNumber(id) || method === 'create') ? id : null, options)
      ];
      if (method === 'find' || method === 'update' || method === 'destroy') {
        args.push(id);
      }
      return DSUtils.makePath.apply(DSUtils, args);
    }

    /**
     * @doc interface
     * @id DSLocalStorageAdapter
     * @name DSLocalStorageAdapter
     * @description
     * Adapter that uses `localStorage` as its persistence layer. The localStorage adapter does not support operations
     * on collections because localStorage itself is a key-value store.
     */
    return {

      getIds: function (name, options) {
        var ids;
        var idsPath = DSUtils.makePath(options.baseUrl, 'DSKeys', name);
        var idsJson = localStorage.getItem(idsPath);
        if (idsJson) {
          ids = DSUtils.fromJson(idsJson);
        } else {
          localStorage.setItem(idsPath, DSUtils.toJson({}));
          ids = {};
        }
        return ids;
      },

      saveKeys: function (ids, name, options) {
        var keysPath = DSUtils.makePath(options.baseUrl, 'DSKeys', name);
        localStorage.setItem(keysPath, DSUtils.toJson(ids));
      },

      ensureId: function (id, name, options) {
        var ids = this.getIds(name, options);
        ids[id] = 1;
        this.saveKeys(ids, name, options);
      },

      removeId: function (id, name, options) {
        var ids = this.getIds(name, options);
        delete ids[id];
        this.saveKeys(ids, name, options);
      },

      /**
       * @doc method
       * @id DSLocalStorageAdapter.methods:GET
       * @name GET
       * @description
       * An asynchronous wrapper for `localStorage.getItem(key)`.
       *
       * ## Signature:
       * ```js
       * DSLocalStorageAdapter.GET(key)
       * ```
       *
       * @param {string} key The key path of the item to retrieve.
       * @returns {Promise} Promise.
       */
      GET: function (key) {
        var deferred = $q.defer();
        try {
          var item = localStorage.getItem(key);
          deferred.resolve(item ? angular.fromJson(item) : undefined);
        } catch (err) {
          deferred.reject(err);
        }
        return deferred.promise;
      },

      /**
       * @doc method
       * @id DSLocalStorageAdapter.methods:PUT
       * @name PUT
       * @description
       * An asynchronous wrapper for `localStorage.setItem(key, value)`.
       *
       * ## Signature:
       * ```js
       * DSLocalStorageAdapter.PUT(key, value)
       * ```
       *
       * @param {string} key The key to update.
       * @param {object} value Attributes to put.
       * @returns {Promise} Promise.
       */
      PUT: function (key, value) {
        var DSLocalStorageAdapter = this;
        return DSLocalStorageAdapter.GET(key).then(function (item) {
          if (item) {
            DSUtils.deepMixIn(item, value);
          }
          localStorage.setItem(key, JSON.stringify(item || value));
          return DSLocalStorageAdapter.GET(key);
        });
      },

      /**
       * @doc method
       * @id DSLocalStorageAdapter.methods:DEL
       * @name DEL
       * @description
       * An asynchronous wrapper for `localStorage.removeItem(key)`.
       *
       * ## Signature:
       * ```js
       * DSLocalStorageAdapter.DEL(key)
       * ```
       *
       * @param {string} key The key to remove.
       * @returns {Promise} Promise.
       */
      DEL: function (key) {
        var deferred = $q.defer();
        try {
          localStorage.removeItem(key);
          deferred.resolve();
        } catch (err) {
          deferred.reject(err);
        }
        return deferred.promise;
      },

      /**
       * @doc method
       * @id DSLocalStorageAdapter.methods:find
       * @name find
       * @description
       * Retrieve a single entity from localStorage.
       *
       * ## Signature:
       * ```js
       * DSLocalStorageAdapter.find(resourceConfig, id[, options])
       * ```
       *
       * ## Example:
       * ```js
       * DS.find('user', 5, {
       *   adapter: 'DSLocalStorageAdapter'
       * }).then(function (user) {
       *   user; // { id: 5, ... }
       * });
       * ```
       *
       * @param {object} resourceConfig DS resource definition object:
       * @param {string|number} id Primary key of the entity to retrieve.
       * @param {object=} options Optional configuration. Properties:
       *
       * - `{string=}` - `baseUrl` - Base path to use.
       *
       * @returns {Promise} Promise.
       */
      find: function find(resourceConfig, id, options) {
        options = options || {};
        return this.GET(getPath('find', resourceConfig, id, options)).then(function (item) {
          if (!item) {
            return $q.reject(new Error('Not Found!'));
          } else {
            return item;
          }
        });
      },

      /**
       * @doc method
       * @id DSLocalStorageAdapter.methods:findAll
       * @name findAll
       * @description
       * Retrieve a collections of entities from localStorage.
       *
       * ## Signature:
       * ```js
       * DSLocalStorageAdapter.findAll(resourceConfig, params[, options])
       * ```
       *
       * @param {object} resourceConfig DS resource definition object:
       * @param {object=} params Query parameters.
       * @param {object=} options Optional configuration. Properties:
       *
       * - `{string=}` - `baseUrl` - Base path to use.
       *
       * @returns {Promise} Promise.
       */
      findAll: function (resourceConfig, params, options) {
        var _this = this;
        var deferred = $q.defer();
        options = options || {};
        if (!('allowSimpleWhere' in options)) {
          options.allowSimpleWhere = true;
        }
        var items = [];
        var ids = DSUtils.keys(_this.getIds(resourceConfig.name, options));
        DSUtils.forEach(ids, function (id) {
          var itemJson = localStorage.getItem(getPath('find', resourceConfig, id, options));
          if (itemJson) {
            items.push(DSUtils.fromJson(itemJson));
          }
        });
        deferred.resolve(_this.DS.defaults.defaultFilter.call(_this.DS, items, resourceConfig.name, params, options));
        return deferred.promise;
      },

      /**
       * @doc method
       * @id DSLocalStorageAdapter.methods:create
       * @name create
       * @description
       * Create an entity in `localStorage`. You must generate the primary key and include it in the `attrs` object.
       *
       * ## Signature:
       * ```js
       * DSLocalStorageAdapter.create(resourceConfig, attrs[, options])
       * ```
       *
       * ## Example:
       * ```js
       * DS.create('user', {
       *   id: 1,
       *   name: 'john'
       * }, {
       *   adapter: 'DSLocalStorageAdapter'
       * }).then(function (user) {
       *   user; // { id: 1, name: 'john' }
       * });
       * ```
       *
       * @param {object} resourceConfig DS resource definition object:
       * @param {object} attrs Attributes to create in localStorage.
       * @param {object=} options Optional configuration. Properties:
       *
       * - `{string=}` - `baseUrl` - Base path to use.
       *
       * @returns {Promise} Promise.
       */
      create: function (resourceConfig, attrs, options) {
        var _this = this;
        var id = attrs[resourceConfig.idAttribute];
        options = options || {};
        return _this.GET(getPath('find', resourceConfig, id, options)).then(function (item) {
          if (item) {
            DSUtils.deepMixIn(item, attrs);
          } else {
            attrs[resourceConfig.idAttribute] = id = id || DSUtils.guid();
          }
          return _this.PUT(getPath('update', resourceConfig, id, options), item || attrs);
        }).then(function (item) {
          _this.ensureId(item[resourceConfig.idAttribute], resourceConfig.name, options);
          return item;
        });
      },

      /**
       * @doc method
       * @id DSLocalStorageAdapter.methods:update
       * @name update
       * @description
       * Update an entity in localStorage.
       *
       * ## Signature:
       * ```js
       * DSLocalStorageAdapter.update(resourceConfig, id, attrs[, options])
       * ```
       *
       * ## Example:
       * ```js
       * DS.update('user', 5, {
       *   name: 'john'
       * }, {
       *   adapter: 'DSLocalStorageAdapter'
       * }).then(function (user) {
       *   user; // { id: 5, ... }
       * });
       * ```
       *
       * @param {object} resourceConfig DS resource definition object:
       * @param {string|number} id Primary key of the entity to retrieve.
       * @param {object} attrs Attributes with which to update the entity.
       * @param {object=} options Optional configuration. Properties:
       *
       * - `{string=}` - `baseUrl` - Base path to use.
       *
       * @returns {Promise} Promise.
       */
      update: function (resourceConfig, id, attrs, options) {
        options = options || {};
        var _this = this;
        return _this.GET(getPath('find', resourceConfig, id, options)).then(function (item) {
          item = item || {};
          DSUtils.deepMixIn(item, attrs);
          return _this.PUT(getPath('update', resourceConfig, id, options), item);
        }).then(function (item) {
          _this.ensureId(item[resourceConfig.idAttribute], resourceConfig.name, options);
          return item;
        });
      },

      /**
       * @doc method
       * @id DSLocalStorageAdapter.methods:updateAll
       * @name updateAll
       * @description
       * Update a collections of entities in localStorage.
       *
       * ## Signature:
       * ```js
       * DSLocalStorageAdapter.updateAll(resourceConfig, attrs, params[, options])
       * ```
       *
       * @param {object} resourceConfig DS resource definition object:
       * @param {object} attrs Attributes with which to update the items.
       * @param {object=} params Query parameters.
       * @param {object=} options Optional configuration. Properties:
       *
       * - `{string=}` - `baseUrl` - Base path to use.
       *
       * @returns {Promise} Promise.
       */
      updateAll: function (resourceConfig, attrs, params, options) {
        var _this = this;
        return this.findAll(resourceConfig, params, options).then(function (items) {
          var tasks = [];
          DSUtils.forEach(items, function (item) {
            tasks.push(_this.update(resourceConfig, item[resourceConfig.idAttribute], attrs, options));
          });
          return $q.all(tasks);
        });
      },

      /**
       * @doc method
       * @id DSLocalStorageAdapter.methods:destroy
       * @name destroy
       * @description
       * Destroy an entity from localStorage.
       *
       * ## Signature:
       * ```js
       * DSLocalStorageAdapter.destroy(resourceConfig, id[, options])
       * ```
       *
       * ## Example:
       * ```js
       * DS.destroy('user', 5, {
       *   name: ''
       * }, {
       *   adapter: 'DSLocalStorageAdapter'
       * }).then(function (user) {
       *   user; // { id: 5, ... }
       * });
       * ```
       *
       * @param {object} resourceConfig DS resource definition object:
       * @param {string|number} id Primary key of the entity to destroy.
       * @param {object=} options Optional configuration. Properties:
       *
       * - `{string=}` - `baseUrl` - Base path to use.
       *
       * @returns {Promise} Promise.
       */
      destroy: function (resourceConfig, id, options) {
        options = options || {};
        return this.DEL(getPath('destroy', resourceConfig, id, options));
      },

      /**
       * @doc method
       * @id DSLocalStorageAdapter.methods:destroyAll
       * @name destroyAll
       * @description
       * Destroy a collections of entities from localStorage.
       *
       * ## Signature:
       * ```js
       * DSLocalStorageAdapter.destroyAll(resourceConfig, params[, options])
       * ```
       *
       * @param {object} resourceConfig DS resource definition object:
       * @param {object=} params Query parameters.
       * @param {object=} options Optional configuration. Properties:
       *
       * - `{string=}` - `baseUrl` - Base path to use.
       *
       * @returns {Promise} Promise.
       */
      destroyAll: function (resourceConfig, params, options) {
        var _this = this;
        return this.findAll(resourceConfig, params, options).then(function (items) {
          var tasks = [];
          DSUtils.forEach(items, function (item) {
            tasks.push(_this.destroy(resourceConfig, item[resourceConfig.idAttribute], options));
          });
          return $q.all(tasks);
        });
      }
    };
  }];
}

module.exports = DSLocalStorageAdapterProvider;
