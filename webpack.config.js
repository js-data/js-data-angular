var path = require('path')

module.exports = {
  devtool: 'source-map',
  entry: {
    './dist/js-data-angular.js': './src/index.js'
  },
  output: {
    filename: '[name]',
    libraryTarget: 'umd2',
    library: 'jsDataAngularModuleName'
  },
  externals: {
    'js-data': {
      amd: 'js-data',
      commonjs: 'js-data',
      commonjs2: 'js-data',
      root: 'JSData'
    },
    'axios': 'axios',
    'angular': 'angular'
  },
  module: {
    loaders: [
      {
        loader: 'babel-loader',
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname)
        ],
        test: /\.js$/
      }
    ]
  }
}
