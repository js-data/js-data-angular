var utils = require('utils'),
	errors = require('errors'),
	services = require('services'),
	observe = require('observejs'),
	errorPrefix = 'DS.inject(resourceName, attrs[, options]): ';

function _inject(resource, attrs) {
	var _this = this;

	if (utils.isArray(attrs)) {
		for (var i = 0; i < attrs.length; i++) {
			_inject.call(_this, resource, attrs[i]);
		}
	} else {
		var id = attrs[resource.idAttribute || 'id'];

		if (!(id in resource.index)) {
			resource.index[id] = {};
			resource.previous_attributes[id] = {};

			utils.deepMixIn(resource.index[id], attrs);
			utils.deepMixIn(resource.previous_attributes[id], attrs);

			resource.collection.push(resource.index[id]);

			resource.observers[id] = new observe.ObjectObserver(resource.index[id], function (added, removed, changed, getOldValueFn) {
				try {
					var innerId = getOldValueFn(resource.idAttribute || 'id');

					if (resource.index[innerId][resource.idAttribute || 'id'] != innerId) {
						resource.index[innerId][resource.idAttribute || 'id'] = innerId;
						services.$log.error('You cannot change the primary key of an object! Reverting change to primary key.');
					}

					resource.changes[innerId] = utils.diffObjectFromOldObject(resource.index[innerId], resource.previous_attributes[innerId]);
					resource.modified[innerId] = utils.updateTimestamp(resource.modified[innerId]);
					resource.collectionModified = utils.updateTimestamp(resource.collectionModified);

					services.$log.debug('old value:', JSON.stringify(resource.previous_attributes[innerId], null, 2));
					services.$log.debug('changes:', resource.changes[innerId]);
					services.$log.debug('new value:', JSON.stringify(resource.index[innerId], null, 2));
				} catch (err) {
					services.$log.error(err.stack);
					throw new errors.UnhandledError(err);
				}
			});

			resource.observers[id].deliver();
		} else {
			utils.deepMixIn(resource.index[id], attrs);
			resource.observers[id].deliver();
		}
	}
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
 * - `{string=}` - `mergeStrategy` - Specify the merge strategy to use if the item is already in the cache. Default: `"mergeWithExisting"`.
 * @returns {object|array} A reference to the item that was injected into the data store or an array of references to
 * the items that were injected into the data store.
 */
function inject(resourceName, attrs, options) {
	options = options || {};

	if (!services.store[resourceName]) {
		throw new errors.RuntimeError(errorPrefix + resourceName + ' is not a registered resource!');
	} else if (!utils.isObject(attrs) && !utils.isArray(attrs)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'attrs: Must be an object or an array!', { attrs: { actual: typeof attrs, expected: 'object|array' } });
	} else if (!utils.isObject(options)) {
		throw new errors.IllegalArgumentError(errorPrefix + 'options: Must be an object!', { options: { actual: typeof options, expected: 'object' } });
	}

	var resource = services.store[resourceName],
		_this = this;

	var idAttribute = resource.idAttribute || 'id';
	if (!attrs[idAttribute]) {
		throw new errors.RuntimeError(errorPrefix + 'attrs: Must contain the property specified by `idAttribute` in the resource definition!');
	} else {
		try {
			if (!services.$rootScope.$$phase) {
				services.$rootScope.$apply(function () {
					_inject.apply(_this, [services.store[resourceName], attrs]);
				});
			} else {
				_inject.apply(_this, [services.store[resourceName], attrs]);
			}
		} catch (err) {
			throw new errors.UnhandledError(err);
		}
		return resource.index[attrs[idAttribute]];
	}
}

module.exports = inject;
