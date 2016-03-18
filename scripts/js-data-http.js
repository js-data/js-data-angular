var fs = require('fs')
var url = 'https://github.com/js-data/js-data-http/archive/2.2.2.tar.gz'
var directory = './.js-data-http/'
var request = require('request')
var targz = require('tar.gz')

// Streams
try {
  fs.statSync(directory)
  console.log('js-data-http already downloaded')
} catch (err) {
  console.log('downloading js-data-http')
  var read = request.get(url)
  var write = targz().createWriteStream(directory)

  read.pipe(write)

  write.on('finish', function () {
    var copyRead = fs.createReadStream(directory + 'js-data-http-2.2.2/src/index.js')
    var copyWrite = fs.createWriteStream('./.js-data-http.js')
    copyRead.pipe(copyWrite)
  })
}
