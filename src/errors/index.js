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
