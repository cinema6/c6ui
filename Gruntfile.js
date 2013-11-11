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
        concat: {
            dist: {
                files: {
                    '.tmp/c6uilib.js' : [
                        '<%= settings.src %>/c6ui.js',
                        '<%= settings.src %>/anicache/anicache.js',
                        '<%= settings.src %>/browser/info.js',
                        '<%= settings.src %>/browser/user_agent.js',
                        '<%= settings.src %>/computed/computed.js',
                        '<%= settings.src %>/controls/controls.js',
                        '<%= settings.src %>/debounce/debounce.js',
                        '<%= settings.src %>/events/emitter.js',
                        '<%= settings.src %>/events/journal.js',
                        '<%= settings.src %>/format/format.js',
                        '<%= settings.src %>/imagepreloader/imagepreloader.js',
                        '<%= settings.src %>/mouseactivity/mouseactivity.js',
                        '<%= settings.src %>/panels/panels.js',
                        '<%= settings.src %>/postmessage/postmessage.js',
                        '<%= settings.src %>/resize/resize.js',
                        '<%= settings.src %>/sfx/sfx.js',
                        '<%= settings.src %>/site/site.js',
                        '<%= settings.src %>/url/urlmaker.js',
                        '<%= settings.src %>/videos/playlist.js',
                        '<%= settings.src %>/videos/playlist_history.js',
                        '<%= settings.src %>/videos/video.js',
                        '<%= settings.src %>/visible/visible.js',
                        '<%= settings.src %>/c6log.js'
                    ]
                }
            }
        },
        uglify: {
            dist: {
                files: {
                    '.tmp/c6uilib.min.js': [
                        '.tmp/c6uilib.js'
                    ],
                }
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
        sed: {
            copyright: {
                pattern: '//%COPY_RIGHT%',
                replacement: '<%= settings.copyNotice() %>',
                path: '<%= settings.dist %>',
                recursive: true
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
        grunt.task.run('gitLastCommit');
        grunt.task.run('clean');
        grunt.task.run('copy:dist');
        grunt.task.run('sed');
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
