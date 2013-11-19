/* jshint -W097 */
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

    initProps.copyNotice = function(){
        return '/*\n' +
            ' * Copyright © Cinema6 2013 All Rights Reserved. No part of this library\n' +
            ' * may be reproduced without Cinema6\'s express consent.\n' +
            ' *\n' +
            ' * Build Version: ' +  this.gitLastCommit.commit + ', ' +
                                    this.gitLastCommit.date + '\n' +
            ' * Build Date: ' +  this.buildDate.toString() + '\n' +
            ' */\n' ;
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
                        cwd: '.tmp/build',
                        dest: '<%= settings.dist %>',
                        src: [
                            '**'
                        ]
                    },
                    {
                        expand: true,
                        flatten: true,
                        dot: true,
                        cwd: '<%= settings.src %>',
                        dest: '<%= settings.dist %>/img',
                        src: '**/*.{jpg,png,svg,gif}'
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
        concat: {
            c6ui: {
                options: {
                    banner: '<%= settings.copyNotice() %>'
                },
                files: {
                    '.tmp/build/c6uilib.js' : [
                        '<%= settings.src %>/c6ui.js',
                        '<%= settings.src %>/**/*.js',
                        '!<%= settings.src %>/c6log.js'
                    ]
                }
            },
            c6log: {
                options: {
                    banner: '<%= settings.copyNotice() %>'
                },
                files: {
                    '.tmp/build/c6log.js' : [
                        '<%= settings.src %>/c6log.js'
                    ]
                }
            }
        },
        uglify: {
            c6ui: {
                options: {
                    banner: '<%= settings.copyNotice() %>'
                },
                files: {
                    '.tmp/build/c6uilib.min.js': [
                        '.tmp/build/c6uilib.js'
                    ],
                }
            },
            c6log: {
                options: {
                    banner: '<%= settings.copyNotice() %>'
                },
                files: {
                    '.tmp/build/c6log.min.js': [
                        '.tmp/build/c6log.js'
                    ],
                }
            }
        },
        cssmin: {
            normal: {
                files: {
                    '<%= settings.dist %>/css/c6uilib.min.css': ['src/**/*.css', '!src/**/*--hover.css']
                }
            },
            hover: {
                files: {
                    '<%= settings.dist %>/css/c6uilib--hover.min.css': ['src/**/*--hover.css']
                }
            }
        },
        ngtemplates: {
            dist: {
                cwd: 'src',
                src: '**/*.html',
                dest: '.tmp/templates.js',
                options: {
                    prefix: 'c6ui/',
                    module: 'c6.ui',
                    concat: 'c6ui',
                    htmlmin: {
                        collapseBooleanAttributes: true,
                        collapseWhitespace: true,
                        removeAttributeQuotes: true,
                        removeComments: true,
                        removeEmptyAttributes: true,
                        removeRedundantAttributes: true,
                        removeScriptTypeAttributes: true,
                        removeStyleLinkTypeAttributes: true
                    }
                }
            },
            app: {
                cwd: 'src',
                src: '**/*.html',
                dest: '<%= settings.app %>/assets/lib/c6ui/templates.js',
                options: {
                    prefix: 'c6ui/',
                    module: 'c6.ui',
                }
            },
            test: {
                cwd: 'src',
                src: '**/*.html',
                dest: '.tmp/templates.js',
                options: {
                    prefix: 'c6ui/',
                    module: 'c6.ui',
                }
            }
        },
        watch: {
            build: {
                files: '<%= settings.src %>/**',
                tasks: ['copy:app', 'ngtemplates:app']
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
        grunt.task.run('jshint');
        grunt.task.run('ngtemplates:test');
        grunt.task.run('karma:unit');
    });

    grunt.registerTask('debug', function(){
        grunt.task.run('ngtemplates:test');
        grunt.task.run('karma:debug');
    });

    grunt.registerTask('build',function(){
        grunt.task.run('test');
        grunt.task.run('gitLastCommit');
        grunt.task.run('clean');
        grunt.task.run('ngtemplates');
        grunt.task.run('cssmin');
        grunt.task.run('concat');
        grunt.task.run('uglify');
        grunt.task.run('copy:dist');
    });

    grunt.registerTask('server', function() {
        grunt.task.run('copy:app');
        grunt.task.run('ngtemplates:app');
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
