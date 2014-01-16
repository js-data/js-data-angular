function lifecycleNoop(resourceName, attrs, cb) {
	cb(null, attrs);
}

var services = module.exports = {
	config: {
		idAttribute: 'id'
	},
	store: {},
	BaseConfig: function (options) {
		if ('idAttribute' in options) {
			this.idAttribute = options.idAttribute;
		}

		if ('baseUrl' in options) {
			this.baseUrl = options.baseUrl;
		}

		if ('beforeValidate' in options) {
			this.beforeValidate = options.beforeValidate;
		}

		if ('validate' in options) {
			this.validate = options.validate;
		}

		if ('afterValidate' in options) {
			this.afterValidate = options.afterValidate;
		}

		if ('beforeCreate' in options) {
			this.beforeCreate = options.beforeCreate;
		}

		if ('afterCreate' in options) {
			this.afterCreate = options.afterCreate;
		}

		if ('beforeUpdate' in options) {
			this.beforeUpdate = options.beforeUpdate;
		}

		if ('afterUpdate' in options) {
			this.afterUpdate = options.afterUpdate;
		}

		if ('beforeDestroy' in options) {
			this.beforeDestroy = options.beforeDestroy;
		}

		if ('afterDestroy' in options) {
			this.afterDestroy = options.afterDestroy;
		}
	}
};


services.BaseConfig.prototype.idAttribute = 'id';
services.BaseConfig.prototype.baseUrl = '';
services.BaseConfig.prototype.endpoint = '';
services.BaseConfig.prototype.beforeValidate = lifecycleNoop;
services.BaseConfig.prototype.validate = lifecycleNoop;
services.BaseConfig.prototype.afterValidate = lifecycleNoop;
services.BaseConfig.prototype.beforeCreate = lifecycleNoop;
services.BaseConfig.prototype.afterCreate = lifecycleNoop;
services.BaseConfig.prototype.beforeUpdate = lifecycleNoop;
services.BaseConfig.prototype.afterUpdate = lifecycleNoop;
services.BaseConfig.prototype.beforeDestroy = lifecycleNoop;
services.BaseConfig.prototype.afterDestroy = lifecycleNoop;
