// this is what you would do in a real app
// var angular = require('angular');

// for the example to work
var angular = require('../../node_modules/angular');

console.log(angular);

angular.module('app', [
  // this is what you would do in a real app
  // require('js-data-angular')

  // for the example to work
  require('../../dist/js-data-angular.js')
]).run(function (DS, DSVersion, $rootScope) {
  $rootScope.test = 'It works! Using js-data ' + DSVersion.full;
});
