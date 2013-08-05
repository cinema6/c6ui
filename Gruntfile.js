/* jshint -W097 */
'use strict';

var path = require('path');

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    var initProps = {
            src         : path.join(__dirname,'src'),
            dist        : path.join(__dirname,'dist'),
		    app         : path.join(__dirname,'app')
        };

    grunt.initConfig({
        settings : initProps,
        clean: {
            dist: '<%= settings.dist %>'
        },
        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: '<%= settings.src %>',
                        dest: '<%= settings.dist %>',
                        src: [
                            '**'
                        ]
                    }
                ]
            },
			app: {
				files: [
					{
						expand: true,
						cwd: '<%= settings.src %>',
						dest: '<%= settings.app %>/assets/lib/c6ui',
                        src: [
                            '**'
                        ]
					},
                    {
                        expand: true,
                        cwd: 'lib',
                        dest: '<%= settings.app %>/assets/lib',
                        src: [
                            '**'
                        ]
                    }
				]
			}
        },
        watch: {
            build: {
                files: '<%= settings.src %>/**',
                tasks: 'copy:app'
            }
        },
		connect: {
			dev: {
				options: {
					port: 9000,
					hostname: '*',
					base: '<%= settings.app %>',
					middleware: function(connect, options) {
						return [
							connect.static(options.base),
							connect.directory(options.base)
						];
					}
				}
			}
		},
        jshint: {
            options: {
                jshintrc: 'jshint.json'
            },
            all: [
                'Gruntfile.js',
                '<%= settings.src %>/{,*/}*.js'
            ]
        },
        karma: {
            unit: {
                configFile: 'test/karma.conf.js',
                singleRun: true
            },
            debug: {
                configFile: 'test/karma.conf.js',
                singleRun: false
            }
        }
    });

    grunt.registerTask('test', function(){
        grunt.task.run('jshint'),
        grunt.task.run('karma:unit');
    });

    grunt.registerTask('debug', function(){
        grunt.task.run('karma:debug');
    });

    grunt.registerTask('build',function(){
        grunt.task.run('test');
        grunt.task.run('clean');
		grunt.task.run('copy:dist');
    });

	grunt.registerTask('server', function() {
		grunt.task.run('copy:app');
        grunt.task.run('connect:dev');
        grunt.task.run('watch');
	});

    grunt.registerTask('default', ['build']);
};
