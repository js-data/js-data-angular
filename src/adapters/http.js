/**
 * @doc function
 * @id DSHttpAdapterProvider
 * @name DSHttpAdapterProvider
 */
function DSHttpAdapterProvider() {

  /**
   * @doc property
   * @id DSHttpAdapterProvider.properties:defaults
   * @name defaults
   * @description
   * Default configuration for this adapter.
   *
   * Properties:
   *
   * - `{function}` - `queryTransform` - See [the guide](/documentation/guide/adapters/index). Default: No-op.
   */
  var defaults = this.defaults = {
    /**
     * @doc property
     * @id DSHttpAdapterProvider.properties:defaults.queryTransform
     * @name defaults.queryTransform
     * @description
     * Transform the angular-data query to something your server understands. You might just do this on the server instead.
     *
     * @param {string} resourceName The name of the resource.
     * @param {object} params Params sent through from `$http()`.
     * @returns {*} Returns `params` as-is.
     */
    queryTransform: function (resourceName, params) {
      return params;
    },

    /**
     * @doc property
     * @id DSHttpAdapterProvider.properties:defaults.$httpConfig
     * @name defaults.$httpConfig
     * @description
     * Default `$http` configuration options used whenever `DSHttpAdapter` uses `$http`.
     *
     * ## Example:
     * ```js
     * angular.module('myApp').config(function (DSHttpAdapterProvider) {
     *   angular.extend(DSHttpAdapterProvider.defaults.$httpConfig, {
     *     interceptor: [...],
     *     headers: {
     *       common: {
     *         Authorization: 'Basic YmVlcDpib29w'
     *       }
     *     },
     *     timeout: 20000
     *   });
     * });
     * ```
     */
    $httpConfig: {}
  };

  this.$get = ['$http', '$log', 'DSUtils', function ($http, $log, DSUtils) {

    /**
     * @doc interface
     * @id DSHttpAdapter
     * @name DSHttpAdapter
     * @description
     * Default adapter used by angular-data. This adapter uses AJAX and JSON to send/retrieve data to/from a server.
     * Developers may provide custom adapters that implement the adapter interface.
     */
    return {
      /**
       * @doc property
       * @id DSHttpAdapter.properties:defaults
       * @name defaults
       * @description
       * Reference to [DSHttpAdapterProvider.defaults](/documentation/api/api/DSHttpAdapterProvider.properties:defaults).
       */
      defaults: defaults,

      /**
       * @doc method
       * @id DSHttpAdapter.methods:HTTP
       * @name HTTP
       * @description
       * Wrapper for `$http()`.
       *
       * ## Signature:
       * ```js
       * DS.HTTP(config)
       * ```
       *
       * ## Example:
       *
       * ```js
       * works the same as $http()
       * ```
       *
       * @param {object} config Configuration for the request.
       * @returns {Promise} Promise produced by the `$q` service.
       */
      HTTP: HTTP,

      /**
       * @doc method
       * @id DSHttpAdapter.methods:GET
       * @name GET
       * @description
       * Wrapper for `$http.get()`.
       *
       * ## Signature:
       * ```js
       * DS.GET(url[, config])
       * ```
       *
       * ## Example:
       *
       * ```js
       * Works the same as $http.get()
       * ```
       *
       * @param {string} url The url of the request.
       * @param {object=} config Configuration for the request.
       * @returns {Promise} Promise produced by the `$q` service.
       */
      GET: GET,

      /**
       * @doc method
       * @id DSHttpAdapter.methods:POST
       * @name POST
       * @description
       * Wrapper for `$http.post()`.
       *
       * ## Signature:
       * ```js
       * DS.POST(url[, attrs][, config])
       * ```
       *
       * ## Example:
       *
       * ```js
       * Works the same as $http.post()
       * ```
       *
       * @param {string} url The url of the request.
       * @param {object=} attrs Request payload.
       * @param {object=} config Configuration for the request.
       * @returns {Promise} Promise produced by the `$q` service.
       */
      POST: POST,

      /**
       * @doc method
       * @id DSHttpAdapter.methods:PUT
       * @name PUT
       * @description
       * Wrapper for `$http.put()`.
       *
       * ## Signature:
       * ```js
       * DS.PUT(url[, attrs][, config])
       * ```
       *
       * ## Example:
       *
       * ```js
       * Works the same as $http.put()
       * ```
       *
       * @param {string} url The url of the request.
       * @param {object=} attrs Request payload.
       * @param {object=} config Configuration for the request.
       * @returns {Promise} Promise produced by the `$q` service.
       */
      PUT: PUT,

      /**
       * @doc method
       * @id DSHttpAdapter.methods:DEL
       * @name DEL
       * @description
       * Wrapper for `$http.delete()`.
       *
       * ## Signature:
       * ```js
       * DS.DEL(url[, config])
       * ```
       *
       * ## Example:
       *
       * ```js
       * Works the same as $http.delete
       * ```
       *
       * @param {string} url The url of the request.
       * @param {object} config Configuration for the request.
       * @returns {Promise} Promise produced by the `$q` service.
       */
      DEL: DEL,

      /**
       * @doc method
       * @id DSHttpAdapter.methods:find
       * @name find
       * @description
       * Retrieve a single entity from the server.
       *
       * Sends a `GET` request to `:baseUrl/:endpoint/:id`.
       *
       * @param {object} resourceConfig Properties:
       * - `{string}` - `baseUrl` - Base url.
       * - `{string=}` - `endpoint` - Endpoint path for the resource.
       * @param {string|number} id The primary key of the entity to retrieve.
       * @param {object=} options Optional configuration. Refer to the documentation for `$http.get`.
       * @returns {Promise} Promise.
       */
      find: find,

      /**
       * @doc method
       * @id DSHttpAdapter.methods:findAll
       * @name findAll
       * @description
       * Retrieve a collection of entities from the server.
       *
       * Sends a `GET` request to `:baseUrl/:endpoint`.
       *
       *
       * @param {object} resourceConfig Properties:
       * - `{string}` - `baseUrl` - Base url.
       * - `{string=}` - `endpoint` - Endpoint path for the resource.
       * @param {object=} params Search query parameters. See the [query guide](/documentation/guide/queries/index).
       * @param {object=} options Optional configuration. Refer to the documentation for `$http.get`.
       * @returns {Promise} Promise.
       */
      findAll: findAll,

      /**
       * @doc method
       * @id DSHttpAdapter.methods:findAll
       * @name find
       * @description
       * Create a new entity on the server.
       *
       * Sends a `POST` request to `:baseUrl/:endpoint`.
       *
       * @param {object} resourceConfig Properties:
       * - `{string}` - `baseUrl` - Base url.
       * - `{string=}` - `endpoint` - Endpoint path for the resource.
       * @param {object=} params Search query parameters. See the [query guide](/documentation/guide/queries/index).
       * @param {object=} options Optional configuration. Refer to the documentation for `$http.post`.
       * @returns {Promise} Promise.
       */
      create: create,

      /**
       * @doc method
       * @id DSHttpAdapter.methods:update
       * @name update
       * @description
       * Update an entity on the server.
       *
       * Sends a `PUT` request to `:baseUrl/:endpoint/:id`.
       *
       * @param {object} resourceConfig Properties:
       * - `{string}` - `baseUrl` - Base url.
       * - `{string=}` - `endpoint` - Endpoint path for the resource.
       * @param {string|number} id The primary key of the entity to update.
       * @param {object} attrs The attributes with which to update the entity. See the [query guide](/documentation/guide/queries/index).
       * @param {object=} options Optional configuration. Refer to the documentation for `$http.put`.
       * @returns {Promise} Promise.
       */
      update: update,

      /**
       * @doc method
       * @id DSHttpAdapter.methods:updateAll
       * @name updateAll
       * @description
       * Update a collection of entities on the server.
       *
       * Sends a `PUT` request to `:baseUrl/:endpoint`.
       *
       *
       * @param {object} resourceConfig Properties:
       * - `{string}` - `baseUrl` - Base url.
       * - `{string=}` - `endpoint` - Endpoint path for the resource.
       * @param {object=} params Search query parameters. See the [query guide](/documentation/guide/queries/index).
       * @param {object=} options Optional configuration. Refer to the documentation for `$http.put`.
       * @returns {Promise} Promise.
       */
      updateAll: updateAll,

      /**
       * @doc method
       * @id DSHttpAdapter.methods:destroy
       * @name destroy
       * @description
       * destroy an entity on the server.
       *
       * Sends a `PUT` request to `:baseUrl/:endpoint/:id`.
       *
       * @param {object} resourceConfig Properties:
       * - `{string}` - `baseUrl` - Base url.
       * - `{string=}` - `endpoint` - Endpoint path for the resource.
       * @param {string|number} id The primary key of the entity to destroy.
       * @param {object=} options Optional configuration. Refer to the documentation for `$http.delete`.
       * @returns {Promise} Promise.
       */
      destroy: destroy,

      /**
       * @doc method
       * @id DSHttpAdapter.methods:destroyAll
       * @name destroyAll
       * @description
       * Retrieve a collection of entities from the server.
       *
       * Sends a `DELETE` request to `:baseUrl/:endpoint`.
       *
       *
       * @param {object} resourceConfig Properties:
       * - `{string}` - `baseUrl` - Base url.
       * - `{string=}` - `endpoint` - Endpoint path for the resource.
       * @param {object=} params Search query parameters. See the [query guide](/documentation/guide/queries/index).
       * @param {object=} options Optional configuration. Refer to the documentation for `$http.delete`.
       * @returns {Promise} Promise.
       */
      destroyAll: destroyAll
    };

    function HTTP(config) {
      var start = new Date().getTime();

      config = DSUtils.deepMixIn(config, defaults.$httpConfig);
      return $http(config).then(function (data) {
        $log.debug(data.config.method + ' request:' + data.config.url + ' Time taken: ' + (new Date().getTime() - start) + 'ms', arguments);
        return data;
      });
    }

    function GET(url, config) {
      config = config || {};
      return HTTP(DSUtils.deepMixIn(config, {
        url: url,
        method: 'GET'
      }));
    }

    function POST(url, attrs, config) {
      config = config || {};
      return HTTP(DSUtils.deepMixIn(config, {
        url: url,
        data: attrs,
        method: 'POST'
      }));
    }

    function PUT(url, attrs, config) {
      config = config || {};
      return HTTP(DSUtils.deepMixIn(config, {
        url: url,
        data: attrs,
        method: 'PUT'
      }));
    }

    function DEL(url, config) {
      config = config || {};
      return this.HTTP(DSUtils.deepMixIn(config, {
        url: url,
        method: 'DELETE'
      }));
    }

    function create(resourceConfig, attrs, options) {
      options = options || {};
      return this.POST(
        DSUtils.makePath(options.baseUrl || resourceConfig.baseUrl, resourceConfig.endpoint),
        attrs,
        options
      );
    }

    function destroy(resourceConfig, id, options) {
      options = options || {};
      return this.DEL(
        DSUtils.makePath(options.baseUrl || resourceConfig.baseUrl, resourceConfig.endpoint, id),
        options
      );
    }

    function destroyAll(resourceConfig, params, options) {
      options = options || {};
      options.params = options.params || {};
      if (params) {
        params = defaults.queryTransform(resourceConfig.name, params);
        DSUtils.deepMixIn(options.params, params);
      }
      return this.DEL(
        DSUtils.makePath(options.baseUrl || resourceConfig.baseUrl, resourceConfig.endpoint),
        options
      );
    }

    function find(resourceConfig, id, options) {
      options = options || {};
      return this.GET(
        DSUtils.makePath(options.baseUrl || resourceConfig.baseUrl, resourceConfig.endpoint, id),
        options
      );
    }

    function findAll(resourceConfig, params, options) {
      options = options || {};
      options.params = options.params || {};
      if (params) {
        params = defaults.queryTransform(resourceConfig.name, params);
        DSUtils.deepMixIn(options.params, params);
      }
      return this.GET(
        DSUtils.makePath(options.baseUrl || resourceConfig.baseUrl, resourceConfig.endpoint),
        options
      );
    }

    function update(resourceConfig, id, attrs, options) {
      options = options || {};
      return this.PUT(
        DSUtils.makePath(options.baseUrl || resourceConfig.baseUrl, resourceConfig.endpoint, id),
        attrs,
        options
      );
    }

    function updateAll(resourceConfig, attrs, params, options) {
      options = options || {};
      options.params = options.params || {};
      if (params) {
        params = defaults.queryTransform(resourceConfig.name, params);
        DSUtils.deepMixIn(options.params, params);
      }
      return this.PUT(
        DSUtils.makePath(options.baseUrl || resourceConfig.baseUrl, resourceConfig.endpoint),
        attrs,
        options
      );
    }
  }];
}

module.exports = DSHttpAdapterProvider;
