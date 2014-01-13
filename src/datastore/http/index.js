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
 * `DS.HTTP(config)`
 *
 * Wrapper for `$http()`.
 *
 * Example:
 *
 * ```js
 * TODO: HTTP(config) example
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
 * `DS.GET(url[, config])`
 *
 * Wrapper for `$http.get()`.
 *
 * Example:
 *
 * ```js
 * TODO: GET(url[, config]) example
 * ```
 *
 * @param {string} url The url of the request.
 * @param {object} config Configuration for the request.
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
 * `DS.PUT(url[, attrs][, config])`
 *
 * Wrapper for `$http.put()`.
 *
 * Example:
 *
 * ```js
 * TODO: PUT(url[, attrs][, config]) example
 * ```
 *
 * @param {string} url The url of the request.
 * @param {object} attrs Request payload.
 * @param {object} config Configuration for the request.
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
 * `DS.POST(url[, attrs][, config])`
 *
 * Wrapper for `$http.post()`.
 *
 * Example:
 *
 * ```js
 * TODO: POST(url[, attrs][, config]) example
 * ```
 *
 * @param {string} url The url of the request.
 * @param {object} attrs Request payload.
 * @param {object} config Configuration for the request.
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
 * `DS.DEL(url[, config])`
 *
 * Wrapper for `$http.delete()`.
 *
 * Example:
 *
 * ```js
 * TODO: DEL(url[, config]) example
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
	 * `DS.HTTP(config)`
	 *
	 * Wrapper for `$http()`.
	 *
	 * Example:
	 *
	 * ```js
	 * TODO: HTTP(config) example
	 * ```
	 *
	 * @param {object} config Configuration for the request.
	 * @returns {Promise} Promise produced by the `$q` service.
	 */
	HTTP: HTTP,

	/**
	 * @doc method
	 * @id DS.async_methods:GET
	 * @name GET
	 * @methodOf DS
	 * @description
	 * `DS.GET(url[, config])`
	 *
	 * Wrapper for `$http.get()`.
	 *
	 * Example:
	 *
	 * ```js
	 * TODO: GET(url[, config]) example
	 * ```
	 *
	 * @param {string} url The url of the request.
	 * @param {object} config Configuration for the request.
	 * @returns {Promise} Promise produced by the `$q` service.
	 */
	GET: GET,

	/**
	 * @doc method
	 * @id DS.async_methods:POST
	 * @name POST
	 * @methodOf DS
	 * @description
	 * `DS.POST(url[, attrs][, config])`
	 *
	 * Wrapper for `$http.post()`.
	 *
	 * Example:
	 *
	 * ```js
	 * TODO: POST(url[, attrs][, config]) example
	 * ```
	 *
	 * @param {string} url The url of the request.
	 * @param {object} attrs Request payload.
	 * @param {object} config Configuration for the request.
	 * @returns {Promise} Promise produced by the `$q` service.
	 */
	POST: POST,

	/**
	 * @doc method
	 * @id DS.async_methods:PUT
	 * @name PUT
	 * @methodOf DS
	 * @description
	 * `DS.PUT(url[, attrs][, config])`
	 *
	 * Wrapper for `$http.put()`.
	 *
	 * Example:
	 *
	 * ```js
	 * TODO: PUT(url[, attrs][, config]) example
	 * ```
	 *
	 * @param {string} url The url of the request.
	 * @param {object} attrs Request payload.
	 * @param {object} config Configuration for the request.
	 * @returns {Promise} Promise produced by the `$q` service.
	 */
	PUT: PUT,

	/**
	 * @doc method
	 * @id DS.async_methods:DEL
	 * @name DEL
	 * @methodOf DS
	 * @description
	 * `DS.DEL(url[, config])`
	 *
	 * Wrapper for `$http.delete()`.
	 *
	 * Example:
	 *
	 * ```js
	 * TODO: DEL(url[, config]) example
	 * ```
	 *
	 * @param {string} url The url of the request.
	 * @param {object} config Configuration for the request.
	 * @returns {Promise} Promise produced by the `$q` service.
	 */
	DEL: DEL
};
