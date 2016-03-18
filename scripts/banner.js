var fs = require('fs')
var pkg = require('../package.json')

var banner = '/*!\n' +
  '* js-data-angular\n' +
  '* @version ' + pkg.version + ' - Homepage <https://github.com/js-data/js-data-angular>\n' +
  '* @copyright (c) 2014-2016 js-data-angular project authors\n' +
  '* @license MIT <https://github.com/js-data/js-data-angular/blob/master/LICENSE>\n' +
  '*\n' +
  '* @overview Angular wrapper for js-data.\n' +
  '*/\n'

console.log('Adding banner to dist/ files...')

function addBanner (filepath) {
  var contents = fs.readFileSync(filepath, {
    encoding: 'utf-8'
  })
  if (contents.substr(0, 3) !== '/*!') {
    fs.writeFileSync(filepath, banner + contents, {
      encoding: 'utf-8'
    })
  }
}

addBanner('dist/js-data-angular.js')
addBanner('dist/js-data-angular.min.js')

console.log('Done!')
