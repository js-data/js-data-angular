var observe = require('../../../lib/observe-js/observe-js'),
	errorPrefix = 'DS.inject(resourceName, attrs[, options]): ';

function _inject(definition, resource, attrs) {
	var _this = this,
		$log = _this.$log;

	function _react(added, removed, changed, getOldValueFn) {
		try {
			var innerId = getOldValueFn(definition.idAttribute);

			resource.modified[innerId] = _this.utils.updateTimestamp(resource.modified[innerId]);
			resource.collectionModified = _this.utils.updateTimestamp(resource.collectionModified);

			if (definition.idAttribute in changed) {
				$log.error('Doh! You just changed the primary key of an object! ' +
					'I don\'t know how to handle this yet, so your data for the "' + definition.name +
					'" resource is now in an undefined (probably broken) state.');
			}
		} catch (err) {
			throw new _this.errors.UnhandledError(err);
		}
	}

	var injected;
	if (_this.utils.isArray(attrs)) {
		injected = [];
		for (var i = 0; i < attrs.length; i++) {
			injected.push(_inject.call(_this, definition, resource, attrs[i]));
		}
	} else {
		if (!(definition.idAttribute in attrs)) {
			throw new _this.errors.RuntimeError(errorPrefix + 'attrs: Must contain the property specified by `idAttribute`!');
		} else {
			try {
				definition.beforeInject(definition.name, attrs);
				var id = attrs[definition.idAttribute],
					item = this.get(definition.name, id);

				if (!item) {
					if (definition.class) {
						if (attrs instanceof definition[definition.class]) {
							item = attrs;
						} else {
							item = new definition[definition.class]();
						}
					} else {
						item = {};
					}
					resource.previousAttributes[id] = {};

					_this.utils.deepMixIn(item, attrs);
					_this.utils.deepMixIn(resource.previousAttributes[id], attrs);

					resource.collection.push(item);

					resource.observers[id] = new observe.ObjectObserver(item, _react);
					resource.index.put(id, item);

					_react({}, {}, {}, function () {
						return id;
					});
				} else {
					_this.utils.deepMixIn(item, attrs);
					if (typeof resource.index.touch === 'function') {
						resource.index.touch(id);
					} else {
						resource.index.put(id, resource.index.get(id));
					}
					resource.observers[id].deliver();
				}
				resource.saved[id] = _this.utils.updateTimestamp(resource.saved[id]);
				definition.afterInject(definition.name, item);
				injected = item;
			} catch (err) {
				$log.error(err);
				$log.error('inject failed!', definition.name, attrs);
			}
		}
	}
	return injected;
}

/**
 * @doc method
 * @id DS.sync_methods:inject
 * @name inject
 * @description
 * Inject the given item into the data store as the specified type. If `attrs` is an array, inject each item into the
 * data store. Injecting an item into the data store does not save it to the server.
 *
 * ## Signature:
 * ```js
 * DS.inject(resourceName, attrs[, options])
 * ```
 *
 * ## Examples:
 *
 * ```js
 * DS.get('document', 45); // undefined
 *
 * DS.inject('document', { title: 'How to Cook', id: 45 });
 *
 * DS.get('document', 45); // { title: 'How to Cook', id: 45 }
 * ```
 *
 * Inject a collection into the data store:
 *
 * ```js
 * DS.filter('document'); // [ ]
 *
 * DS.inject('document', [ { title: 'How to Cook', id: 45 }, { title: 'How to Eat', id: 46 } ]);
 *
 * DS.filter('document'); // [ { title: 'How to Cook', id: 45 }, { title: 'How to Eat', id: 46 } ]
 * ```
 *
 * ## Throws
 *
 * - `{IllegalArgumentError}`
 * - `{RuntimeError}`
 * - `{UnhandledError}`
 *
 * @param {string} resourceName The resource type, e.g. 'user', 'comment', etc.
 * @param {object|array} attrs The item or collection of items to inject into the data store.
 * @param {object=} options Optional configuration. Properties:
 * @returns {object|array} A reference to the item that was injected into the data store or an array of references to
 * the items that were injected into the data store.
 */
function inject(resourceName, attrs, options) {
	options = options || {};

	if (!this.definitions[resourceName]) {
		throw new this.errors.RuntimeError(errorPrefix + resourceName + ' is not a registered resource!');
	} else if (!this.utils.isObject(attrs) && !this.utils.isArray(attrs)) {
		throw new this.errors.IllegalArgumentError(errorPrefix + 'attrs: Must be an object or an array!', { attrs: { actual: typeof attrs, expected: 'object|array' } });
	} else if (!this.utils.isObject(options)) {
		throw new this.errors.IllegalArgumentError(errorPrefix + 'options: Must be an object!', { options: { actual: typeof options, expected: 'object' } });
	}

	var definition = this.definitions[resourceName],
		resource = this.store[resourceName],
		_this = this;

	try {
		var injected;
		if (!this.$rootScope.$$phase) {
			this.$rootScope.$apply(function () {
				injected = _inject.apply(_this, [definition, resource, attrs]);
			});
		} else {
			injected = _inject.apply(_this, [definition, resource, attrs]);
		}
		return injected;
	} catch (err) {
		if (!(err instanceof this.errors.RuntimeError)) {
			throw new this.errors.UnhandledError(err);
		} else {
			throw err;
		}
	}
}

module.exports = inject;
