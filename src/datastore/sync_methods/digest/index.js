var utils = require('utils'),
	errors = require('errors'),
	services = require('services'),
	observe = require('observejs');

/**
 * @doc method
 * @id DS.sync_methods:digest
 * @name digest
 * @description
 * Trigger a digest loop that checks for changes and updates the `lastModified` timestamp if an object has changed.
 * Anything $watching `DS.lastModified(...)` will detect the updated timestamp and execute the callback function.
 *
 * ## Signature:
 * ```js
 * DS.digest()
 * ```
 *
 * ## Example:
 *
 * ```js
 * Works like $scope.$apply()
 * ```
 *
 * ## Throws
 *
 * - `{UnhandledError}`
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
