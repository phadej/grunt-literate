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

- `boolean code = false`, whether to include code parts or not

### Directives

Comments starting with triple slash `///` are directive comments. Currently supported directives are:

- `include` _filename_: include process _filename_ here.
- `plain` _filename_: include _filename_ here, without any processing, as is.



## beautiful-docs

This package plays well with [beautiful-docs](http://beautifuldocs.com/) and [grunt-beautiful-docs](https://www.npmjs.org/package/grunt-beautiful-docs) especially.

It's easy to start, you only need to configure `literate` and `bfdocs` tasks:

```js
grunt.initConfig({
  literate: {
     "README.md": ["lib/*.js"]
  },
  bfdocs: {
    docs: {
      options: {
        title: "My fabulous documentation",
        manifest: {
          files: [ "README.md" ],
        },
        dest: "doc/",
        theme: "default",
      }
    }
  },
});
```

or check [`Gruntfile.js`](https://github.com/phadej/grunt-literate/blob/master/Gruntfile.js) in the repository for the real example.

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality.
Lint and test your code using [Grunt](http://gruntjs.com/).
Make a pull request, but don't commit `README.md`!

## Release History

- 0.2.0 Split out
  - Library is in [ljs](https://github.com/phadej/ljs) package now
- 0.1.5 Maintenance release
  - Updated dependencies
  - Added note about beautiful docs
- 0.1.4 Usage as executable and library
  - run `ljs`
  - or `require("grunt-literate")(filename)`
  - also you may use glob patterns in directives
- 0.1.3 Directives
- 0.1.2 Newline improvements
  - Newline at the end of comment
  - Only one newline at the end of generated file
- 0.1.1 Fix issue with unindenting
- 0.1.0 Initial release

Copyright Oleg Grenrus 2013

All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.

    * Redistributions in binary form must reproduce the above
      copyright notice, this list of conditions and the following
      disclaimer in the documentation and/or other materials provided
      with the distribution.

    * Neither the name of Oleg Grenrus nor the names of other
      contributors may be used to endorse or promote products derived
      from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
