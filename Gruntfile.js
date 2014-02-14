/*
 * grunt-readme
 * https://github.com/phadej/grunt-readme
 *
 * Copyright (c) 2013 Oleg Grenrus
 * Licensed under the BSD3 license.
 */

"use strict";

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        "Gruntfile.js",
        "lib/*.js",
        "bin/*.js",
        "tasks/*.js",
      ],
      options: {
        jshintrc: ".jshintrc",
      },
    },

    // Configuration to be run (and then tested).
    literate: {
      "README.md": "tasks/literate.js",
      "demo1": {
        src: "tasks/literate.js",
        dest: "tasks-literate-js.md",
        options: {
          code: true,
        },
      },
      "literated-src": {
        src: ["tasks/literate.js", "lib/*.js", "bin/*.js"],
        dest: "literated-src",
        options: {
          code: true,
          comments: false,
          separate: true,
          separateBanner: "# {{{ filename }}}\n\n",
          include: false,
        },
      },
    },

    bfdocs: {
      documentation: {
        options: {
          title: "Grunt literate",
          manifest: {
            files: [ "README.md" ],
          },
          dest: "documentation/",
          theme: "default",
        }
      }
    },
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks("tasks");

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-beautiful-docs");

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  // grunt.registerTask('test', ['clean', 'readme', 'nodeunit']);

  // Docs task
  grunt.registerTask("docs", ["literate", "bfdocs"]);

  // By default, lint and run all tests.
  grunt.registerTask("default", ["jshint"]);

};
