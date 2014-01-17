var utils = require('utils'),
	errors = require('errors'),
	services = require('services');

function _$http(deferred, config) {
	var start = new Date().getTime();

	services.$http(config).success(function (data, status, headers, config) {
		services.$log.debug(config.method + ' request:' + config.url + ' Time taken: ' + (new Date().getTime() - start) + 'ms', arguments);
		deferred.resolve(data);
	}).error(function (data, status, headers, config) {
			services.$log.error(arguments);
			deferred.reject(data);
		});
}

/**
 * @doc method
 * @id DS.async_methods:HTTP
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
function HTTP(config) {
	var deferred = services.$q.defer();

	try {
		if (!services.$rootScope.$$phase) {
			services.$rootScope.$apply(function () {
				_$http(deferred, config);
			});
		} else {
			_$http(deferred, config);
		}
	} catch (err) {
		deferred.reject(new errors.UnhandledError(err));
	}

	return deferred.promise;
}

/**
 * @doc method
 * @id DS.async_methods:GET
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
function GET(url, config) {
	config = config || {};
	return HTTP(utils.deepMixIn(config, {
		url: url,
		method: 'GET'
	}));
}

/**
 * @doc method
 * @id DS.async_methods:PUT
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
function PUT(url, attrs, config) {
	config = config || {};
	return HTTP(utils.deepMixIn(config, {
		url: url,
		data: attrs,
		method: 'PUT'
	}));
}

/**
 * @doc method
 * @id DS.async_methods:POST
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
function POST(url, attrs, config) {
	config = config || {};
	return HTTP(utils.deepMixIn(config, {
		url: url,
		data: attrs,
		method: 'POST'
	}));
}

/**
 * @doc method
 * @id DS.async_methods:DEL
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
function DEL(url, config) {
	config = config || {};
	return HTTP(utils.deepMixIn(config, {
		url: url,
		method: 'DELETE'
	}));
}

module.exports = {
	/**
	 * @doc method
	 * @id DS.async_methods:HTTP
	 * @name HTTP
	 * @methodOf DS
	 * @description
	 * See [DS.HTTP](/documentation/api/api/DS.async_methods:HTTP).
	 */
	HTTP: HTTP,

	/**
	 * @doc method
	 * @id DS.async_methods:GET
	 * @name GET
	 * @methodOf DS
	 * @description
	 * See [DS.GET](/documentation/api/api/DS.async_methods:GET).
	 */
	GET: GET,

	/**
	 * @doc method
	 * @id DS.async_methods:POST
	 * @name POST
	 * @methodOf DS
	 * @description
	 * See [DS.POST](/documentation/api/api/DS.async_methods:POST).
	 */
	POST: POST,

	/**
	 * @doc method
	 * @id DS.async_methods:PUT
	 * @name PUT
	 * @methodOf DS
	 * @description
	 * See [DS.PUT](/documentation/api/api/DS.async_methods:PUT).
	 */
	PUT: PUT,

	/**
	 * @doc method
	 * @id DS.async_methods:DEL
	 * @name DEL
	 * @methodOf DS
	 * @description
	 * See [DS.DEL](/documentation/api/api/DS.async_methods:DEL).
	 */
	DEL: DEL
};
