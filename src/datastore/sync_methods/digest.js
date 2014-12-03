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
  var _this = this;
  if (!_this.$rootScope.$$phase) {
    _this.$rootScope.$apply(function () {
      _this.utils.observe.Platform.performMicrotaskCheckpoint();
    });
  } else {
    _this.utils.observe.Platform.performMicrotaskCheckpoint();
  }
}

module.exports = digest;
