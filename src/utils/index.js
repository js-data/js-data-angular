module.exports = {
	isString: angular.isString,
	isArray: angular.isArray,
	isObject: angular.isObject,
	isNumber: angular.isNumber,
	toJson: angular.toJson,
	makePath: require('mout/string/makePath'),
	upperCase: require('mout/string/upperCase'),
	deepMixIn: require('mout/object/deepMixIn'),
	forOwn: require('mout/object/forOwn'),
	contains: require('mout/array/contains'),
	filter: require('mout/array/filter'),
	toLookUp: require('mout/array/toLookup'),
	slice: require('mout/array/slice'),
	sort: require('mout/array/sort'),
	updateTimestamp: function (timestamp) {
		var newTimestamp = typeof Date.now === 'function' ? Date.now() : new Date().getTime();
		if (timestamp && newTimestamp <= timestamp) {
			return timestamp + 1;
		} else {
			return newTimestamp;
		}
	},
	mergeArrays: function (a, b, mergeKey) {
		mergeKey = mergeKey || 'id';
		for (var i = 0; i < a.length; i++) {
			for (var j = 0; j < b.length; j++) {
				if (a[i][mergeKey] == b[j][mergeKey]) {
					angular.extend(a[i], b[j]);
					b.splice(j, 1);
					break;
				}
			}
		}
		return a.concat(b);
	},
	deepFreeze: function deepFreeze(o) {
		if (typeof Object.freeze === 'function') {
			var prop, propKey;
			Object.freeze(o); // First freeze the object.
			for (propKey in o) {
				prop = o[propKey];
				if (!o.hasOwnProperty(propKey) || typeof prop !== 'object' || Object.isFrozen(prop)) {
					// If the object is on the prototype, not an object, or is already frozen,
					// skip it. Note that this might leave an unfrozen reference somewhere in the
					// object if there is an already frozen object containing an unfrozen object.
					continue;
				}

				deepFreeze(prop); // Recursively call deepFreeze.
			}
		}
	}
};
