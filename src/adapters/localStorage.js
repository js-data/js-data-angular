/**
 * @doc function
 * @id DSLocalStorageProvider
 * @name DSLocalStorageProvider
 */
function DSLocalStorageProvider() {

  this.$get = ['$q', 'DSUtils', function ($q, DSUtils) {

    /**
     * @doc interface
     * @id DSLocalStorage
     * @name DSLocalStorage
     * @description
     * Default adapter used by angular-data. This adapter uses AJAX and JSON to send/retrieve data to/from a server.
     * Developers may provide custom adapters that implement the adapter interface.
     */
    return {
      /**
       * @doc method
       * @id DSLocalStorage.methods:find
       * @name find
       * @description
       * Retrieve a single entity from localStorage.
       *
       * Calls `localStorage.getItem(key)`.
       *
       * @param {object} resourceConfig Properties:
       * - `{string}` - `baseUrl` - Base url.
       * - `{string=}` - `namespace` - Namespace path for the resource.
       * @param {string|number} id The primary key of the entity to retrieve.
       * @returns {Promise} Promise.
       */
      find: find,

      /**
       * @doc method
       * @id DSLocalStorage.methods:findAll
       * @name findAll
       * @description
       * Not supported.
       */
      findAll: function () {
        throw new Error('Not supported!');
      },

      /**
       * @doc method
       * @id DSLocalStorage.methods:findAll
       * @name find
       * @description
       * Not supported.
       */
      create: function () {
        throw new Error('Not supported!');
      },

      /**
       * @doc method
       * @id DSLocalStorage.methods:update
       * @name update
       * @description
       * Update an entity in localStorage.
       *
       * Calls `localStorage.setItem(key, value)`.
       *
       * @param {object} resourceConfig Properties:
       * - `{string}` - `baseUrl` - Base url.
       * - `{string=}` - `namespace` - Namespace path for the resource.
       * @param {string|number} id The primary key of the entity to update.
       * @param {object} attrs The attributes with which to update the entity.
       * @returns {Promise} Promise.
       */
      update: update,

      /**
       * @doc method
       * @id DSLocalStorage.methods:updateAll
       * @name updateAll
       * @description
       * Not supported.
       */
      updateAll: function () {
        throw new Error('Not supported!');
      },

      /**
       * @doc method
       * @id DSLocalStorage.methods:destroy
       * @name destroy
       * @description
       * Destroy an entity from localStorage.
       *
       * Calls `localStorage.removeItem(key)`.
       *
       * @param {object} resourceConfig Properties:
       * - `{string}` - `baseUrl` - Base url.
       * - `{string=}` - `endpoint` - Endpoint path for the resource.
       * @param {string|number} id The primary key of the entity to destroy.
       * @returns {Promise} Promise.
       */
      destroy: destroy,

      /**
       * @doc method
       * @id DSLocalStorage.methods:destroyAll
       * @name destroyAll
       * @description
       * Not supported.
       */
      destroyAll: function () {
        throw new Error('Not supported!');
      }
    };

    function GET(key) {
      var deferred = $q.defer();
      try {
        var item = localStorage.getItem(key);
        deferred.resolve(item ? angular.fromJson(item) : undefined);
      } catch (err) {
        deferred.reject(err);
      }
      return deferred.promise;
    }

    function PUT(key, value) {
      var deferred = $q.defer();
      try {
        var item = localStorage.getItem(key);
        if (item) {
          item = angular.fromJson(item);
          DSUtils.deepMixIn(item, value);
          deferred.resolve(localStorage.setItem(key, angular.toJson(item)));
        } else {
          deferred.resolve(localStorage.setItem(key, angular.toJson(value)));
        }
      } catch (err) {
        deferred.reject(err);
      }
      return deferred.promise;
    }

    function DEL(key) {
      var deferred = $q.defer();
      try {
        deferred.resolve(localStorage.removeItem(key));
      } catch (err) {
        deferred.reject(err);
      }
      return deferred.promise;
    }

    function destroy(resourceConfig, id, options) {
      options = options || {};
      return DEL(
        DSUtils.makePath(options.baseUrl || resourceConfig.baseUrl, resourceConfig.endpoint, id),
        options
      );
    }

    function find(resourceConfig, id, options) {
      options = options || {};
      return GET(
        DSUtils.makePath(options.baseUrl || resourceConfig.baseUrl, resourceConfig.endpoint, id),
        options
      );
    }

    function update(resourceConfig, id, attrs, options) {
      options = options || {};
      return PUT(
        DSUtils.makePath(options.baseUrl || resourceConfig.baseUrl, resourceConfig.endpoint, id),
        attrs,
        options
      ).then(function () {
          return GET(DSUtils.makePath(options.baseUrl || resourceConfig.baseUrl, resourceConfig.endpoint, id));
        });
    }
  }];
}

module.exports = DSLocalStorageProvider;
