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
    },
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks("tasks");

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks("grunt-contrib-jshint");

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  // grunt.registerTask('test', ['clean', 'readme', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask("default", ["jshint"]);

};
