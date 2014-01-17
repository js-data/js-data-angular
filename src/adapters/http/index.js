function DSHttpAdapterProvider() {

	this.$get = ['$http', '$log', 'DSUtils', function ($http, $log, DSUtils) {

		var defaults = this.defaults = {
			serialize: function (data) {
				return data;
			},
			deserialize: function (data) {
				return data.data;
			}
		};

		return {
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

			find: find,

			findAll: findAll,

			create: create,

			createMany: function () {
				throw new Error('Not yet implemented!');
			},

			update: update,

			updateMany: function () {
				throw new Error('Not yet implemented!');
			},

			destroy: destroy,

			destroyMany: function () {
				throw new Error('Not yet implemented!');
			}
		};

		function HTTP(config) {
			var start = new Date().getTime();

			return $http(config).then(function (data) {
				$log.debug(data.config.method + ' request:' + data.config.url + ' Time taken: ' + (new Date().getTime() - start) + 'ms', arguments);
				return defaults.deserialize(data);
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

		/**
		 * @doc method
		 * @id DSHttpAdapter.methods:find
		 * @name find
		 * @param {object} resourceConfig Properties:
		 * - `{string}` - `baseUrl` - Base url.
		 * - `{string=}` - `endpoint` - Endpoint path for the resource.
		 * @param {string|number} id
		 * @param {object=} options
		 * @returns {Promise} Promise.
		 */
		function find(resourceConfig, id, options) {
			return this.GET(
				DSUtils.makePath(resourceConfig.baseUrl, resourceConfig.endpoint, id),
				options
			);
		}

		function findAll(resourceConfig, params, options) {
			options = options || {};
			options.params = options.params || {};
			DSUtils.deepMixIn(options, params);
			return this.GET(
				DSUtils.makePath(resourceConfig.baseUrl, resourceConfig.endpoint),
				options
			);
		}

		function create(resourceConfig, attrs, options) {
			return this.POST(
				DSUtils.makePath(resourceConfig.baseUrl, resourceConfig.endpoint),
				defaults.serialize(attrs),
				options
			);
		}

		function update(resourceConfig, attrs, options) {
			return this.PUT(
				DSUtils.makePath(resourceConfig.baseUrl, resourceConfig.endpoint, attrs[resourceConfig.idAttribute]),
				defaults.serialize(attrs),
				options
			);
		}

		function destroy(resourceConfig, id, options) {
			return this.DEL(
				DSUtils.makePath(resourceConfig.baseUrl, resourceConfig.endpoint, id),
				options
			);
		}
	}];
}

module.exports = DSHttpAdapterProvider;
