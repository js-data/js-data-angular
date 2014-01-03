var utils = require('../../utils'),
	errors = require('../../errors'),
	store = require('../store');

function get(resourceName, id) {
	if (!store[resourceName]) {
		throw new errors.IllegalArgumentError('DS.get(resourceName, id): ' + resourceName + ' is not a registered resource!');
	} else if (!utils.isString(id) && !utils.isNumber(id)) {
		throw new errors.IllegalArgumentError('DS.get(resourceName, id): id: You must provide an id!');
	}

	// cache miss, request resource from server
	if (!(id in store[resourceName].index)) {
		this.find(resourceName, id);
	}

	// return resource from cache
	return store[resourceName].index[id];
}

module.exports = get;
