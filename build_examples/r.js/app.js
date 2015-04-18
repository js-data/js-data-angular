define('app', [
  'angular',
  'js-data-angular'
], function (angular, jsDataModuleName) {
  return angular.module('app', [jsDataModuleName])
    .run(function (DS, DSVersion, $rootScope) {
      $rootScope.test = 'It works! Using js-data ' + DSVersion.full;
    });
});
