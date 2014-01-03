module.exports = {
	isString: angular.isString,
	isArray: angular.isArray,
	isObject: angular.isObject,
	isNumber: angular.isNumber,
	deepMixIn: require('mout/object/deepMixIn'),
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
	}
};
