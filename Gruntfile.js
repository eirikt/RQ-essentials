/* global module:false, require:false */

module.exports = function (grunt) {
    'use strict';

    require('time-grunt')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        shell: {
            help: {
                options: { stdout: true, stderr: true, failOnError: true },
                command: [
                    'echo.',
                    'echo #######################################',
                    'echo       <%= pkg.name %> v<%= pkg.version %>',
                    'echo #######################################',
                    'echo.',
                    'echo Available Grunt tasks are:',
                    'echo   test                        executes all Mocha tests',
                    'echo   lint (alias:jshint)         run JSHint',
                    'echo   doc  (alias:docs,jsdoc)     build JSDoc (in local folder \'site\')'
                ].join('&&')
            },
            // TODO: Introduce 'grunt-git'
            publish:{
                options: { stdout: true, stderr: true, failOnError: true },
                command: [
                    'echo TODO: Publish to GitHub Pages'
                ].join('&&')
            }
        },

        // Server-side/Node.js specs/tests
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec'
                },
                src: ['test/*.spec.js']
            }
        },

        jshint: {
            all: [
                '*.js'
            ],
            options: {
                //reporter: 'jslint',
                reporter: 'checkstyle',
                //reporter: require('jshint-stylish'),

                //reporterOutput: 'dist/jshint.xml',

                node: true,
                mocha: true,

                bitwise: true,
                camelcase: true,
                curly: true,
                eqeqeq: true,
                //es3: true,        // ES3 not relevant for Node.js
                //es5: true,        // Default
                forin: true,
                freeze: true,
                funcscope: true,
                futurehostile: true,
                globals: false,
                globalstrict: false,
                immed: true,
                indent: true,
                latedef: true,
                newcap: true,
                noarg: true,
                nocomma: true,
                noempty: true,
                nonbsp: true,
                nonew: true,
                plusplus: true,
                //qoutmark: true,   // Not forcing consistent use of 'single' or 'double' as of now ...
                singleGroups: true,
                undef: true,
                //unused: true,     // Don't know how to avoid this one - does not fit with hoisted variables/CommonJS style ...
                strict: true,
                trailing: true,

                maxcomplexity: 7,   // Good enough ...
                maxdepth: 4,
                maxlen: 250,        // I have a laaarge screen ...
                maxparams: 8,       // Cause I looove currying ...
                maxstatements: 30   // Default: ...
            }
        },

        jsdoc: {
            dist: {
                src: ['*.js'],
                options: {
                    destination: 'site',
                    private: false
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jsdoc');

    grunt.registerTask('help', ['shell:help']);
    grunt.registerTask('test', ['mochaTest']);
    grunt.registerTask('lint', ['jshint']);
    grunt.registerTask('doc', ['jsdoc']);
    grunt.registerTask('docs', ['jsdoc']);
    // TODO: Introduce 'grunt-git'
    grunt.registerTask('publish', ['docs', 'shell:publish']);

    grunt.registerTask('build:travis', ['test', 'lint']);
    grunt.registerTask('build:all', ['test', 'lint', 'doc']);

    grunt.registerTask('default', ['help']);
};
