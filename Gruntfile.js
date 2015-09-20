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
            'node_modules/js-data/dist/js-data.min.js',
            'dist/js-data-angular.min.js',
            'karma.start.js',
            'test/**/*.js'
          ]
        }
      },
      c9: {
        browsers: ['PhantomJS'],
        options: {
          files: [
            'bower_components/angular-1.3.2/angular.js',
            'bower_components/angular-mocks-1.3.2/angular-mocks.js',
            'node_modules/js-data/dist/js-data.min.js',
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
        debug: true,
        entry: './src/index.js',
        output: {
          filename: './dist/js-data-angular.js',
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
            { test: /(.+)\.js$/, loader: 'babel-loader?blacklist=useStrict' }
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

  grunt.registerTask('standard', function () {
    var child_process = require('child_process');
    var done = this.async();
    grunt.log.writeln('Linting for correcting formatting...');
    child_process.exec('node node_modules/standard/bin/cmd.js --parser babel-eslint src/*.js src/**/*.js src/**/**/*.js', function (err, stdout) {
      console.log(stdout);
      if (err) {
        grunt.log.writeln('Failed due to ' + (stdout.split('\n').length - 2) + ' lint errors!');
        done(err);
      } else {
        grunt.log.writeln('Done linting.');
        done();
      }
    });
  });

  grunt.registerTask('version', function (filePath) {
    var file = grunt.file.read(filePath);

    file = file.replace(/<%= pkg\.version %>/gi, pkg.version);

    grunt.file.write(filePath, file);
  });

  grunt.registerTask('build', [
    'clean',
    'standard',
    'webpack',
    'uglify'
  ]);
  grunt.registerTask('go', ['build', 'watch:dist']);
  grunt.registerTask('default', ['build']);
  grunt.registerTask('test', ['build', 'karma:min']);
  grunt.registerTask('test_c9', ['build', 'karma:c9']);
};
