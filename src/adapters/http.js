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
     * ## Example:
     * ```js
     * DSHttpAdapterProvider.defaults.queryTransform = function (resourceName, params) {
     *   if (params && params.userId) {
     *     params.user_id = params.userId;
     *     delete params.userId;
     *   }
     *   return params;
     * };
     * ```
     *
     * @param {string} resourceName The name of the resource.
     * @param {object} params Params that will be passed to `$http`.
     * @returns {*} By default just returns `params` as-is.
     */
    queryTransform: function (resourceName, params) {
      return params;
    },

    forceTrailingSlash: false,

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
     *     headers: {
     *       Authorization: 'Basic YmVlcDpib29w'
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
     * @doc method
     * @id DSHttpAdapter.methods:getPath
     * @name getPath
     * @description
     * Return the path that would be used by this adapter for a given operation.
     *
     * ## Signature:
     * ```js
     * DSHttpAdapter.getPath(method, resourceConfig, id|attrs|params, options))
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

      getPath: getPath,

      /**
       * @doc method
       * @id DSHttpAdapter.methods:HTTP
       * @name HTTP
       * @description
       * A wrapper for `$http()`.
       *
       * ## Signature:
       * ```js
       * DSHttpAdapter.HTTP(config)
       * ```
       *
       * @param {object} config Configuration object.
       * @returns {Promise} Promise.
       */
      HTTP: function (config) {
        var start = new Date().getTime();

        if (this.defaults.forceTrailingSlash && config.url[config.url.length] !== '/') {
          config.url += '/';
        }
        config = DSUtils.deepMixIn(config, defaults.$httpConfig);
        return $http(config).then(function (data) {
          $log.debug(data.config.method + ' request:' + data.config.url + ' Time taken: ' + (new Date().getTime() - start) + 'ms', arguments);
          return data;
        });
      },

      /**
       * @doc method
       * @id DSHttpAdapter.methods:GET
       * @name GET
       * @description
       * A wrapper for `$http.get()`.
       *
       * ## Signature:
       * ```js
       * DSHttpAdapter.GET(url[, config])
       * ```
       *
       * @param {string} url The url of the request.
       * @param {object=} config Optional configuration.
       * @returns {Promise} Promise.
       */
      GET: function (url, config) {
        config = config || {};
        if (!('method' in config)) {
          config.method = 'GET';
        }
        return this.HTTP(DSUtils.deepMixIn(config, {
          url: url
        }));
      },

      /**
       * @doc method
       * @id DSHttpAdapter.methods:POST
       * @name POST
       * @description
       * A wrapper for `$http.post()`.
       *
       * ## Signature:
       * ```js
       * DSHttpAdapter.POST(url[, attrs][, config])
       * ```
       *
       * @param {string} url The url of the request.
       * @param {object=} attrs Request payload.
       * @param {object=} config Optional configuration.
       * @returns {Promise} Promise.
       */
      POST: function (url, attrs, config) {
        config = config || {};
        if (!('method' in config)) {
          config.method = 'POST';
        }
        return this.HTTP(DSUtils.deepMixIn(config, {
          url: url,
          data: attrs
        }));
      },

      /**
       * @doc method
       * @id DSHttpAdapter.methods:PUT
       * @name PUT
       * @description
       * A wrapper for `$http.put()`.
       *
       * ## Signature:
       * ```js
       * DSHttpAdapter.PUT(url[, attrs][, config])
       * ```
       *
       * @param {string} url The url of the request.
       * @param {object=} attrs Request payload.
       * @param {object=} config Optional configuration.
       * @returns {Promise} Promise.
       */
      PUT: function (url, attrs, config) {
        config = config || {};
        if (!('method' in config)) {
          config.method = 'PUT';
        }
        return this.HTTP(DSUtils.deepMixIn(config, {
          url: url,
          data: attrs || {}
        }));
      },

      /**
       * @doc method
       * @id DSHttpAdapter.methods:DEL
       * @name DEL
       * @description
       * A wrapper for `$http.delete()`.
       *
       * ## Signature:
       * ```js
       * DSHttpAdapter.DEL(url[, config])
       * ```
       *
       * @param {string} url The url of the request.
       * @param {object=} config Optional configuration.
       * @returns {Promise} Promise.
       */
      DEL: function (url, config) {
        config = config || {};
        if (!('method' in config)) {
          config.method = 'DELETE';
        }
        return this.HTTP(DSUtils.deepMixIn(config, {
          url: url
        }));
      },

      /**
       * @doc method
       * @id DSHttpAdapter.methods:find
       * @name find
       * @description
       * Retrieve a single entity from the server.
       *
       * Makes a `GET` request.
       *
       * ## Signature:
       * ```js
       * DSHttpAdapter.find(resourceConfig, id[, options])
       * ```
       *
       * @param {object} resourceConfig DS resource definition object:
       * @param {string|number} id Primary key of the entity to update.
       * @param {object=} options Optional configuration. Also passed along to `$http([config])`. Properties:
       *
       * - `{string=}` - `baseUrl` - Override the default base url.
       * - `{string=}` - `endpoint` - Override the default endpoint.
       * - `{object=}` - `params` - Additional query string parameters to add to the url.
       *
       * @returns {Promise} Promise.
       */
      find: function (resourceConfig, id, options) {
        options = options || {};
        return this.GET(
          getPath('find', resourceConfig, id, options),
          options
        );
      },

      /**
       * @doc method
       * @id DSHttpAdapter.methods:findAll
       * @name findAll
       * @description
       * Retrieve a collection of entities from the server.
       *
       * Makes a `GET` request.
       *
       * ## Signature:
       * ```js
       * DSHttpAdapter.findAll(resourceConfig[, params][, options])
       * ```
       *
       * @param {object} resourceConfig DS resource definition object:
       * @param {object=} params Search query parameters. See the [query guide](/documentation/guide/queries/index).
       * @param {object=} options Optional configuration. Also passed along to `$http([config])`. Properties:
       *
       * - `{string=}` - `baseUrl` - Override the default base url.
       * - `{string=}` - `endpoint` - Override the default endpoint.
       * - `{object=}` - `params` - Additional query string parameters to add to the url.
       *
       * @returns {Promise} Promise.
       */
      findAll: function (resourceConfig, params, options) {
        options = options || {};
        options.params = options.params || {};
        if (params) {
          params = defaults.queryTransform(resourceConfig.name, params);
          DSUtils.deepMixIn(options.params, params);
        }
        return this.GET(
          getPath('findAll', resourceConfig, params, options),
          options
        );
      },

      /**
       * @doc method
       * @id DSHttpAdapter.methods:create
       * @name create
       * @description
       * Create a new entity on the server.
       *
       * Makes a `POST` request.
       *
       * ## Signature:
       * ```js
       * DSHttpAdapter.create(resourceConfig, attrs[, options])
       * ```
       *
       * @param {object} resourceConfig DS resource definition object:
       * @param {object} attrs The attribute payload.
       * @param {object=} options Optional configuration. Also passed along to `$http([config])`. Properties:
       *
       * - `{string=}` - `baseUrl` - Override the default base url.
       * - `{string=}` - `endpoint` - Override the default endpoint.
       * - `{object=}` - `params` - Additional query string parameters to add to the url.
       *
       * @returns {Promise} Promise.
       */
      create: function (resourceConfig, attrs, options) {
        options = options || {};
        return this.POST(
          getPath('create', resourceConfig, attrs, options),
          attrs,
          options
        );
      },

      /**
       * @doc method
       * @id DSHttpAdapter.methods:update
       * @name update
       * @description
       * Update an entity on the server.
       *
       * Makes a `PUT` request.
       *
       * ## Signature:
       * ```js
       * DSHttpAdapter.update(resourceConfig, id, attrs[, options])
       * ```
       *
       * @param {object} resourceConfig DS resource definition object:
       * @param {string|number} id Primary key of the entity to update.
       * @param {object} attrs The attribute payload.
       * @param {object=} options Optional configuration. Also passed along to `$http([config])`. Properties:
       *
       * - `{string=}` - `baseUrl` - Override the default base url.
       * - `{string=}` - `endpoint` - Override the default endpoint.
       * - `{object=}` - `params` - Additional query string parameters to add to the url.
       *
       * @returns {Promise} Promise.
       */
      update: function (resourceConfig, id, attrs, options) {
        options = options || {};
        return this.PUT(
          getPath('update', resourceConfig, id, options),
          attrs,
          options
        );
      },

      /**
       * @doc method
       * @id DSHttpAdapter.methods:updateAll
       * @name updateAll
       * @description
       * Update a collection of entities on the server.
       *
       * Makes a `PUT` request.
       *
       * ## Signature:
       * ```js
       * DSHttpAdapter.updateAll(resourceConfig, attrs[, params][, options])
       * ```
       *
       * @param {object} resourceConfig DS resource definition object:
       * @param {object} attrs The attribute payload.
       * @param {object=} params Search query parameters. See the [query guide](/documentation/guide/queries/index).
       * @param {object=} options Optional configuration. Also passed along to `$http([config])`. Properties:
       *
       * - `{string=}` - `baseUrl` - Override the default base url.
       * - `{string=}` - `endpoint` - Override the default endpoint.
       * - `{object=}` - `params` - Additional query string parameters to add to the url.
       *
       * @returns {Promise} Promise.
       */
      updateAll: function (resourceConfig, attrs, params, options) {
        options = options || {};
        options.params = options.params || {};
        if (params) {
          params = defaults.queryTransform(resourceConfig.name, params);
          DSUtils.deepMixIn(options.params, params);
        }
        return this.PUT(
          getPath('updateAll', resourceConfig, attrs, options),
          attrs,
          options
        );
      },

      /**
       * @doc method
       * @id DSHttpAdapter.methods:destroy
       * @name destroy
       * @description
       * Delete an entity on the server.
       *
       * Makes a `DELETE` request.
       *
       * ## Signature:
       * ```js
       * DSHttpAdapter.destroy(resourceConfig, id[, options)
       * ```
       *
       * @param {object} resourceConfig DS resource definition object:
       * @param {string|number} id Primary key of the entity to update.
       * @param {object=} options Optional configuration. Also passed along to `$http([config])`. Properties:
       *
       * - `{string=}` - `baseUrl` - Override the default base url.
       * - `{string=}` - `endpoint` - Override the default endpoint.
       * - `{object=}` - `params` - Additional query string parameters to add to the url.
       *
       * @returns {Promise} Promise.
       */
      destroy: function (resourceConfig, id, options) {
        options = options || {};
        return this.DEL(
          getPath('destroy', resourceConfig, id, options),
          options
        );
      },

      /**
       * @doc method
       * @id DSHttpAdapter.methods:destroyAll
       * @name destroyAll
       * @description
       * Delete a collection of entities on the server.
       *
       * Makes `DELETE` request.
       *
       * ## Signature:
       * ```js
       * DSHttpAdapter.destroyAll(resourceConfig[, params][, options])
       * ```
       *
       * @param {object} resourceConfig DS resource definition object:
       * @param {object=} params Search query parameters. See the [query guide](/documentation/guide/queries/index).
       * @param {object=} options Optional configuration. Also passed along to `$http([config])`. Properties:
       *
       * - `{string=}` - `baseUrl` - Override the default base url.
       * - `{string=}` - `endpoint` - Override the default endpoint.
       * - `{object=}` - `params` - Additional query string parameters to add to the url.
       *
       * @returns {Promise} Promise.
       */
      destroyAll: function (resourceConfig, params, options) {
        options = options || {};
        options.params = options.params || {};
        if (params) {
          params = defaults.queryTransform(resourceConfig.name, params);
          DSUtils.deepMixIn(options.params, params);
        }
        return this.DEL(
          getPath('destroyAll', resourceConfig, params, options),
          options
        );
      }
    };
  }];
}

module.exports = DSHttpAdapterProvider;
