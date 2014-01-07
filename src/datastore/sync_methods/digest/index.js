var utils = require('utils'),
	errors = require('errors'),
	store = require('store'),
	services = require('services'),
	observe = require('observejs');

/**
 * @doc method
 * @id DS.sync_methods:digest
 * @name digest
 * @description
 * `digest()`
 *
 * Trigger a digest loop that checks for changes and updates the `lastModified` timestamp if an object has changed.
 * Anything $watching `DS.lastModified(...)` will detect the updated timestamp and execute the callback function.
 *
 * Example:
 *
 * ```js
 * TODO: digest() example
 * ```
 *
 * ## Throws
 *
 * - `{UnhandledError}` - Thrown for any uncaught exception.
 */
function digest() {
	try {
		if (!services.$rootScope.$$phase) {
			services.$rootScope.$apply(function () {
				observe.Platform.performMicrotaskCheckpoint();
			});
		} else {
			observe.Platform.performMicrotaskCheckpoint();
		}
	} catch (err) {
		throw new errors.UnhandledError(err);
	}
}

module.exports = digest;
