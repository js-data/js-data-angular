var observe = require('../../../lib/observe-js/observe-js');

/**
 * @doc method
 * @id DS.sync methods:digest
 * @name digest
 * @description
 * Trigger a digest loop that checks for changes and updates the `lastModified` timestamp if an object has changed.
 * Anything $watching `DS.lastModified(...)` will detect the updated timestamp and execute the callback function. If
 * your browser supports `Object.observe` then this function has no effect.
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
 */
function digest() {
  if (!this.$rootScope.$$phase) {
    this.$rootScope.$apply(function () {
      observe.Platform.performMicrotaskCheckpoint();
    });
  } else {
    observe.Platform.performMicrotaskCheckpoint();
  }
}

module.exports = digest;
