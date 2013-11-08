// vim: set sts=2 sw=2 ts=2 et:
/*
 * grunt-literate
 * https://github.com/phadej/grunt-quotmark
 *
 * Copyright (c) 2013 Oleg Grenrus
 * Licensed under the BSD3 license.
 */

/**

# grunt-literate

> Generate docs from your source

[![Code Climate](https://codeclimate.com/github/phadej/grunt-literate.png)](https://codeclimate.com/github/phadej/grunt-literate)

## Getting Started

This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before,
be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide,
as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins.

Once you're familiar with that process, you may install this plugin with this command:

```sh
npm install grunt-literate --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-literate');
```

## The "literate" task

In your project's Gruntfile, add a section named `literate` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  literate: {
     "README.md": "lib/foobar.js"
  }
});
```

The source will be parsed as JavaScript, and `/** ... ` comments extracted to the destionation file.
This example uses markdown, but you are free to use any format, or even just plain text.

### Options

- `boolean code = false`, whether to include code parts or not

### Directives

Comments starting with triple slash `///` are directive comments. Currently supported directives are:

- `include` _filename_: include process _filename_ here.
- `plain` _filename_: include _filename_ here, without any processing, as is.

*/
/// include ../lib/literate.js
/// plain ../footer.md

"use strict";

var literate = require("../lib/literate.js");
var assert = require("assert");

module.exports = function(grunt) {
  grunt.registerMultiTask("literate", "Generate docs from your source", function() {
    var options = this.options({
      code: false,
    });

    this.files.forEach(function (f) {
      assert(f.dest, "dest argument is required");
      var content = "";

      try {
      f.src.forEach(function (filename) {
        content += literate(filename, options);
      });
      } catch (e) {
        console.log(e.stack);
      }

      // Write file
      grunt.file.write(f.dest, content);
    });
  });
};
