import angular from 'angular';
import jsDataModuleName from 'js-data-angular';

angular.module('app', [
  jsDataModuleName
]).run((DS, DSVersion, $rootScope) => {
  $rootScope.test = 'It works! Using js-data ' + DSVersion.full;
});
