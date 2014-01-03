(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var indexOf = require('./indexOf');

    /**
     * If array contains values.
     */
    function contains(arr, val) {
        return indexOf(arr, val) !== -1;
    }
    module.exports = contains;


},{"./indexOf":3}],2:[function(require,module,exports){
var makeIterator = require('../function/makeIterator_');

    /**
     * Array filter
     */
    function filter(arr, callback, thisObj) {
        callback = makeIterator(callback, thisObj);
        var results = [];
        if (arr == null) {
            return results;
        }

        var i = -1, len = arr.length, value;
        while (++i < len) {
            value = arr[i];
            if (callback(value, i, arr)) {
                results.push(value);
            }
        }

        return results;
    }

    module.exports = filter;



},{"../function/makeIterator_":8}],3:[function(require,module,exports){


    /**
     * Array.indexOf
     */
    function indexOf(arr, item, fromIndex) {
        fromIndex = fromIndex || 0;
        if (arr == null) {
            return -1;
        }

        var len = arr.length,
            i = fromIndex < 0 ? len + fromIndex : fromIndex;
        while (i < len) {
            // we iterate over sparse items since there is no way to make it
            // work properly on IE 7-8. see #64
            if (arr[i] === item) {
                return i;
            }

            i++;
        }

        return -1;
    }

    module.exports = indexOf;


},{}],4:[function(require,module,exports){


    var arrSlice = Array.prototype.slice;

    /**
     * Create slice of source array or array-like object
     */
    function slice(arr, start, end){
        return arrSlice.call(arr, start, end);
    }

    module.exports = slice;



},{}],5:[function(require,module,exports){


    /**
     * Merge sort (http://en.wikipedia.org/wiki/Merge_sort)
     */
    function mergeSort(arr, compareFn) {
        if (arr == null) {
            return [];
        } else if (arr.length < 2) {
            return arr;
        }

        if (compareFn == null) {
            compareFn = defaultCompare;
        }

        var mid, left, right;

        mid   = ~~(arr.length / 2);
        left  = mergeSort( arr.slice(0, mid), compareFn );
        right = mergeSort( arr.slice(mid, arr.length), compareFn );

        return merge(left, right, compareFn);
    }

    function defaultCompare(a, b) {
        return a < b ? -1 : (a > b? 1 : 0);
    }

    function merge(left, right, compareFn) {
        var result = [];

        while (left.length && right.length) {
            if (compareFn(left[0], right[0]) <= 0) {
                // if 0 it should preserve same order (stable)
                result.push(left.shift());
            } else {
                result.push(right.shift());
            }
        }

        if (left.length) {
            result.push.apply(result, left);
        }

        if (right.length) {
            result.push.apply(result, right);
        }

        return result;
    }

    module.exports = mergeSort;



},{}],6:[function(require,module,exports){
var isFunction = require('../lang/isFunction');

    /**
     * Creates an object that holds a lookup for the objects in the array.
     */
    function toLookup(arr, key) {
        var result = {};
        if (arr == null) {
            return result;
        }

        var i = -1, len = arr.length, value;
        if (isFunction(key)) {
            while (++i < len) {
                value = arr[i];
                result[key(value)] = value;
            }
        } else {
            while (++i < len) {
                value = arr[i];
                result[value[key]] = value;
            }
        }

        return result;
    }
    module.exports = toLookup;


},{"../lang/isFunction":11}],7:[function(require,module,exports){


    /**
     * Returns the first argument provided to it.
     */
    function identity(val){
        return val;
    }

    module.exports = identity;



},{}],8:[function(require,module,exports){
var identity = require('./identity');
var prop = require('./prop');
var deepMatches = require('../object/deepMatches');

    /**
     * Converts argument into a valid iterator.
     * Used internally on most array/object/collection methods that receives a
     * callback/iterator providing a shortcut syntax.
     */
    function makeIterator(src, thisObj){
        if (src == null) {
            return identity;
        }
        switch(typeof src) {
            case 'function':
                // function is the first to improve perf (most common case)
                // also avoid using `Function#call` if not needed, which boosts
                // perf a lot in some cases
                return (typeof thisObj !== 'undefined')? function(val, i, arr){
                    return src.call(thisObj, val, i, arr);
                } : src;
            case 'object':
                return function(val){
                    return deepMatches(val, src);
                };
            case 'string':
            case 'number':
                return prop(src);
        }
    }

    module.exports = makeIterator;



},{"../object/deepMatches":16,"./identity":7,"./prop":9}],9:[function(require,module,exports){


    /**
     * Returns a function that gets a property of the passed object
     */
    function prop(name){
        return function(obj){
            return obj[name];
        };
    }

    module.exports = prop;



},{}],10:[function(require,module,exports){
var isKind = require('./isKind');
    /**
     */
    var isArray = Array.isArray || function (val) {
        return isKind(val, 'Array');
    };
    module.exports = isArray;


},{"./isKind":12}],11:[function(require,module,exports){
var isKind = require('./isKind');
    /**
     */
    function isFunction(val) {
        return isKind(val, 'Function');
    }
    module.exports = isFunction;


},{"./isKind":12}],12:[function(require,module,exports){
var kindOf = require('./kindOf');
    /**
     * Check if value is from a specific "kind".
     */
    function isKind(val, kind){
        return kindOf(val) === kind;
    }
    module.exports = isKind;


},{"./kindOf":14}],13:[function(require,module,exports){


    /**
     * Checks if the value is created by the `Object` constructor.
     */
    function isPlainObject(value) {
        return (!!value && typeof value === 'object' &&
            value.constructor === Object);
    }

    module.exports = isPlainObject;



},{}],14:[function(require,module,exports){


    var _rKind = /^\[object (.*)\]$/,
        _toString = Object.prototype.toString,
        UNDEF;

    /**
     * Gets the "kind" of value. (e.g. "String", "Number", etc)
     */
    function kindOf(val) {
        if (val === null) {
            return 'Null';
        } else if (val === UNDEF) {
            return 'Undefined';
        } else {
            return _rKind.exec( _toString.call(val) )[1];
        }
    }
    module.exports = kindOf;


},{}],15:[function(require,module,exports){


    /**
     * Typecast a value to a String, using an empty string value for null or
     * undefined.
     */
    function toString(val){
        return val == null ? '' : val.toString();
    }

    module.exports = toString;



},{}],16:[function(require,module,exports){
var forOwn = require('./forOwn');
var isArray = require('../lang/isArray');

    function containsMatch(array, pattern) {
        var i = -1, length = array.length;
        while (++i < length) {
            if (deepMatches(array[i], pattern)) {
                return true;
            }
        }

        return false;
    }

    function matchArray(target, pattern) {
        var i = -1, patternLength = pattern.length;
        while (++i < patternLength) {
            if (!containsMatch(target, pattern[i])) {
                return false;
            }
        }

        return true;
    }

    function matchObject(target, pattern) {
        var result = true;
        forOwn(pattern, function(val, key) {
            if (!deepMatches(target[key], val)) {
                // Return false to break out of forOwn early
                return (result = false);
            }
        });

        return result;
    }

    /**
     * Recursively check if the objects match.
     */
    function deepMatches(target, pattern){
        if (target && typeof target === 'object') {
            if (isArray(target) && isArray(pattern)) {
                return matchArray(target, pattern);
            } else {
                return matchObject(target, pattern);
            }
        } else {
            return target === pattern;
        }
    }

    module.exports = deepMatches;



},{"../lang/isArray":10,"./forOwn":19}],17:[function(require,module,exports){
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



},{"../lang/isPlainObject":13,"./forOwn":19}],18:[function(require,module,exports){


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



},{}],19:[function(require,module,exports){
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



},{"./forIn":18,"./hasOwn":20}],20:[function(require,module,exports){


    /**
     * Safer Object.hasOwnProperty
     */
     function hasOwn(obj, prop){
         return Object.prototype.hasOwnProperty.call(obj, prop);
     }

     module.exports = hasOwn;



},{}],21:[function(require,module,exports){
var toString = require('../lang/toString');
    /**
     * "Safer" String.toUpperCase()
     */
    function upperCase(str){
        str = toString(str);
        return str.toUpperCase();
    }
    module.exports = upperCase;


},{"../lang/toString":15}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
var utils = require('../../utils'),
	errors = require('../../errors'),
	services = require('../services');

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
 * @name HTTP(config)
 * @description
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
 * @name GET(url[, config])
 * @description
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
	return HTTP(utils.deepMixIn(config, {
		url: url,
		method: 'GET'
	}));
}

