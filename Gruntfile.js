/* jshint -W097 */
'use strict';

var path = require('path');

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    var initProps = {
            src         : path.join(__dirname,'src'),
            dist        : path.join(__dirname,'dist')
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
        }
    });
    
    grunt.registerTask('build',function(type){
        grunt.task.run('clean');
        grunt.task.run('copy');
    });
    
    grunt.registerTask('default', ['build']);
};
