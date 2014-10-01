/* jshint -W097, devel:true */
'use strict';

var path = require('path');

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    var initProps = {
            src         : path.join(__dirname,'src'),
            dist        : path.join(__dirname,'dist'),
            app         : path.join(__dirname,'app'),
            buildDate   : new Date()
        };
    initProps.version     = function(){
        return this.gitLastCommit.commit;
    };

    initProps.versionFull     = function(){
        return this.gitLastCommit.commit + ', ' + this.gitLastCommit.date;
    };

    initProps.copyNotice = function(lastCommit){
        return '/*\n' +
            ' * Copyright © Cinema6 2013 All Rights Reserved. No part of this library\n' +
            ' * may be reproduced without Cinema6\'s express consent.\n' +
            ' *\n' +
            ' * Build Version: ' +  lastCommit.commit + ', ' +
                                    lastCommit.date + '\n' +
            ' * Build Date: ' +  (new Date()).toString() + '\n' +
            ' */\n' ;
    };


    grunt.initConfig({
        settings : initProps,
        copy: {
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
                tasks: ['copy:app']
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
                singleRun: true,
                reporters: ['progress', 'junit'],
                junitReporter: {
                    outputFile: 'reports/unit.xml'
                }
            },
            debug: {
                configFile: 'test/karma.conf.js',
                singleRun: false
            }
        },
        requirejs: {
            dist: {
                options: {
                    baseUrl: './src',
                    paths: {
                        angular: 'empty:'
                    },
                    dir: '<%= settings.dist %>',
                    optimize: 'none',
                    removeCombined: true,
                    wrap: {
                        start: '<%= settings.copyNotice(settings.gitLastCommit) %>'
                    },
                    modules: [
                        {
                            name: 'c6uilib'
                        },
                        {
                            name: 'c6log',
                            exclude: ['format/format']
                        }
                    ]
                }
            }
        },
        uglify: {
            dist: {
                options: {
                    banner: '<%= settings.copyNotice(settings.gitLastCommit) %>',
                    sourceMap: true
                },
                files: [
                    {
                        expand: true,
                        cwd: '<%= settings.dist %>',
                        src: '**/*.js',
                        dest: '<%= settings.dist %>',
                        ext: '.min.js',
                        extDot: 'last'
                    }
                ]
            }
        }
    });

    grunt.registerTask('test', function(){
        grunt.task.run('jshint');
        grunt.task.run('karma:unit');
    });

    grunt.registerTask('debug', function(){
        grunt.task.run('karma:debug');
    });

    grunt.registerTask('build',function(){
        grunt.task.run('test');
        grunt.task.run('gitLastCommit');
        grunt.task.run('requirejs');
        grunt.task.run('uglify');
    });

    grunt.registerTask('server', function() {
        grunt.task.run('copy:app');
        grunt.task.run('connect:dev');
        grunt.task.run('watch');
    });

    grunt.registerTask('default', ['build']);

    grunt.registerTask('gitLastCommit','Get a version number using git commit', function(){
        var settings = grunt.config.get('settings'),
            done = this.async(),
            handleVersionData = function(data){
                if ((data.commit === undefined) || (data.date === undefined)){
                    grunt.log.errorlns('Failed to parse version.');
                    return done(false);
                }
                data.date = new Date(data.date * 1000);
                settings.gitLastCommit = data;
                grunt.log.writelns('Last git Commit: ' +
                    JSON.stringify(settings.gitLastCommit,null,3));
                grunt.config.set('settings',settings);
                return done(true);
            };

        if (settings.gitLastCommit){
            return done(true);
        }

        if (grunt.file.isFile('version.json')){
            return handleVersionData(grunt.file.readJSON('version.json'));
        }

        grunt.util.spawn({
            cmd     : 'git',
            args    : ['log','-n1','--format={ "commit" : "%h", "date" : "%ct" , "subject" : "%s" }']
        },function(err,result){
            if (err) {
                grunt.log.errorlns('Failed to get gitLastCommit: ' + err);
                return done(false);
            }
            handleVersionData(JSON.parse(result.stdout));
        });
    });
};
