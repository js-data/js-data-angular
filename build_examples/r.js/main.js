require.config({
  paths: {
    angular: '../../bower_components/angular/angular',
    'js-data-angular': '../../dist/js-data-angular',
    'js-data': '../../bower_components/js-data/dist/js-data'
  },
  shim: {
    'angular': {
      exports: 'angular'
    }
  }
});

require([
    'angular',
    'app'
  ], function (angular, app) {
    angular.element(document.getElementsByTagName('html')[0]).ready(function () {
      // bootstrap the app manually
      angular.bootstrap(document, ['app']);
    });
  }
);
