(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){


    /**
     * Checks if the value is created by the `Object` constructor.
     */
    function isPlainObject(value) {
        return (!!value && typeof value === 'object' &&
            value.constructor === Object);
    }

    module.exports = isPlainObject;



},{}],2:[function(require,module,exports){
var forOwn = require('./forOwn');
var isPlainObject = require('../lang/isPlainObject');

    /**
     * Mixes objects into the target object, recursively mixing existing child
     * objects.
     */
    function deepMixIn(target, objects) {
        var i = 0,
            n = arguments.length,
            obj;

        while(++i < n){
            obj = arguments[i];
            if (obj) {
                forOwn(obj, copyProp, target);
            }
        }

        return target;
    }

    function copyProp(val, key) {
        var existing = this[key];
        if (isPlainObject(val) && isPlainObject(existing)) {
            deepMixIn(existing, val);
        } else {
            this[key] = val;
        }
    }

    module.exports = deepMixIn;



},{"../lang/isPlainObject":1,"./forOwn":4}],3:[function(require,module,exports){


    var _hasDontEnumBug,
        _dontEnums;

    function checkDontEnum(){
        _dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ];

        _hasDontEnumBug = true;

        for (var key in {'toString': null}) {
            _hasDontEnumBug = false;
        }
    }

    /**
     * Similar to Array/forEach but works over object properties and fixes Don't
     * Enum bug on IE.
     * based on: http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
     */
    function forIn(obj, fn, thisObj){
        var key, i = 0;
        // no need to check if argument is a real object that way we can use
        // it for arrays, functions, date, etc.

        //post-pone check till needed
        if (_hasDontEnumBug == null) checkDontEnum();

        for (key in obj) {
            if (exec(fn, obj, key, thisObj) === false) {
                break;
            }
        }

        if (_hasDontEnumBug) {
            while (key = _dontEnums[i++]) {
                // since we aren't using hasOwn check we need to make sure the
                // property was overwritten
                if (obj[key] !== Object.prototype[key]) {
                    if (exec(fn, obj, key, thisObj) === false) {
                        break;
                    }
                }
            }
        }
    }

    function exec(fn, obj, key, thisObj){
        return fn.call(thisObj, obj[key], key, obj);
    }

    module.exports = forIn;



},{}],4:[function(require,module,exports){
var hasOwn = require('./hasOwn');
var forIn = require('./forIn');

    /**
     * Similar to Array/forEach but works over object properties and fixes Don't
     * Enum bug on IE.
     * based on: http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
     */
    function forOwn(obj, fn, thisObj){
        forIn(obj, function(val, key){
            if (hasOwn(obj, key)) {
                return fn.call(thisObj, obj[key], key, obj);
            }
        });
    }

    module.exports = forOwn;



},{"./forIn":3,"./hasOwn":5}],5:[function(require,module,exports){


    /**
     * Safer Object.hasOwnProperty
     */
     function hasOwn(obj, prop){
         return Object.prototype.hasOwnProperty.call(obj, prop);
     }

     module.exports = hasOwn;



},{}],6:[function(require,module,exports){
/**
 * @method bubbleUp
 * @param {array} heap The heap.
 * @param {function} weightFunc The weight function.
 * @param {number} n The index of the element to bubble up.
 */
function bubbleUp(heap, weightFunc, n) {
	var element = heap[n],
		weight = weightFunc(element);
	// When at 0, an element can not go up any further.
	while (n > 0) {
		// Compute the parent element's index, and fetch it.
		var parentN = Math.floor((n + 1) / 2) - 1,
			parent = heap[parentN];
		// If the parent has a lesser weight, things are in order and we
		// are done.
		if (weight >= weightFunc(parent)) {
			break;
		} else {
			heap[parentN] = element;
			heap[n] = parent;
			n = parentN;
		}
	}
}

/**
 * @method bubbleDown
 * @param {array} heap The heap.
 * @param {function} weightFunc The weight function.
 * @param {number} n The index of the element to sink down.
 */
function bubbleDown(heap, weightFunc, n) {
	var length = heap.length,
		node = heap[n],
		nodeWeight = weightFunc(node);

	while (true) {
		var child2N = (n + 1) * 2,
			child1N = child2N - 1;
		var swap = null;
		if (child1N < length) {
			var child1 = heap[child1N],
				child1Weight = weightFunc(child1);
			// If the score is less than our node's, we need to swap.
			if (child1Weight < nodeWeight) {
				swap = child1N;
			}
		}
		// Do the same checks for the other child.
		if (child2N < length) {
			var child2 = heap[child2N],
				child2Weight = weightFunc(child2);
			if (child2Weight < (swap === null ? nodeWeight : weightFunc(heap[child1N]))) {
				swap = child2N;
			}
		}

		if (swap === null) {
			break;
		} else {
			heap[n] = heap[swap];
			heap[swap] = node;
			n = swap;
		}
	}
}

/**
 * @class BinaryHeap
 * @desc BinaryHeap implementation of a priority queue.
 * @param {function} weightFunc Function that returns the value that should be used for node value comparison.
 * @example
 * angular.module('app').controller(function (BinaryHeap) {
 *      var bHeap = new BinaryHeap(function (x) {
 *          return x.value;
 *      });
 * );
 */
function BinaryHeap(weightFunc) {
	if (weightFunc && typeof weightFunc !== 'function') {
		throw new Error('BinaryHeap(weightFunc): weightFunc: must be a function!');
	}
	weightFunc = weightFunc || function (x) {
		return x;
	};
	this.weightFunc = weightFunc;
	this.heap = [];
}

/**
 * @method BinaryHeap.push
 * @desc Push an element into the binary heap.
 * @param {*} node The element to push into the binary heap.
 */
BinaryHeap.prototype.push = function (node) {
	this.heap.push(node);
	bubbleUp(this.heap, this.weightFunc, this.heap.length - 1);
};

/**
 * @method BinaryHeap.peek
 * @desc Return, but do not remove, the minimum element in the binary heap.
 * @returns {*}
 */
BinaryHeap.prototype.peek = function () {
	return this.heap[0];
};

/**
 * @method BinaryHeap.pop
 * @desc Remove and return the minimum element in the binary heap.
 * @returns {*}
 */
BinaryHeap.prototype.pop = function () {
	var front = this.heap[0],
		end = this.heap.pop();
	if (this.heap.length > 0) {
		this.heap[0] = end;
		bubbleDown(this.heap, this.weightFunc, 0);
	}
	return front;
};

/**
 * @method BinaryHeap.remove
 * @desc Remove the first node in the priority queue that satisfies angular.equals comparison with
 * the given node.
 * @param {*} node The node to remove.
 * @returns {*} The removed node.
 */
BinaryHeap.prototype.remove = function (node) {
	var length = this.heap.length;
	for (var i = 0; i < length; i++) {
		if (angular.equals(this.heap[i], node)) {
			var removed = this.heap[i],
				end = this.heap.pop();
			if (i !== length - 1) {
				this.heap[i] = end;
				bubbleUp(this.heap, this.weightFunc, i);
				bubbleDown(this.heap, this.weightFunc, i);
			}
			return removed;
		}
	}
	return null;
};

/**
 * @method BinaryHeap.removeAll
 * @desc Remove all nodes from this BinaryHeap.
 */
BinaryHeap.prototype.removeAll = function () {
	this.heap = [];
};

/**
 * @method BinaryHeap.size
 * @desc Return the size of the priority queue.
 * @returns {number} The size of the priority queue.
 */
BinaryHeap.prototype.size = function () {
	return this.heap.length;
};

module.exports = BinaryHeap;

},{}],7:[function(require,module,exports){
var utils = require('../../utils'),
	errors = require('../../errors'),
	store = require('../store');

/**
 * @doc method
 * @id DS.methods:defineResource
 * @name defineResource(definition)
 * @description
 * Register a resource definition with the data store.
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}` - Argument `definition` must be a string or an object.
 * - `{RuntimeError}` - Property `name` of argument `definition` must not refer to an already registered resource.
 * - `{UnhandledError}` - Thrown for any uncaught exception.
 *
 * @param {string|object} definition Name of resource or resource definition object: Properties:
 *
 * - `{string}` - `name` - The name by which this resource will be identified.
 * - `{string=}` - `idAttribute` - The attribute that specifies the primary key for this resource. Default is `"id"`.
 */
function defineResource(definition) {
	if (utils.isString(definition)) {
		definition = {
			name: definition
		};
	}
	if (!utils.isObject(definition)) {
		throw new errors.IllegalArgumentError('DS.defineResource(definition): definition: Must be an object!', { definition: { actual: typeof definition, expected: 'object' } });
	} else if (!utils.isString(definition.name)) {
		throw new errors.IllegalArgumentError('DS.defineResource(definition): definition.name: Must be a string!', { definition: { name: { actual: typeof definition.name, expected: 'string' } } });
	} else if (definition.idAttribute && !utils.isString(definition.idAttribute)) {
		throw new errors.IllegalArgumentError('DS.defineResource(definition): definition.idAttribute: Must be a string!', { definition: { idAttribute: { actual: typeof definition.idAttribute, expected: 'string' } } });
	} else if (store[definition.name]) {
		throw new errors.RuntimeError('DS.defineResource(definition): ' + definition.name + ' is already registered!');
	}

	try {
		store[definition.name] = definition;

		var resource = store[definition.name];
		resource.collection = [];
		resource.completedQueries = {};
		resource.pendingQueries = {};
		resource.index = {};
		resource.modified = {};
		resource.collectionModified = 0;
	} catch (err) {
		throw new errors.UnhandledError(err);
	}
}

module.exports = defineResource;

},{"../../errors":19,"../../utils":21,"../store":18}],8:[function(require,module,exports){
function destroy() {

}

module.exports = destroy;

},{}],9:[function(require,module,exports){
var utils = require('../../utils'),
	errors = require('../../errors'),
	store = require('../store'),
	services = require('../services');

function _eject(resource, id) {
	for (var i = 0; i < resource.collection.length; i++) {
		if (resource.collection[i][resource.idAttribute || 'id'] == id) {
			break;
		}
	}

	resource.collection.splice(i, 1);
	delete resource.index[id];
	delete resource.modified[id];
	resource.collectionModified = utils.updateTimestamp(resource.collectionModified);
}

/**
 * @doc method
 * @id DS.methods:eject
 * @name eject(resourceName, id)
 * @description
 * Synchronously remove the item of type `resourceName` with the given primary key from the data store (not from the
 * server).
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}` - Argument `id` must be a string or a number.
 * - `{RuntimeError}` - Argument `resourceName` must refer to an already registered resource.
 * - `{UnhandledError}` - Thrown for any uncaught exception.
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to remove.
 */
function eject(resourceName, id) {
	if (!store[resourceName]) {
		throw new errors.RuntimeError('DS.eject(resourceName, id): ' + resourceName + ' is not a registered resource!');
	} else if (!utils.isString(id) && !utils.isNumber(id)) {
		throw new errors.IllegalArgumentError('DS.eject(resourceName, id): id: You must provide an id!', { id: { actual: typeof id, expected: 'string|number' } });
	}

	try {
		if (!services.$rootScope.$$phase) {
			services.$rootScope.$apply(function () {
				_eject(store[resourceName], id);
			});
		} else {
			_eject(store[resourceName], id);
		}
	} catch (err) {
		throw new errors.UnhandledError(err);
	}
}

module.exports = eject;

},{"../../errors":19,"../../utils":21,"../services":17,"../store":18}],10:[function(require,module,exports){
function filter() {

}

module.exports = filter;

},{}],11:[function(require,module,exports){
function findAll() {

}

module.exports = findAll;

},{}],12:[function(require,module,exports){
function find() {

}

module.exports = find;

},{}],13:[function(require,module,exports){
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

},{"../../errors":19,"../../utils":21,"../store":18}],14:[function(require,module,exports){
var services = require('./services');

function DataStoreProvider() {
	this.$get = ['$rootScope', '$log', '$http', '$q', function ($rootScope, $log, $http, $q) {

		services.$rootScope = $rootScope;
		services.$log = $log;
		services.$http = $http;
		services.$q = $q;

		return {
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

},{"./defineResource":7,"./destroy":8,"./eject":9,"./filter":10,"./find":11,"./findAll":12,"./get":13,"./inject":15,"./lastModified":16,"./services":17}],15:[function(require,module,exports){
var utils = require('../../utils'),
	errors = require('../../errors'),
	store = require('../store'),
	services = require('../services');

function _inject(resource, attrs) {
	var idAttribute = resource.idAttribute || 'id';
	if (resource.index[attrs[idAttribute]]) {
		utils.deepMixIn(resource.index[attrs[idAttribute]], attrs);
	} else {
		resource.index[attrs[idAttribute]] = attrs;
		resource.collection.push(resource.index[attrs[idAttribute]]);
	}
	resource.modified[attrs[idAttribute]] = utils.updateTimestamp(resource.modified[attrs[idAttribute]]);
	resource.collectionModified = utils.updateTimestamp(resource.collectionModified);
}

/**
 * @doc method
 * @id DS.methods:inject
 * @name inject(resourceName, attrs)
 * @description
 * Inject an item of type `resourceName` (which already exists on the server) into the data store.
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {object} attrs The item to inject into the data store.
 * @returns {object} A reference to the item that was injected into the data store.
 */
function inject(resourceName, attrs) {
	if (!store[resourceName]) {
		throw new errors.RuntimeError('DS.inject(resourceName, attrs): ' + resourceName + ' is not a registered resource!');
	} else if (!utils.isObject(attrs)) {
		throw new errors.IllegalArgumentError('DS.inject(resourceName, attrs): attrs: Must be an object!', { attrs: { actual: typeof attrs, expected: 'object' } });
	}

	var resource = store[resourceName];

	var idAttribute = resource.idAttribute || 'id';
	if (!attrs[idAttribute]) {
		throw new errors.RuntimeError('DS.inject(resourceName, attrs): attrs: Must contain the property specified by `idAttribute` in the resource definition!');
	} else {
		try {
			if (!services.$rootScope.$$phase) {
				services.$rootScope.$apply(function () {
					_inject(store[resourceName], attrs);
				});
			} else {
				_inject(store[resourceName], attrs);
			}
		} catch (err) {
			throw new errors.UnhandledError(err);
		}
		return resource.index[attrs[idAttribute]];
	}
}

module.exports = inject;

},{"../../errors":19,"../../utils":21,"../services":17,"../store":18}],16:[function(require,module,exports){
var utils = require('../../utils'),
	errors = require('../../errors'),
	store = require('../store');

/**
 * @doc method
 * @id DS.methods:lastModified
 * @name lastModified(resourceName[, id])
 * @description
 * Return the timestamp of the last time either the collection for `resourceName` or the item of type `resourceName`
 * with the given primary key was modified.
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}` - Argument `id` must be a string or a number.
 * - `{RuntimeError}` - Argument `resourceName` must refer to an already registered resource.
 * - `{UnhandledError}` - Thrown for any uncaught exception.
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number=} id The primary key of the item to remove.
 * @returns {number} The timestamp of the last time either the collection for `resourceName` or the item of type
 * `resourceName` with the given primary key was modified.
 */
function lastModified(resourceName, id) {
	if (!store[resourceName]) {
		throw new errors.RuntimeError('DS.lastModified(resourceName[, id]): ' + resourceName + ' is not a registered resource!');
	} else if (id && !utils.isString(id) && !utils.isNumber(id)) {
		throw new errors.IllegalArgumentError('DS.lastModified(resourceName[, id]): id: Must be a string or number!', { id: { actual: typeof id, expected: 'string|number' } });
	}
	try {
		if (id) {
			if (!(id in store[resourceName].modified)) {
				store[resourceName].modified[id] = 0;
			}
			return store[resourceName].modified[id];
		}
		return store[resourceName].collectionModified;
	} catch (err) {
		throw new errors.UnhandledError(err);
	}
}

module.exports = lastModified;

},{"../../errors":19,"../../utils":21,"../store":18}],17:[function(require,module,exports){
module.exports = {};

},{}],18:[function(require,module,exports){
module.exports = {

};

},{}],19:[function(require,module,exports){
/**
 * @doc interface
 * @id errors
 * @name angular-data error types
 * @description
 * `UnhandledError`, `IllegalArgumentError` and `ValidationError`.
 */
module.exports = {
	/**
	 * @doc function
	 * @id errors.types:UnhandledError
	 * @name UnhandledError
	 * @description Error that is thrown/returned when Reheat encounters an uncaught/unknown exception.
	 * @param {Error} error The originally thrown error.
	 * @returns {UnhandledError} A new instance of `UnhandledError`.
	 */
	UnhandledError: function UnhandledError(error) {
		Error.call(this);
		Error.captureStackTrace(this, this.constructor);

		error = error || {};

		/**
		 * @doc property
		 * @id errors.types:UnhandledError.type
		 * @name type
		 * @propertyOf errors.types:UnhandledError
		 * @description Name of error type. Default: `"UnhandledError"`.
		 */
		this.type = this.constructor.name;

		/**
		 * @doc property
		 * @id errors.types:UnhandledError.originalError
		 * @name originalError
		 * @propertyOf errors.types:UnhandledError
		 * @description A reference to the original error that was thrown.
		 */
		this.originalError = error;

		/**
		 * @doc property
		 * @id errors.types:UnhandledError.message
		 * @name message
		 * @propertyOf errors.types:UnhandledError
		 * @description Message and stack trace. Same as `UnhandledError#stack`.
		 */
		this.message = 'UnhandledError: This is an uncaught exception. Please consider submitting an issue at https://github.com/jmdobry/reheat/issues.\n\n' +
			'Original Uncaught Exception:\n' + (error.stack ? error.stack.toString() : error.stack);

		/**
		 * @doc property
		 * @id errors.types:UnhandledError.stack
		 * @name stack
		 * @propertyOf errors.types:UnhandledError
		 * @description Message and stack trace. Same as `UnhandledError#message`.
		 */
		this.stack = this.message;
	},

	/**
	 * @doc function
	 * @id errors.types:IllegalArgumentError
	 * @name IllegalArgumentError
	 * @description Error that is thrown/returned when a caller does not honor the pre-conditions of a method/function.
	 * @param {string=} message Error message. Default: `"Illegal Argument!"`.
	 * @param {object=} errors Object containing information about the error.
	 * @returns {IllegalArgumentError} A new instance of `IllegalArgumentError`.
	 */
	IllegalArgumentError: function IllegalArgumentError(message, errors) {
		Error.call(this);
		Error.captureStackTrace(this, this.constructor);

		/**
		 * @doc property
		 * @id errors.types:IllegalArgumentError.type
		 * @name type
		 * @propertyOf errors.types:IllegalArgumentError
		 * @description Name of error type. Default: `"IllegalArgumentError"`.
		 */
		this.type = this.constructor.name;

		/**
		 * @doc property
		 * @id errors.types:IllegalArgumentError.errors
		 * @name errors
		 * @propertyOf errors.types:IllegalArgumentError
		 * @description Object containing information about the error.
		 */
		this.errors = errors || {};

		/**
		 * @doc property
		 * @id errors.types:IllegalArgumentError.message
		 * @name message
		 * @propertyOf errors.types:IllegalArgumentError
		 * @description Error message. Default: `"Illegal Argument!"`.
		 */
		this.message = message || 'Illegal Argument!';
	},

	/**
	 * @doc function
	 * @id errors.types:ValidationError
	 * @name ValidationError
	 * @description Error that is thrown/returned when validation of a schema fails.
	 * @param {string=} message Error message. Default: `"Validation Error!"`.
	 * @param {object=} errors Object containing information about the error.
	 * @returns {ValidationError} A new instance of `ValidationError`.
	 */
	ValidationError: function ValidationError(message, errors) {
		Error.call(this);
		Error.captureStackTrace(this, this.constructor);

		/**
		 * @doc property
		 * @id errors.types:ValidationError.type
		 * @name type
		 * @propertyOf errors.types:ValidationError
		 * @description Name of error type. Default: `"ValidationError"`.
		 */
		this.type = this.constructor.name;

		/**
		 * @doc property
		 * @id errors.types:ValidationError.errors
		 * @name errors
		 * @propertyOf errors.types:ValidationError
		 * @description Object containing information about the error.
		 */
		this.errors = errors || {};

		/**
		 * @doc property
		 * @id errors.types:ValidationError.message
		 * @name message
		 * @propertyOf errors.types:ValidationError
		 * @description Error message. Default: `"Validation Error!"`.
		 */
		this.message = message || 'Validation Error!';
	},

	/**
	 * @doc function
	 * @id errors.types:RuntimeError
	 * @name RuntimeError
	 * @description Error that is thrown/returned for invalid state during runtime.
	 * @param {string=} message Error message. Default: `"Runtime Error!"`.
	 * @param {object=} errors Object containing information about the error.
	 * @returns {RuntimeError} A new instance of `RuntimeError`.
	 */
	RuntimeError: function RuntimeError(message, errors) {
		Error.call(this);
		Error.captureStackTrace(this, this.constructor);

		/**
		 * @doc property
		 * @id errors.types:RuntimeError.type
		 * @name type
		 * @propertyOf errors.types:RuntimeError
		 * @description Name of error type. Default: `"RuntimeError"`.
		 */
		this.type = this.constructor.name;

		/**
		 * @doc property
		 * @id errors.types:RuntimeError.errors
		 * @name errors
		 * @propertyOf errors.types:RuntimeError
		 * @description Object containing information about the error.
		 */
		this.errors = errors || {};

		/**
		 * @doc property
		 * @id errors.types:RuntimeError.message
		 * @name message
		 * @propertyOf errors.types:RuntimeError
		 * @description Error message. Default: `"Runtime Error!"`.
		 */
		this.message = message || 'RuntimeError Error!';
	}
};

},{}],20:[function(require,module,exports){
(function (window, angular, undefined) {
	'use strict';

	angular.module('jmdobry.binary-heap', []);
	function BinaryHeapProvider() {
		this.$get = function () {
			return require('./binaryHeap');
		};
	}
	angular.module('jmdobry.binary-heap').provider('BinaryHeap', BinaryHeapProvider);

	angular.module('jmdobry.angular-data', ['ng', 'jmdobry.binary-heap']);
	angular.module('jmdobry.angular-data').provider('DS', require('./datastore'));

})(window, window.angular);

},{"./binaryHeap":6,"./datastore":14}],21:[function(require,module,exports){
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

},{"mout/object/deepMixIn":2}]},{},[20])