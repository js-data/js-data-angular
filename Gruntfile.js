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

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			coverage: ['coverage/'],
			dist: ['dist/'],
			doc: ['doc/']
		},
		jshint: {
			all: ['Gruntfile.js', 'src/**/*.js', 'test/*.js'],
			jshintrc: '.jshintrc'
		},
		uglify: {
			main: {
				options: {
					banner: '/**\n' +
						'* @author Jason Dobry <jason.dobry@gmail.com>\n' +
						'* @file angular-data.min.js\n' +
						'* @version <%= pkg.version %> - Homepage <http://jmdobry.github.io/angular-data/>\n' +
						'* @copyright (c) 2014 Jason Dobry <http://jmdobry.github.io/angular-data>\n' +
						'* @license MIT <https://github.com/jmdobry/angular-data/blob/master/LICENSE>\n' +
						'*\n' +
						'* @overview In-browser data store for Angular.js.\n' +
						'*/\n'
				},
				files: {
					'dist/angular-data.min.js': ['dist/angular-data.js']
				}
			}
		},
		browserify: {
			dist: {
				files: {
					'dist/angular-data.js': ['src/index.js']
				}
			}
//		},
//		karma: {
//			options: {
//				configFile: './karma.conf.js'
//			},
//			dev: {
//				browsers: ['Chrome'],
//				autoWatch: true,
//				singleRun: false
//			},
//		},
//		coveralls: {
//			options: {
//				coverage_dir: 'coverage'
//			}
		},
		docular: {
			groups: [
				{
					groupTitle: 'API',
					groupId: 'api',
					groupIcon: 'icon-wrench',
					showSource: true,
					sections: [
						{
							id: 'api',
							title: 'angular-data',
							scripts: [
								'src/'
							]
						}
					]
				}
			],
			docular_webapp_target: 'doc',
			showDocularDocs: false,
			showAngularDocs: false
		}
	});

	grunt.registerTask('doc', ['clean:doc', 'docular']);
	grunt.registerTask('build', ['clean:dist', 'jshint', 'browserify', 'uglify', 'doc']);
	grunt.registerTask('default', ['build']);

	// Used by the CLI build servers
	grunt.registerTask('test-cli', ['karma:1.0.4', 'karma:1.0.5', 'karma:1.0.6', 'karma:1.0.7', 'karma:1.0.8', 'karma:1.1.4', 'karma:1.1.5']);
	grunt.registerTask('cli', ['clean', 'jshint', 'copy', 'uglify', 'test-cli', 'coveralls']);
};
