/**
 * @doc function
 * @id errors.types:UnhandledError
 * @name UnhandledError
 * @description Error that is thrown/returned when Reheat encounters an uncaught/unknown exception.
 * @param {Error} error The originally thrown error.
 * @returns {UnhandledError} A new instance of `UnhandledError`.
 */
function UnhandledError(error) {
  Error.call(this);
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, this.constructor);
  }

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
  this.message = 'UnhandledError: This is an uncaught exception. Please consider submitting an issue at https://github.com/jmdobry/angular-data/issues.\n\n' +
    'Original Uncaught Exception:\n' + (error.stack ? error.stack.toString() : error.stack);

  /**
   * @doc property
   * @id errors.types:UnhandledError.stack
   * @name stack
   * @propertyOf errors.types:UnhandledError
   * @description Message and stack trace. Same as `UnhandledError#message`.
   */
  this.stack = this.message;
}

UnhandledError.prototype = Object.create(Error.prototype);
UnhandledError.prototype.constructor = UnhandledError;

/**
 * @doc function
 * @id errors.types:IllegalArgumentError
 * @name IllegalArgumentError
 * @description Error that is thrown/returned when a caller does not honor the pre-conditions of a method/function.
 * @param {string=} message Error message. Default: `"Illegal Argument!"`.
 * @param {object=} errors Object containing information about the error.
 * @returns {IllegalArgumentError} A new instance of `IllegalArgumentError`.
 */
function IllegalArgumentError(message, errors) {
  Error.call(this);
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, this.constructor);
  }

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
}

IllegalArgumentError.prototype = Object.create(Error.prototype);
IllegalArgumentError.prototype.constructor = IllegalArgumentError;

/**
 * @doc function
 * @id errors.types:RuntimeError
 * @name RuntimeError
 * @description Error that is thrown/returned for invalid state during runtime.
 * @param {string=} message Error message. Default: `"Runtime Error!"`.
 * @param {object=} errors Object containing information about the error.
 * @returns {RuntimeError} A new instance of `RuntimeError`.
 */
function RuntimeError(message, errors) {
  Error.call(this);
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, this.constructor);
  }

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

RuntimeError.prototype = Object.create(Error.prototype);
RuntimeError.prototype.constructor = RuntimeError;

/**
 * @doc interface
 * @id errors
 * @name angular-data error types
 * @description
 * Various error types that may be thrown by angular-data.
 *
 * - [UnhandledError](/documentation/api/api/errors.types:UnhandledError)
 * - [IllegalArgumentError](/documentation/api/api/errors.types:IllegalArgumentError)
 * - [RuntimeError](/documentation/api/api/errors.types:RuntimeError)
 *
 * References to the constructor functions of these errors can be found in `DS.errors`.
 */
module.exports = [function () {
  return {
    UnhandledError: UnhandledError,
    IllegalArgumentError: IllegalArgumentError,
    RuntimeError: RuntimeError
  };
}];
