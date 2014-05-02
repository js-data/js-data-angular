/*
 * angular-data
 * http://github.com/jmdobry/angular-data
 *
 * Copyright (c) 2014 Jason Dobry <http://jmdobry.github.io/angular-data>
 * Licensed under the MIT license. <https://github.com/jmdobry/angular-data/blob/master/LICENSE>
 */
module.exports = function (grunt) {
	'use strict';

	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);

	var dev = process.cwd().indexOf('/home/codetrain/angular-data') === -1,
		pkg = grunt.file.readJSON('package.json');

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
			files: ['src/**/*.js'],
			tasks: ['build']
		},
		uglify: {
			main: {
				options: {
					banner: '/**\n' +
						'* @author Jason Dobry <jason.dobry@gmail.com>\n' +
						'* @file angular-data.min.js\n' +
						'* @version <%= pkg.version %> - Homepage <http://angular-data.codetrain.io/>\n' +
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
				},
				options: {
					alias: [
						'lib/observe-js/observe-js.js:observejs',
						'src/errors/index.js:errors',
						'src/utils/index.js:utils'
					],
					// TODO: There's got to be a better way to consume observe-js without it polluting the global space
					postBundleCB: function (err, src, next) {
						if (err) {
							next(err);
						}
						src = src.replace('(typeof global !== \'undefined\' && global ? global : window)', '((exports.Number = { isNaN: window.isNaN }) ? exports : exports)');
						next(err, src);
					}
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
				singleRun: false
			},
			min: {
				browsers: ['Chrome'],
				autoWatch: false,
				singleRun: true,
				options: {
					files: [
						'bower_components/angular/angular.js',
						'bower_components/angular-mocks/angular-mocks.js',
						'dist/angular-data.min.js',
						'test/integration/**/*.js',
						'karma.start.js'
					]
				}
			},
			ci: {
				browsers: ['Firefox', 'PhantomJS']
			}
		},
		coveralls: {
			options: {
				coverage_dir: 'coverage'
			}
		},

		concat: {
			libs: {
				src: [
					'doc/resources/js/jquery.js',
					'doc/resources/js/jquery.goto.js',
					'doc/resources/js/jquery.cookie.js',
					'doc/resources/angular/angular.js',
					'doc/resources/angular/angular-bootstrap.js',
					'doc/resources/angular/angular-bootstrap-prettify.js',
					'doc/resources/angular/angular-cookies.js',
					'doc/resources/angular/angular-resource.js',
					'doc/resources/angular/angular-sanitize.js'

				],
				dest: 'doc/resources/js/libs.js'
			},
			scripts: {
				src: [
					'doc/resources/js/docs_module_begin.js',
					'guide/angular-data.js',
					'doc/resources/doc_api_resources/doc_api.js',
					'doc/resources/js/docs_module_end.js',
					'doc/documentation/docs-metadata.js',
					'doc/documentation/groups-metadata.js',
					'doc/documentation/layout-metadata.js'

				],
				dest: 'doc/resources/js/scripts.js'
			},
			css: {
				src: [
					'doc/resources/css/bootstrap.min.css',
					'doc/resources/css/font-awesome.css',
					'doc/resources/css/docular.css',
					'doc/resources/css/custom.css',
					'doc/resources/doc_api_resources/doc_api.css',
					'guide/angular-data.css'
				],
				dest: 'doc/resources/css/styles.css'
			}
		},

		copy: {
			favicon: {
				expand: true,
				cwd: 'guide/',
				src: 'favicon.ico',
				dest: 'doc/',
				flatten: true
			},
			index: {
				expand: true,
				cwd: 'guide/',
				src: 'index.html',
				dest: 'doc/',
				flatten: true
			},
			data_white: {
				expand: true,
				cwd: 'guide/',
				src: 'data_white.png',
				dest: 'doc/resources/img/',
				flatten: true
			},
			chart: {
				expand: true,
				cwd: 'guide/',
				src: 'chart.png',
				dest: 'doc/resources/img/',
				flatten: true
			},
			cream_dust: {
				expand: true,
				cwd: 'guide/',
				src: 'cream_dust.png',
				dest: 'doc/resources/img/',
				flatten: true
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
								'guide/angular-data/index.doc',
								'guide/angular-data/overview.doc',
								'guide/angular-data/resources.doc',
								'guide/angular-data/synchronous.doc',
								'guide/angular-data/asynchronous.doc'
							],
							rank: {
								index: 1,
								overview: 2,
								resources: 3,
								synchronous: 4,
								asynchronous: 5
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
							id: 'angular-data-resource',
							title: 'Defining Resources',
							docs: ['guide/angular-data/resource/'],
							rank: {
								index: 1,
								overview: 2,
								basic: 3,
								advanced: 4,
								lifecycle: 5
							}
						},
						{
							id: 'angular-data-queries',
							title: 'Queries',
							docs: ['guide/angular-data/queries/'],
							rank: {
								index: 1,
								overview: 2
							}
						},
						{
							id: 'angular-data-adapters',
							title: 'Adapters',
							docs: ['guide/angular-data/adapters/'],
							rank: {
								index: 1,
								overview: 2
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
				account: 'UA-46792694-5',
				domainName: 'angular-data.codetrain.io'
			},
			discussions: {
				shortName: 'angular-data',
				url: 'http://angular-data.codetrain.io',
				dev: dev
			}
		}
	});

	grunt.registerTask('version', function (filePath) {
		var file = grunt.file.read(filePath);

		file = file.replace(/<%= pkg\.version %>/gi, pkg.version);

		grunt.file.write(filePath, file);
	});

	grunt.registerTask('test', ['clean:coverage', 'karma:dev']);
	grunt.registerTask('doc', ['clean:doc', 'docular', 'concat', 'copy', 'clean:afterDoc', 'uglify:scripts']);
	grunt.registerTask('build', [
		'clean',
		'jshint',
		'browserify',
		'version:dist/angular-data.js',
		'uglify:main'
	]);
	grunt.registerTask('default', ['build']);

	// Used by TravisCI
	grunt.registerTask('ci', ['build', 'karma:ci', 'coveralls', 'doc']);
};
