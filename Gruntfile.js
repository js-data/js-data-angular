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

  var pkg = grunt.file.readJSON('package.json');

  // Project configuration.
  grunt.initConfig({
    pkg: pkg,
    clean: {
      dist: ['dist/']
    },
    jshint: {
      all: ['Gruntfile.js', 'src/**/*.js'],
      jshintrc: '.jshintrc'
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
          banner: '/**\n' +
          '* @author Jason Dobry <jason.dobry@gmail.com>\n' +
          '* @file js-data-angular.min.js\n' +
          '* @version <%= pkg.version %> - Homepage <https://www.js-data.io/js-data-angular/>\n' +
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
    }
  });

  grunt.registerTask('version', function (filePath) {
    var file = grunt.file.read(filePath);

    file = file.replace(/<%= pkg\.version %>/gi, pkg.version);

    grunt.file.write(filePath, file);
  });

  grunt.registerTask('banner', function () {
    var file = grunt.file.read('./src/index.js');

    var banner = '/**\n' +
      '* @author Jason Dobry <jason.dobry@gmail.com>\n' +
      '* @file js-data-angular.js\n' +
      '* @version ' + pkg.version + ' - Homepage <http://www.js-data.io/docs/js-data-angular/>\n' +
      '* @copyright (c) 2014-2015 Jason Dobry <https://github.com/jmdobry/>\n' +
      '* @license MIT <https://github.com/js-data/js-data-angular/blob/master/LICENSE>\n' +
      '*\n' +
      '* @overview Angular wrapper for js-data.js.\n' +
      '*/\n';

    file = banner + file;

    grunt.file.write('./dist/js-data-angular.js', file);
  });

  grunt.registerTask('build', [
    'clean',
    'jshint',
    'banner',
    'uglify'
  ]);
  grunt.registerTask('go', ['build', 'watch:dist']);
  grunt.registerTask('default', ['build']);
  grunt.registerTask('test', ['build', 'karma:min']);
};
