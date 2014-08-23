/*
 * angular-data
 * http://github.com/jmdobry/angular-data
 *
 * Copyright (c) 2014 Jason Dobry <http://jmdobry.github.io/angular-data>
 * Licensed under the MIT license. <https://github.com/jmdobry/angular-data/blob/master/LICENSE>
 */
module.exports = function (grunt) {
  'use strict';

  require('jit-grunt')(grunt, {
    coveralls: 'grunt-karma-coveralls'
  });
  require('time-grunt')(grunt);

  var dev = process.cwd().indexOf('/home/jdobry/angular-data') === -1;
  var pkg = grunt.file.readJSON('package.json');

  // Project configuration.
  grunt.initConfig({
    pkg: pkg,
    clean: {
      coverage: ['coverage/'],
      dist: ['dist/'],
      doc: ['doc/'],
      afterDoc: [
        'doc/resources/img/angular.png',
        'doc/resources/img/angular_grey.png',
        'doc/resources/img/AngularJS-small.png',
        'doc/resources/img/docular-small.png',
        'doc/resources/img/favicon.ico',
        'doc/resources/img/grunt.png',
        'doc/resources/img/grunt_grey.png',
        'doc/resources/img/node.png',
        'doc/resources/img/node_grey.png',
        'doc/resources/angular/',
        'doc/resources/doc_api_resources/doc_api.js',
        'doc/resources/js/docs*.js',
        'doc/resources/js/jquery*.js'
      ]
    },
    jshint: {
      all: ['Gruntfile.js', 'src/**/*.js', 'test/*.js'],
      jshintrc: '.jshintrc'
    },
    watch: {
      dist: {
        files: ['src/**/*.js'],
        tasks: ['build']
      },
      doc: {
        files: ['src/**/*.js', 'guide/**/*'],
        tasks: ['devdoc']
      }
    },
    uglify: {
      main: {
        options: {
          banner: '/**\n' +
            '* @author Jason Dobry <jason.dobry@gmail.com>\n' +
            '* @file angular-data.min.js\n' +
            '* @version <%= pkg.version %> - Homepage <http://angular-data.pseudobry.com/>\n' +
            '* @copyright (c) 2014 Jason Dobry <https://github.com/jmdobry/>\n' +
            '* @license MIT <https://github.com/jmdobry/angular-data/blob/master/LICENSE>\n' +
            '*\n' +
            '* @overview Data store for Angular.js.\n' +
            '*/\n'
        },
        files: {
          'dist/angular-data.min.js': ['dist/angular-data.js']
        }
      },
      scripts: {
        files: {
          'doc/resources/js/libs.min.js': ['doc/resources/js/libs.js']
        }
      }
    },
    browserify: {
      dist: {
        files: {
          'dist/angular-data.js': ['src/index.js']
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
        preprocessors: {},
        exclude: [
          'test/integration/datastore/cacheFactory.test.js'
        ]
      },
      min: {
        browsers: ['Firefox', 'PhantomJS'],
        options: {
          files: [
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/angular-cache/dist/angular-cache.js',
            'dist/angular-data.min.js',
            'karma.start.js',
            'test/integration/**/*.js'
          ]
        },
        exclude: [
          'test/integration/datastore/cacheFactory.test.js'
        ]
      },
      cacheFactory: {
        browsers: ['Firefox', 'PhantomJS'],
        options: {
          files: [
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'dist/angular-data.js',
            'karma.start.js',
            'test/integration/datastore/cacheFactory.test.js'
          ]
        }
      },
      DSCacheFactory: {
        browsers: ['Firefox', 'PhantomJS'],
        options: {
          files: [
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/angular-cache/dist/angular-cache.js',
            'dist/angular-data.js',
            'karma.start.js',
            'test/integration/datastore/DSCacheFactory.test.js'
          ]
        }
      },
      ci: {
        browsers: ['Firefox', 'PhantomJS'],
        exclude: [
          'test/integration/datastore/cacheFactory.test.js'
        ]
      }
    },
    coveralls: {
      options: {
        coverage_dir: 'coverage'
      }
    },

    concat: {
      dist: {
        files: [
          {
            src: [
              'doc/resources/js/jquery.js',
              'doc/resources/js/jquery.goto.js',
              'doc/resources/js/jquery.cookie.js',
              'bower_components/bootstrap/dist/js/bootstrap.min.js',
              'doc/resources/angular/angular.js',
              'doc/resources/angular/angular-route.js',
              'doc/resources/libraries/angular-bootstrap.js',
              'doc/resources/angular/angular-cookies.js',
              'doc/resources/angular/angular-resource.js',
              'doc/resources/angular/angular-sanitize.js'

            ],
            dest: 'doc/resources/js/libs.js'
          },
          {
            src: [
              'bower_components/bootstrap/dist/css/bootstrap.min.css',
              'doc/resources/css/font-awesome.css',
              'doc/resources/css/docular.css',
              'doc/resources/css/custom.css',
              'guide/angular-data.css'
            ],
            dest: 'doc/resources/css/styles.css'
          },
          {
            src: [
              'doc/resources/js/docs_module_begin.js',
              'doc/resources/js/controllers/index.js',
              'doc/resources/js/directives/index.js',
              'doc/resources/js/services/index.js',
              'doc/resources/js/directives/doc.js',
              'doc/resources/js/docs_module_end.js',
              'doc/documentation/docs-metadata.js',
              'doc/documentation/groups-metadata.js',
              'doc/documentation/layout-metadata.js'

            ],
            dest: 'doc/resources/js/scripts.js'
          }
        ]
      }
    },

    copy: {
      dist: {
        files: [
          {
            expand: true,
            cwd: 'guide/',
            src: ['index.html', 'favicon.ico'],
            dest: 'doc/',
            flatten: true
          },
          {
            expand: true,
            cwd: 'guide/',
            src: ['data_grey.png'],
            dest: 'doc/resources/img/',
            flatten: true
          }
        ]
      }
    },
    docular: {
      groups: [
        {
          groupTitle: 'Guide',
          groupId: 'guide',
          groupIcon: 'icon-book',
          sections: [
            {
              id: 'angular-data',
              title: 'angular-data',
              docs: [
                'guide/angular-data/index.md',
                'guide/angular-data/overview.md',
                'guide/angular-data/resources.md',
                'guide/angular-data/asynchronous.md',
                'guide/angular-data/synchronous.md',
                'guide/angular-data/queries.md',
                'guide/angular-data/adapters.md',
                'guide/angular-data/how.md'
              ],
              rank: {
                index: 1,
                overview: 2,
                resources: 3,
                asynchronous: 4,
                synchronous: 5,
                queries: 6,
                adapters: 7,
                how: 8
              }
            },
            {
              id: 'angular-cache',
              title: 'angular-cache',
              docs: ['guide/angular-cache/'],
              rank: {
                index: 1,
                basics: 2,
                configure: 3,
                http: 4,
                storage: 5
              }
            },
            {
              id: 'angular-data-mocks',
              title: 'angular-data-mocks',
              docs: ['guide/angular-data-mocks/'],
              rank: {
                index: 1,
                overview: 2,
                setup: 3,
                testing: 4
              }
            },
            {
              id: 'angular-data-resource',
              title: 'Defining Resources',
              docs: ['guide/angular-data/resource/'],
              rank: {
                index: 1,
                overview: 2,
                basic: 3,
                advanced: 4,
                lifecycle: 5,
                custom: 6,
                relations: 7
              }
            }
          ]
        },
        {
          groupTitle: 'API',
          groupId: 'api',
          groupIcon: 'icon-wrench',
          showSource: true,
          sections: [
            {
              id: 'angular-data',
              title: 'angular-data',
              scripts: [
                'src/'
              ],
              docs: ['guide/api']
            },
            {
              id: 'angular-cache',
              title: 'angular-cache',
              scripts: [
                'bower_components/angular-cache/dist/angular-cache.js'
              ],
              docs: ['guide/api']
            },
            {
              id: 'angular-data-mocks',
              title: 'angular-data-mocks',
              scripts: [
                'bower_components/angular-data-mocks/dist/angular-data-mocks.js'
              ],
              docs: ['guide/api']
            }
          ]
        }
      ],
      docular_webapp_target: 'doc',
      showDocularDocs: false,
      showAngularDocs: false,
      docular_partial_home: 'guide/home.html',
      docular_partial_navigation: 'guide/nav.html',
      docular_partial_footer: 'guide/footer.html',
      analytics: {
        account: 'UA-34445126-2',
        domainName: 'angular-data.pseudobry.com'
      },
      discussions: {
        shortName: 'angulardata',
        url: 'http://angular-data.pseudobry.com',
        dev: dev
      }
    }
  });

  grunt.registerTask('version', function (filePath) {
    var file = grunt.file.read(filePath);

    file = file.replace(/<%= pkg\.version %>/gi, pkg.version);

    grunt.file.write(filePath, file);
  });

  grunt.registerTask('banner', function () {
    var file = grunt.file.read('dist/angular-data.js');

    var banner = '/**\n' +
      '* @author Jason Dobry <jason.dobry@gmail.com>\n' +
      '* @file angular-data.js\n' +
      '* @version ' + pkg.version + ' - Homepage <http://angular-data.pseudobry.com/>\n' +
      '* @copyright (c) 2014 Jason Dobry <https://github.com/jmdobry/>\n' +
      '* @license MIT <https://github.com/jmdobry/angular-data/blob/master/LICENSE>\n' +
      '*\n' +
      '* @overview Data store for Angular.js.\n' +
      '*/\n';

    file = banner + file;

    grunt.file.write('dist/angular-data.js', file);
  });

  grunt.registerTask('test', ['build', 'karma:ci', 'karma:cacheFactory', 'karma:DSCacheFactory', 'karma:min']);
  grunt.registerTask('doc', ['clean:doc', 'docular', 'concat', 'copy', 'uglify:scripts']);
  grunt.registerTask('devdoc', ['clean:doc', 'docular', 'concat', 'copy']);
  grunt.registerTask('build', [
    'clean',
    'jshint',
    'browserify',
    'banner',
    'uglify:main'
  ]);
  grunt.registerTask('go', ['build', 'watch:dist']);
  grunt.registerTask('godoc', ['devdoc', 'watch:doc']);
  grunt.registerTask('default', ['build']);
};