/**
 * @doc method
 * @id DS.async_methods:PUT
 * @name PUT(url[, attrs][, config])
 * @description
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
	return HTTP(utils.deepMixIn(config, {
		url: url,
		data: attrs,
		method: 'PUT'
	}));
}

/**
 * @doc method
 * @id DS.async_methods:POST
 * @name POST(url[, attrs][, config])
 * @description
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
	return HTTP(utils.deepMixIn(config, {
		url: url,
		data: attrs,
		method: 'POST'
	}));
}

/**
 * @doc method
 * @id DS.async_methods:DEL
 * @name DEL(url[, config])
 * @description
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
	return HTTP(utils.deepMixIn(config, {
		url: url,
		method: 'DELETE'
	}));
}

module.exports = {
	HTTP: HTTP,
	GET: GET,
	POST: POST,
	PUT: PUT,
	DEL: DEL
};

},{"../../errors":37,"../../utils":39,"../services":35}],24:[function(require,module,exports){
var utils = require('../../utils'),
	errors = require('../../errors'),
	store = require('../store');

/**
 * @doc method
 * @id DS.sync_methods:defineResource
 * @name defineResource(definition)
 * @description
 * Register a resource definition with the data store.
 *
 * Example:
 *
 * ```js
 * TODO: defineResource(definition)
 * ```
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

},{"../../errors":37,"../../utils":39,"../store":36}],25:[function(require,module,exports){
var utils = require('../../utils'),
	errors = require('../../errors'),
	store = require('../store');

/**
 * @doc method
 * @id DS.async_methods:destroy
 * @name destroy(resourceName, id)
 * @description
 * Delete the item of the type specified by `resourceName` with the primary key specified by `id` from the data store
 * and the server.
 *
 * Example:
 *
 * ```js
 * TODO: destroy(name, id) example
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to remove.
 * @returns {Promise} Promise produced by the `$q` service.
 *
 * ## ResolvesWith:
 *
 * - `{string|number}` - `id` - The primary key of the destroyed item.
 *
 * ## RejectsWith:
 *
 * - `{IllegalArgumentError}` - `err` - Argument `id` must be a string or a number.
 * - `{RuntimeError}` - `err` - Argument `resourceName` must refer to an already registered resource.
 * - `{UnhandledError}` - `err` - Thrown for any uncaught exception.
 */
