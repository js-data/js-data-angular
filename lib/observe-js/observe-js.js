// Copyright 2012 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Modifications
// Copyright 2014 Jason Dobry
//
// Summary of modifications:
// Removed all code related to:
// - ArrayObserver
// - ArraySplice
// - PathObserver
// - CompoundObserver
// - Path
// - ObserverTransform
(function(global) {
	'use strict';

	function detectObjectObserve() {
		if (typeof Object.observe !== 'function' ||
			typeof Array.observe !== 'function') {
			return false;
		}

		var gotSplice = false;
		function callback(records) {
			if (records[0].type === 'splice' && records[1].type === 'splice')
				gotSplice = true;
		}

		var test = [0];
		Array.observe(test, callback);
		test[1] = 1;
		test.length = 0;
		Object.deliverChangeRecords(callback);
		return gotSplice;
	}

	var hasObserve = detectObjectObserve();

	var hasEval = false;
	try {
		var f = new Function('', 'return true;');
		hasEval = f();
	} catch (ex) {
	}

	function isObject(obj) {
		return obj === Object(obj);
	}

	var numberIsNaN = global.Number.isNaN || function isNaN(value) {
		return typeof value === 'number' && global.isNaN(value);
	}

	var createObject = ('__proto__' in {}) ?
		function(obj) { return obj; } :
		function(obj) {
			var proto = obj.__proto__;
			if (!proto)
				return obj;
			var newObject = Object.create(proto);
			Object.getOwnPropertyNames(obj).forEach(function(name) {
				Object.defineProperty(newObject, name,
					Object.getOwnPropertyDescriptor(obj, name));
			});
			return newObject;
		};

	var MAX_DIRTY_CHECK_CYCLES = 1000;

	function dirtyCheck(observer) {
		var cycles = 0;
		while (cycles < MAX_DIRTY_CHECK_CYCLES && observer.check()) {
			observer.report();
			cycles++;
		}
	}

	function objectIsEmpty(object) {
		for (var prop in object)
			return false;
		return true;
	}

	function diffIsEmpty(diff) {
		return objectIsEmpty(diff.added) &&
			objectIsEmpty(diff.removed) &&
			objectIsEmpty(diff.changed);
	}

	function diffObjectFromOldObject(object, oldObject) {
		var added = {};
		var removed = {};
		var changed = {};
		var oldObjectHas = {};

		for (var prop in oldObject) {
			var newValue = object[prop];

			if (newValue !== undefined && newValue === oldObject[prop])
				continue;

			if (!(prop in object)) {
				removed[prop] = undefined;
				continue;
			}

			if (newValue !== oldObject[prop])
				changed[prop] = newValue;
		}

		for (var prop in object) {
			if (prop in oldObject)
				continue;

			added[prop] = object[prop];
		}

		if (Array.isArray(object) && object.length !== oldObject.length)
			changed.length = object.length;

		return {
			added: added,
			removed: removed,
			changed: changed
		};
	}

	function copyObject(object, opt_copy) {
		var copy = opt_copy || (Array.isArray(object) ? [] : {});
		for (var prop in object) {
			copy[prop] = object[prop];
		};
		if (Array.isArray(object))
			copy.length = object.length;
		return copy;
	}

	function Observer(object, callback, target, token) {
		this.closed = false;
		this.object = object;
		this.callback = callback;
		// TODO(rafaelw): Hold this.target weakly when WeakRef is available.
		this.target = target;
		this.token = token;
		this.reporting = true;
		if (hasObserve) {
			var self = this;
			this.boundInternalCallback = function(records) {
				self.internalCallback(records);
			};
		}

		addToAll(this);
		this.connect();
		this.sync(true);
	}

	Observer.prototype = {
		internalCallback: function(records) {
			if (this.closed)
				return;
			if (this.reporting && this.check(records)) {
				this.report();
				if (this.testingResults)
					this.testingResults.anyChanged = true;
			}
		},

		close: function() {
			if (this.closed)
				return;
			if (this.object && typeof this.object.unobserved === 'function')
				this.object.unobserved();

			this.disconnect();
			this.object = undefined;
			this.closed = true;
		},

		deliver: function(testingResults) {
			if (this.closed)
				return;
			if (hasObserve) {
				this.testingResults = testingResults;
				Object.deliverChangeRecords(this.boundInternalCallback);
				this.testingResults = undefined;
			} else {
				dirtyCheck(this);
			}
		},

		report: function() {
			if (!this.reporting)
				return;

			this.sync(false);
			this.reportArgs.push(this.token);
			this.invokeCallback(this.reportArgs);
			this.reportArgs = undefined;
		},

		invokeCallback: function(args) {
			try {
				this.callback.apply(this.target, args);
			} catch (ex) {
				Observer._errorThrownDuringCallback = true;
				console.error('Exception caught during observer callback: ' + ex);
			}
		},

		reset: function() {
			if (this.closed)
				return;

			if (hasObserve) {
				this.reporting = false;
				Object.deliverChangeRecords(this.boundInternalCallback);
				this.reporting = true;
			}

			this.sync(true);
		}
	}

	var collectObservers = !hasObserve || global.forceCollectObservers;
	var allObservers;
	Observer._allObserversCount = 0;

	if (collectObservers) {
		allObservers = [];
	}

	function addToAll(observer) {
		if (!collectObservers)
			return;

		allObservers.push(observer);
		Observer._allObserversCount++;
	}

	var runningMicrotaskCheckpoint = false;

	var hasDebugForceFullDelivery = typeof Object.deliverAllChangeRecords == 'function';

	global.Platform = global.Platform || {};

	global.Platform.performMicrotaskCheckpoint = function() {
		if (runningMicrotaskCheckpoint)
			return;

		if (hasDebugForceFullDelivery) {
			Object.deliverAllChangeRecords();
			return;
		}

		if (!collectObservers)
			return;

		runningMicrotaskCheckpoint = true;

		var cycles = 0;
		var results = {};

		do {
			cycles++;
			var toCheck = allObservers;
			allObservers = [];
			results.anyChanged = false;

			for (var i = 0; i < toCheck.length; i++) {
				var observer = toCheck[i];
				if (observer.closed)
					continue;

				if (hasObserve) {
					observer.deliver(results);
				} else if (observer.check()) {
					results.anyChanged = true;
					observer.report();
				}

				allObservers.push(observer);
			}
		} while (cycles < MAX_DIRTY_CHECK_CYCLES && results.anyChanged);

		Observer._allObserversCount = allObservers.length;
		runningMicrotaskCheckpoint = false;
	};

	if (collectObservers) {
		global.Platform.clearObservers = function() {
			allObservers = [];
		};
	}

	function ObjectObserver(object, callback, target, token) {
		Observer.call(this, object, callback, target, token);
	}

	ObjectObserver.prototype = createObject({
		__proto__: Observer.prototype,

		connect: function() {
			if (hasObserve)
				Object.observe(this.object, this.boundInternalCallback);
		},

		sync: function(hard) {
			if (!hasObserve)
				this.oldObject = copyObject(this.object);
		},

		check: function(changeRecords) {
			var diff;
			var oldValues;
			if (hasObserve) {
				if (!changeRecords)
					return false;

				oldValues = {};
				diff = diffObjectFromChangeRecords(this.object, changeRecords,
					oldValues);
			} else {
				oldValues = this.oldObject;
				diff = diffObjectFromOldObject(this.object, this.oldObject);
			}

			if (diffIsEmpty(diff))
				return false;

			this.reportArgs =
				[diff.added || {}, diff.removed || {}, diff.changed || {}];
			this.reportArgs.push(function(property) {
				return oldValues[property];
			});

			return true;
		},

		disconnect: function() {
			if (!hasObserve)
				this.oldObject = undefined;
			else if (this.object)
				Object.unobserve(this.object, this.boundInternalCallback);
		}
	});

	function ObservedSet(callback) {
		this.arr = [];
		this.callback = callback;
		this.isObserved = true;
	}

	var objProto = Object.getPrototypeOf({});
	var arrayProto = Object.getPrototypeOf([]);
	ObservedSet.prototype = {
		reset: function() {
			this.isObserved = !this.isObserved;
		},

		observe: function(obj) {
			if (!isObject(obj) || obj === objProto || obj === arrayProto)
				return;
			var i = this.arr.indexOf(obj);
			if (i >= 0 && this.arr[i+1] === this.isObserved)
				return;

			if (i < 0) {
				i = this.arr.length;
				this.arr[i] = obj;
				Object.observe(obj, this.callback);
			}

			this.arr[i+1] = this.isObserved;
			this.observe(Object.getPrototypeOf(obj));
		},

		cleanup: function() {
			var i = 0, j = 0;
			var isObserved = this.isObserved;
			while(j < this.arr.length) {
				var obj = this.arr[j];
				if (this.arr[j + 1] == isObserved) {
					if (i < j) {
						this.arr[i] = obj;
						this.arr[i + 1] = isObserved;
					}
					i += 2;
				} else {
					Object.unobserve(obj, this.callback);
				}
				j += 2;
			}

			this.arr.length = i;
		}
	};

	var knownRecordTypes = {
		'new': true,
		'updated': true,
		'deleted': true
	};

	function diffObjectFromChangeRecords(object, changeRecords, oldValues) {
		var added = {};
		var removed = {};

		for (var i = 0; i < changeRecords.length; i++) {
			var record = changeRecords[i];
			if (!knownRecordTypes[record.type]) {
				console.error('Unknown changeRecord type: ' + record.type);
				console.error(record);
				continue;
			}

			if (!(record.name in oldValues))
				oldValues[record.name] = record.oldValue;

			if (record.type == 'updated')
				continue;

			if (record.type == 'new') {
				if (record.name in removed)
					delete removed[record.name];
				else
					added[record.name] = true;

				continue;
			}

			// type = 'deleted'
			if (record.name in added) {
				delete added[record.name];
				delete oldValues[record.name];
			} else {
				removed[record.name] = true;
			}
		}

		for (var prop in added)
			added[prop] = object[prop];

		for (var prop in removed)
			removed[prop] = undefined;

		var changed = {};
		for (var prop in oldValues) {
			if (prop in added || prop in removed)
				continue;

			var newValue = object[prop];
			if (oldValues[prop] !== newValue)
				changed[prop] = newValue;
		}

		return {
			added: added,
			removed: removed,
			changed: changed
		};
	}

	global.Observer = Observer;
	global.Observer.hasObjectObserve = hasObserve;
	global.ObjectObserver = ObjectObserver;
})(typeof global !== 'undefined' && global ? global : window);
