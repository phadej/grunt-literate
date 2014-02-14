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

[![Build Status](https://travis-ci.org/phadej/grunt-literate.png)](https://travis-ci.org/phadej/grunt-literate)
[![Code Climate](https://codeclimate.com/github/phadej/grunt-literate.png)](https://codeclimate.com/github/phadej/grunt-literate)
[![NPM version](https://badge.fury.io/js/grunt-literate.png)](http://badge.fury.io/js/grunt-literate)
[![Dependency Status](https://gemnasium.com/phadej/grunt-literate.png)](https://gemnasium.com/phadej/grunt-literate)

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

The source will be parsed as JavaScript, and `/** ... ` comments extracted to the destination file.
This example uses markdown, but you are free to use any format, or even just plain text.

### Options

- `code : boolean`, default `false`, whether to include code parts or not
- `comments : boolean`, default `true`, whether to include comments
- `include : boolean`, default `true`, whether to process `include` and `plain` directives.
- `separate : boolean`, default `false`.
  - if `false` input files are concatenated and written into `dest` file
  - if `true`, input files are processed separately and written into `dest` directory
- `separateExtension : string`, default `md`, extension to append to files, when processed separately.
- `separateBanner : string`, default "", banner to prepend to the separate files. Processed with [mustache](http://mustache.github.io/).

### Directives

Comments starting with triple slash `///` are directive comments. Currently supported directives are:

- `include` _filename_: include process _filename_ here.
- `plain` _filename_: include _filename_ here, without any processing, as is.

*/
/// include ../lib/*
/// include ../bin/ljs.js
/// plain ../beautiful-docs.md
/// plain ../CONTRIBUTING.md
/// plain ../CHANGELOG.md
/// plain ../footer.md
/// plain ../LICENSE

"use strict";

var literate = require("../lib/literate.js");
var assert = require("assert");
var mkdirp = require("mkdirp");
var path = require("path");
var mustache = require("mustache");

module.exports = function(grunt) {
  grunt.registerMultiTask("literate", "Generate docs from your source", function() {
    var options = this.options({
      code: false,
      comments: true,
      include: true,
      separate: false,
      separateExtension: "md",
      separateBanner: "",
    });

    this.files.forEach(function (f) {
      var content;

      assert(f.dest, "dest argument is required");

      if (options.separate) {
        mkdirp.sync(f.dest);

        f.src.forEach(function (filename) {
          var banner = mustache.render(options.separateBanner, { filename: filename });
          content = banner + literate(filename, options);
          grunt.file.write(path.join(f.dest, filename.replace(/[\\\/]/g, "-") + "." + options.separateExtension), content);
        });
      } else {
        content = "";

        try {
        f.src.forEach(function (filename) {
          content += literate(filename, options);
        });
        } catch (e) {
          console.log(e.stack);
        }

        // Write file
        grunt.file.write(f.dest, content);
      }
    });
  });
};