function destroy(resourceName, id) {
	var deferred = $q.defer();
	if (!store[resourceName]) {
		deferred.reject(new errors.RuntimeError('DS.destroy(resourceName, id): ' + resourceName + ' is not a registered resource!'));
	} else if (!utils.isString(id) && !utils.isNumber(id)) {
		deferred.reject(new errors.IllegalArgumentError('DS.destroy(resourceName, id): id: Must be a string or a number!', { id: { actual: typeof id, expected: 'string|number' } }));
	}

	try {
		var resource = store[resourceName];

		this.DEL(resource.baseUrl + '/' + (resource.endpoint || resourceName + '/' + id), null).then(function (data) {
			try {
				delete resource.index[id];
				delete resource.modified[id];

				for (var i = 0; i < resource.collection.length; i++) {
					if (resource.collection[i][resource.idAttribute || 'id'] == id) {
						break;
					}
				}
				resource.collection.splice(i, 1);
				resource.collectionModified = utils.updateTimestamp(resource.collectionModified);
				deferred.resolve(id);
			} catch (err) {
				deferred.reject(new errors.UnhandledError(err));
			}
		}, deferred.reject);
	} catch (err) {
		deferred.reject(new errors.UnhandledError(err));
	}

	return deferred.promise;
}

module.exports = destroy;

},{"../../errors":37,"../../utils":39,"../store":36}],26:[function(require,module,exports){
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
 * @id DS.sync_methods:eject
 * @name eject(name, id)
 * @description
 * Synchronously remove the item of type `resourceName` with the given primary key from the data store (not from the
 * server).
 *
 * Example:
 *
 * ```js
 * TODO: eject(resourceName, id) example
 * ```
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
		throw new errors.IllegalArgumentError('DS.eject(resourceName, id): id: Must be a string or a number!', { id: { actual: typeof id, expected: 'string|number' } });
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

},{"../../errors":37,"../../utils":39,"../services":35,"../store":36}],27:[function(require,module,exports){
var utils = require('../../utils'),
	errors = require('../../errors'),
	store = require('../store');

/**
 * @doc method
 * @id DS.sync_methods:filter
 * @name filter(name[, params][, loadFromServer])
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {object=} params Parameter object that is serialized into the query string. Properties:
 *
 * - `{object=}` - `query` - The query object by which to filter items of the type specified by `resourceName`. Properties:
 *      - `{object=}` - `where` - Where clause.
 *      - `{number=}` - `limit` - Limit clause.
 *      - `{skip=}` - `skip` - Skip clause.
 * @param {boolean=} loadFromServer Whether to load the query from the server if it hasn't been loaded yet.
 * @returns {array} The filtered collection of items of the type specified by `resourceName`.
 */
function filter(resourceName, params, loadFromServer) {
	if (!store[resourceName]) {
		throw new Error('DS.filter(resourceName, params, loadFromServer): ' + resourceName + ' is not a registered resource!');
	} else if (params && !utils.isObject(params)) {
		throw new Error('DS.filter(resourceName, params, loadFromServer): params: Must be an object!');
	}

	var resource = store[resourceName];

	// Protect against null
	params = params || {};
	params.query = params.query || {};

	var queryHash = utils.toJson(params);

	if (!(queryHash in resource.completedQueries) && loadFromServer) {
		// This particular query has never been completed

		if (!resource.pendingQueries[queryHash]) {
			// This particular query has never even been started
			this.findAll(resourceName, params);
		}

		// Return empty results until the query completes
		return [];
	} else {
		// The query has been completed, so hit the cache with the query

		// Apply 'criteria'
		var filtered = utils.filter(resource.collection, function (value) {
			var keep = true;
			utils.forOwn(params.query.criteria, function (value2, key2) {
				if (key2.indexOf('.') !== -1) {
					key2 = key2.split('.')[1];
				}
				if (value2['==']) {
					if (value2['=='] == 'null') {
						keep = keep && (value[key2] === null);
					} else {
						keep = keep && (value[key2] == value2['==']);
					}
				} else if (value2['!=']) {
					keep = keep && (value[key2] != value2['!=']);
				} else if (value2['>']) {
					keep = keep && (value[key2] > value2['>']);
				} else if (value2['>=']) {
					keep = keep && (value[key2] >= value2['>=']);
				} else if (value2['<']) {
					keep = keep && (value[key2] < value2['<']);
				} else if (value2['<=']) {
					keep = keep && (value[key2] <= value2['<=']);
				} else if (value2['in']) {
					keep = keep && utils.contains(value2['in'], value[key2]);
				}
			});
			return keep;
		});

		// Apply 'sort'
		if (params.query.sort) {
			utils.forOwn(params.query.sort, function (value, key) {
				if (key.indexOf('.') !== -1) {
					key = key.split('.')[1];
				}
				filtered = utils.sort(filtered, function (a, b) {
					var cA = a[key], cB = b[key];
					if (utils.isString(cA)) {
						cA = utils.upperCase(cA);
					}
					if (utils.isString(cB)) {
						cB = utils.upperCase(cB);
					}
					if (value === 'DESC') {
						if (cB < cA) {
							return -1;
						} else if (cB > cA) {
							return 1;
						} else {
							return 0;
						}
					} else {
						if (cA < cB) {
							return -1;
						} else if (cA > cB) {
							return 1;
						} else {
							return 0;
						}
					}
				});
			});
		}

		// Apply 'limit' and 'offset'
		if (utils.isNumber(params.query.limit) && utils.isNumber(params.query.offset)) {
			filtered = utils.slice(filtered, params.query.offset, params.query.offset + params.query.limit);
		} else if (utils.isNumber(params.query.limit)) {
			filtered = utils.slice(filtered, 0, params.query.limit);
		} else if (utils.isNumber(params.query.offset)) {
			filtered = utils.slice(filtered, params.query.offset);
		}

		return filtered;
	}
}

module.exports = filter;

},{"../../errors":37,"../../utils":39,"../store":36}],28:[function(require,module,exports){
var utils = require('../../utils'),
	errors = require('../../errors'),
	store = require('../store'),
	services = require('../services'),
	GET = require('../HTTP').GET;

/**
 * @doc method
 * @id DS.async_methods:find
 * @name find(name, id[, forceRefresh])
 * @description
 * Asynchronously return the resource with the given id from the server. The result will be added to the data
 * store when it returns from the server.
 *
 * Example:
 *
 * ```js
 * TODO: find(resourceName, id[, forceRefresh]) example
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to retrieve.
 * @param {boolean=} forceRefresh Bypass the cache.
 * @returns {Promise} Promise produced by the `$q` service.
 *
 * ## ResolvesWith:
 *
 * - `{array}` - `item` - The item with the primary key specified by `id`.
 *
 * ## RejectsWith:
 *
 * - `{IllegalArgumentError}` - `err` - Argument `id` must be a string or a number.
 * - `{RuntimeError}` - `err` - Argument `resourceName` must refer to an already registered resource.
 * - `{UnhandledError}` - `err` - Thrown for any uncaught exception.
 */
function find(resourceName, id, forceRefresh) {
	var deferred = $q.defer();
	if (!store[resourceName]) {
		deferred.reject(new errors.RuntimeError('DS.find(resourceName, id[, forceRefresh]): ' + resourceName + ' is not a registered resource!'));
	} else if (!utils.isString(id) && !utils.isNumber(id)) {
		deferred.reject(new errors.IllegalArgumentError('DS.find(resourceName, id[, forceRefresh]): id: Must be a string or a number!', { id: { actual: typeof id, expected: 'string|number' } }));
	}

	try {
		var resource = store[resourceName];

		if (id in resource.index && !forceRefresh) {
			deferred.resolve(resource.index[id]);
		} else {
			GET(resource.baseUrl + '/' + (resource.endpoint || resourceName) + '/' + id, null).then(function (data) {
				if (data) {
					if (resource.index[id]) {
						utils.deepMixIn(resource.index[id], data);
					} else {
						resource.index[id] = data;
						resource.collection.push(resource.index[id]);
					}
					resource.modified[id] = utils.updateTimestamp(resource.modified[id]);
					resource.collectionModified = utils.updateTimestamp(resource.collectionModified);
				}
				deferred.resolve(resource.index[id]);
			}, deferred.reject);
		}
	} catch (err) {
		deferred.reject(new errors.UnhandledError(err));
	}

	return deferred.promise;
}

module.exports = find;

},{"../../errors":37,"../../utils":39,"../HTTP":23,"../services":35,"../store":36}],29:[function(require,module,exports){
var utils = require('../../utils'),
	errors = require('../../errors'),
	store = require('../store'),
	services = require('../services'),
	GET = require('../HTTP').GET;

function processResults(data, resourceName, queryHash) {
	var resource = store[resourceName];

	data = data || [];

	// Query is no longer pending
	delete resource.pendingQueries[queryHash];
	resource.completedQueries[queryHash] = new Date().getTime();

	var temp = [];
	for (var i = 0; i < data.length; i++) {
		temp.push(data[i]);
	}
	// Merge the new values into the cache
	resource.collection = utils.mergeArrays(resource.collection, data, resource.idAttribute || 'id');

	// Update the data store's index for this resource
	resource.index = utils.toLookup(resource.collection, resource.idAttribute || 'id');

	// Update modified timestamp for values that were return by the server
	for (var j = 0; j < temp.length; j++) {
		resource.modified[temp[j][resource.idAttribute || 'id']] = utils.updateTimestamp(resource.modified[temp[j][resource.idAttribute || 'id']]);
	}

	// Update modified timestamp of collection
	resource.collectionModified = utils.updateTimestamp(resource.collectionModified);
	return temp;
}

function _findAll(deferred, resourceName, params, forceRefresh) {
	var resource = store[resourceName];

	params.query = params.query || {};

	var queryHash = utils.toJson(params);

	if (forceRefresh) {
		delete resource.completedQueries[queryHash];
	}

	if (!(queryHash in resource.completedQueries)) {
		// This particular query has never been completed

		if (!resource.pendingQueries[queryHash]) {

			// This particular query has never even been started
			resource.pendingQueries[queryHash] = GET(
				resource.baseUrl + '/' + (resource.endpoint || resourceName),
				{ params: params }
			).then(function (data) {
					try {
						deferred.resolve(processResults(data, resourceName, queryHash));
					} catch (err) {
						deferred.reject(new errors.UnhandledErrror(err));
					}
				}, deferred.reject);
		}
	} else {
		deferred.resolve(this.filter(resourceName, params));
	}
}

/**
 * @doc method
 * @id DS.async_methods:findAll
 * @name findAll(name[, params][, forceRefresh])
 * @description
 * Asynchronously return the resource from the server filtered by the query. The results will be added to the data
 * store when it returns from the server.
 *
 * Example:
 *
 * ```js
 * TODO: findAll(resourceName[, params][, forceRefresh]) example
 * ```
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {object=} params Parameter object that is serialized into the query string. Properties:
 *
 * - `{object=}` - `query` - The query object by which to filter items of the type specified by `resourceName`. Properties:
 *      - `{object=}` - `where` - Where clause.
 *      - `{number=}` - `limit` - Limit clause.
 *      - `{skip=}` - `skip` - Skip clause.
 *
 * @param {boolean=} forceRefresh Bypass the cache.
 *
 * @returns {Promise} Promise produced by the `$q` service.
 *
 * ## ResolvesWith:
 *
 * - `{array}` - `items` - The collection of items returned by the server.
 *
 * ## RejectsWith:
 *
 * - `{IllegalArgumentError}` - `err` - Argument `params` must be an object.
 * - `{RuntimeError}` - `err` - Argument `resourceName` must refer to an already registered resource.
 * - `{UnhandledError}` - `err` - Thrown for any uncaught exception.
 */
function findAll(resourceName, params, forceRefresh) {
	var deferred = services.$q.defer();

	params = params || {};

	if (!store[resourceName]) {
		deferred.reject(new errors.RuntimeError('DS.findAll(resourceName[, params]): ' + resourceName + ' is not a registered resource!'));
	} else if (!utils.isObject(params)) {
		deferred.reject(new errors.IllegalArgumentError('DS.findAll(resourceName[, params]): params: Must be an object!', { params: { actual: typeof params, expected: 'object' } }));
	}

	try {
		_findAll.apply(this, [deferred, resourceName, params, forceRefresh]);
	} catch (err) {
		deferred.reject(new errors.UnhandledErrror(err));
	}

	return deferred.promise;
}

module.exports = findAll;

},{"../../errors":37,"../../utils":39,"../HTTP":23,"../services":35,"../store":36}],30:[function(require,module,exports){
var utils = require('../../utils'),
	errors = require('../../errors'),
	store = require('../store');

/**
 * @doc method
 * @id DS.sync_methods:get
 * @name get(name, id)
 * @description
 * Synchronously return the resource with the given id. The data store will forward the request to the server if the
 * item is not in the cache.
 *
 * Example:
 *
 * ```js
 * TODO: get(resourceName, id) example
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}` - Argument `id` must be a string or a number.
 * - `{RuntimeError}` - Argument `resourceName` must refer to an already registered resource.
 * - `{UnhandledError}` - Thrown for any uncaught exception.
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {string|number} id The primary key of the item to retrieve.
 * @returns {object} The item of the type specified by `resourceName` with the primary key specified by `id`.
 */
function get(resourceName, id) {
	if (!store[resourceName]) {
		throw new errors.IllegalArgumentError('DS.get(resourceName, id): ' + resourceName + ' is not a registered resource!');
	} else if (!utils.isString(id) && !utils.isNumber(id)) {
		throw new errors.IllegalArgumentError('DS.get(resourceName, id): id: Must be a string or a number!', { id: { actual: typeof id, expected: 'string|number' } });
	}

	try {
		// cache miss, request resource from server
		if (!(id in store[resourceName].index)) {
			this.find(resourceName, id);
		}

		// return resource from cache
		return store[resourceName].index[id];
	} catch (err) {
		throw new errors.UnhandledError(err);
	}
}

module.exports = get;

},{"../../errors":37,"../../utils":39,"../store":36}],31:[function(require,module,exports){
module.exports=require(23)
},{"../../errors":37,"../../utils":39,"../services":35}],32:[function(require,module,exports){
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

},{"./defineResource":24,"./destroy":25,"./eject":26,"./filter":27,"./find":28,"./findAll":29,"./get":30,"./http":31,"./inject":33,"./lastModified":34,"./services":35}],33:[function(require,module,exports){
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
 * @id DS.sync_methods:inject
 * @name inject(name, attrs)
 * @description
 * Inject an item of type `resourceName` (which already exists on the server) into the data store.
 *
 * Example:
 *
 * ```js
 * TODO: inject(resourceName, attrs) example
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}` - Argument `attrs` must be an object.
 * - `{RuntimeError}` - Argument `resourceName` must refer to an already registered resource.
 * - `{UnhandledError}` - Thrown for any uncaught exception.
 *
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

},{"../../errors":37,"../../utils":39,"../services":35,"../store":36}],34:[function(require,module,exports){
var utils = require('../../utils'),
	errors = require('../../errors'),
	store = require('../store');

/**
 * @doc method
 * @id DS.sync_methods:lastModified
 * @name lastModified(name[, id])
 * @description
 * Return the timestamp of the last time either the collection for `resourceName` or the item of type `resourceName`
 * with the given primary key was modified.
 *
 * Example:
 *
 * ```js
 * TODO: lastModified(resourceName, id) example
 * ```
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

},{"../../errors":37,"../../utils":39,"../store":36}],35:[function(require,module,exports){
module.exports = {};

},{}],36:[function(require,module,exports){
module.exports = {

};

},{}],37:[function(require,module,exports){
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

},{}],38:[function(require,module,exports){
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

},{"./binaryHeap":22,"./datastore":32}],39:[function(require,module,exports){
module.exports = {
	isString: angular.isString,
	isArray: angular.isArray,
	isObject: angular.isObject,
	isNumber: angular.isNumber,
	toJson: angular.toJson,
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
	}
};

},{"mout/array/contains":1,"mout/array/filter":2,"mout/array/slice":4,"mout/array/sort":5,"mout/array/toLookup":6,"mout/object/deepMixIn":17,"mout/object/forOwn":19,"mout/string/upperCase":21}]},{},[38])