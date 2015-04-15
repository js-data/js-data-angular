/*
 * js-data-angular
 * http://github.com/js-data/js-data-angular
 *
 * Copyright (c) 2014-2015 Jason Dobry <http://www.js-data.io/docs/js-data-angular>
 * Licensed under the MIT license. <https://github.com/js-data/js-data-angular/blob/master/LICENSE>
 */
module.exports = function (grunt) {
  'use strict';

  require('jit-grunt')(grunt, {
    coveralls: 'grunt-karma-coveralls'
  });
  require('time-grunt')(grunt);

  var webpack = require('webpack');
  var pkg = grunt.file.readJSON('package.json');
  var banner = 'js-data-angular\n' +
    '@version ' + pkg.version + ' - Homepage <https://www.js-data.io/docs/js-data-angular/>\n' +
    '@author Jason Dobry <jason.dobry@gmail.com>\n' +
    '@copyright (c) 2014-2015 Jason Dobry \n' +
    '@license MIT <https://github.com/js-data/js-data-angular/blob/master/LICENSE>\n' +
    '\n' +
    '@overview Angular wrapper for js-data.';

  // Project configuration.
  grunt.initConfig({
    pkg: pkg,
    clean: {
      dist: ['dist/']
    },
    watch: {
      dist: {
        files: ['src/**/*.js'],
        tasks: ['build']
      }
    },
    uglify: {
      main: {
        options: {
          sourceMap: true,
          sourceMapName: 'dist/js-data-angular.min.map',
          banner: '/*!\n' +
          '* js-data-angular\n' +
          '* @version <%= pkg.version %> - Homepage <https://www.js-data.io/docs/js-data-angular/>\n' +
          '* @author Jason Dobry <jason.dobry@gmail.com>\n' +
          '* @copyright (c) 2014-2015 Jason Dobry <https://github.com/jmdobry/>\n' +
          '* @license MIT <https://github.com/js-data/js-data-angular/blob/master/LICENSE>\n' +
          '*\n' +
          '* @overview Angular wrapper for js-data.\n' +
          '*/\n'
        },
        files: {
          'dist/js-data-angular.min.js': ['dist/js-data-angular.js']
        }
      }
    },
    karma: {
      options: {
        configFile: './karma.conf.js'
      },
      dev: {
        browsers: ['Chrome'],
        autoWatch: true,
        singleRun: false,
        reporters: ['spec'],
        preprocessors: {}
      },
      min: {
        browsers: ['Chrome', 'Firefox', 'PhantomJS'],
        options: {
          files: [
            'bower_components/angular-1.3.2/angular.js',
            'bower_components/angular-mocks-1.3.2/angular-mocks.js',
            'bower_components/js-data/dist/js-data.js',
            'dist/js-data-angular.min.js',
            'karma.start.js',
            'test/**/*.js'
          ]
        }
      }
    },
    coveralls: {
      options: {
        coverage_dir: 'coverage'
      }
    },
    webpack: {
      dist: {
        entry: './src/index.js',
        output: {
          filename: './dist/js-data-angular.js',
          libraryTarget: 'umd',
          library: 'jsDataAngularModuleName'
        },
        externals: {
          'js-data': {
            amd: 'js-data',
            commonjs: 'js-data',
            commonjs2: 'js-data',
            root: 'JSData'
          },
          'angular': 'angular'
        },
        module: {
          loaders: [
            { test: /(.+)\.js$/, exclude: /node_modules/, loader: 'babel-loader?blacklist=useStrict' }
          ],
          preLoaders: [
            {
              test: /(.+)\.js$/, // include .js files
              exclude: /node_modules/, // exclude any and all files in the node_modules folder
              loader: "jshint-loader?failOnHint=true"
            }
          ]
        },
        plugins: [
          new webpack.BannerPlugin(banner)
        ]
      }
    }
  });

  grunt.registerTask('version', function (filePath) {
    var file = grunt.file.read(filePath);

    file = file.replace(/<%= pkg\.version %>/gi, pkg.version);

    grunt.file.write(filePath, file);
  });

  grunt.registerTask('build', [
    'clean',
    'webpack',
    'uglify'
  ]);
  grunt.registerTask('go', ['build', 'watch:dist']);
  grunt.registerTask('default', ['build']);
  grunt.registerTask('test', ['build', 'karma:min']);
};
