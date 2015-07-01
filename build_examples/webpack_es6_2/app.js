import 'angular';
import 'js-data-angular';

angular.module('app', [
  'js-data'
]).run((DS, DSVersion, $rootScope) => {
  $rootScope.test = 'It works! Using js-data ' + DSVersion.full;
});
