var services = require('./services');

function DataStoreProvider() {
	this.$get = ['$rootScope', '$log', '$http', '$q', function ($rootScope, $log, $http, $q) {

		services.$rootScope = $rootScope;
		services.$log = $log;
		services.$http = $http;
		services.$q = $q;

		var HTTP = require('./http');

		return {
			HTTP: HTTP.HTTP,
			GET: HTTP.GET,
			POST: HTTP.POST,
			PUT: HTTP.PUT,
			DEL: HTTP.DEL,
			defineResource: require('./defineResource'),
			destroy: require('./destroy'),
			eject: require('./eject'),
			filter: require('./filter'),
			findAll: require('./findAll'),
			find: require('./find'),
			get: require('./get'),
			inject: require('./inject'),
			lastModified: require('./lastModified')
		};
	}];
}

module.exports = DataStoreProvider;
