
```js
// vim: set sts=2 sw=2 ts=2 et:
/*
 * grunt-literate
 * https://github.com/phadej/grunt-quotmark
 *
 * Copyright (c) 2013 Oleg Grenrus
 * Licensed under the BSD3 license.
 */
```

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


### Lex.js

This is for demo of `/// include` directive.


```js
"use strict";

var esprima = require("esprima");

function lex(contents) {
  var syntax = esprima.parse(contents, {
    tokens: true,
    loc: true,
    range: true,
    comment: true
  });

  var tokens = [];
  var currRange = 0;

  function addWhitespace(from, to) {
    var ws;

    var comments = syntax.comments.filter(function (comment) {
      return comment.range[0] >= from && comment.range[1] <= to;
    });

    comments.forEach(function (comment) {
      if (comment.range[0] !== from) {
        ws = contents.substr(from, comment.range[0] - from);

        tokens.push({
          type: "Whitespace",
          value: ws,
          range: [
            from,
            comment.range[0]
          ]
        });
      }

      tokens.push({
        type: "Comment",
        value: comment,
        range: comment.range,
      });

      from = comment.range[1];
    });

    if (from !== to) {
      ws = contents.substr(from, to - from);

      tokens.push({
        type: "Whitespace",
        value: ws,
        range: [
          from,
          to
        ]
      });
    }

  }

  // Go thru all tokens esprima returns
  syntax.tokens.forEach(function (token) {
    // Some comments and whitespace skipped
    if (token.range[0] !== currRange) {
      addWhitespace(currRange, token.range[0]);
    }

    tokens.push(token);
    currRange = token.range[1];
  });

  // trailing whitespace
  if (contents.length !== currRange) {
    addWhitespace(currRange, contents.length);
  }

  return tokens;
}

module.exports = lex;
"use strict";
```

### Library

You can also use *grunt-literate* as a normal library:

```
var documentation = require("grunt-literate")("hello.js", { code: true });
```


```js
var lex = require("./lex.js");
var fs = require("fs");
var path = require("path");
var assert = require("assert");
var glob = require("glob");

var whitespaceEndRe = /^\s*$/;
var whitespaceRe = /^(\s*)/;

function isWhitespace(str) {
  return whitespaceEndRe.test(str);
}

function find(array, predicate) {
  for (var i = 0; i < array.length; i++) {
    if (predicate(array[i])) {
      return array[i];
    }
  }
}

function stripShebang(contents) {
  var m = contents.match(/^#!\/[^\n]*\n/);
  return m ? contents.substr(m[0].length) : contents;
}

function fileDirective(filename, value, regexp, callback) {
  var m = value.match(regexp);
  if (m) {
    var directivePattern = m[1];
    var globPattern = path.join(path.dirname(filename), directivePattern);
    var files = glob.sync(globPattern);
    if (files.length === 0) {
      throw new Error(directivePattern + " doesn't match any files");
    }
    files.forEach(callback);
    return true;
  } else {
    return false;
  }
}

function getTokens(filename) {
  var contents = fs.readFileSync(filename).toString();
  contents = stripShebang(contents);
  var tokens = lex(contents);

  var resTokens = [];
  tokens.forEach(function (token) {
    var r;

    if (token.type === "Comment" && token.value.type === "Line" && token.value.value[0] === "/") {
      var value = token.value.value.substr(1);
      r = fileDirective(filename, value, /^\s*plain\s+(.*?)\s*$/, function (includename) {
        resTokens.push({
          type: "Plain",
          value: fs.readFileSync(includename).toString(),
        });
      });
      if (r) { return; }

      r = fileDirective(filename, value, /^\s*include\s+(.*?)\s*$/, function (includename) {
        resTokens = resTokens.concat(getTokens(includename));
      });
      if (r) { return; }

      assert(false, "unknown directive: " + value);

    } else {
      token.raw = contents.substr(token.range[0], token.range[1] - token.range[0]);
      resTokens.push(token);
    }
  });
  return resTokens;
}

function literate(filename, opts) {
  opts = opts || {};
  var code = opts.code || false;
  var codeOpen = opts.codeOpen || "\n```js\n";
  var codeClose = opts.codeClose || "\n```\n\n";

  var tokens = getTokens(filename);

  var state = "code";
  var content = "";

  var tmp = ""; // buffer for code output

  function appendCode() {
     if (state === "code") {
      state = "text";
      if (!isWhitespace(tmp)) {
        content += codeOpen + tmp.replace(/^[\s\n]*/, "").replace(/[\s\n]*$/, "") + codeClose;
      }
      tmp = "";
    }
  }

  tokens.forEach(function (token) {
    if (token.type === "Plain") {
      appendCode();
      content += "\n" + token.value;

    } else if (token.type === "Comment" && token.value.type === "Block" && token.value.value[0] === "*") {
      appendCode();

      // literate comment
      var comment = token.value;

      // block comment starting with /**
      var value = comment.value.slice(1);

      var lines = value.split(/\n/);
      var first = find(lines, function (line) { return !isWhitespace(line); } );
      var indent = first ? whitespaceRe.exec(first)[1] : "";

      // Drop empty lines at the beginning of the literate comment
      while (true) {
        if (lines[0] !== undefined && isWhitespace(lines[0])) {
          lines.shift();
        } else {
          break;
        }
      }

      // unindent lines
      lines = lines.map(function (line) {
        if (line.indexOf(indent) === 0) {
          return line.replace(indent, "");
        } else if (isWhitespace(line)) {
          return "";
        } else {
          return line;
        }
      });

      // Each line should have newline char after, also the last
      content += lines.join("\n") + "\n";
    } else if (code) {
      // Code
      if (state !== "code") {
        state = "code";
        tmp = "";
      }

      tmp += token.raw;
    }
  });

  // Append code at end of the file
  appendCode();

  // Just one newline at eof
  content = content.replace(/\n+$/, "\n");

  return content;
}

module.exports = literate;
```

### ljs

If `grunt-literate` is installed globally,
you can use `ljs` command line tool to process your literate javascript files

```sh
$ ljs -c -o foo.md foo.js
$ ljs --help
```


```js
"use strict";

var optimist = require("optimist");
var fs = require("fs");

var literate = require("../lib/literate.js");

optimist.usage("ljs [options] file.js");

optimist.boolean("h").options("h", {
  alias: "help",
  describe: "Show brief help information",
});

optimist.boolean("v").options("v", {
  alias: "version",
  describe: "Display version information and exit.",
});

optimist.options("o", {
  alias: "output",
  describe: "Output file.",
});

optimist.boolean("c").options("c", {
  alias: "code",
  describe: "Include code in output file.",
  default: true,
});

function cli(argv) {
  var options = optimist.parse(argv);

  if (options.help) {
    console.log(optimist.help());
    return 0;
  }

  if (options.version) {
    var pkg = JSON.parse(fs.readFileSync(__dirname + "/../package.json"));
    console.log("jsgrep, part of jsstana version " + pkg.version);
    return 0;
  }

  if (options._.length !== 1) {
    console.error("Error: input file is required");
    console.log(optimist.help());
    return 0;
  }

  // Literate
  var filename = options._[0];
  var litContents;
  try {
    litContents = literate(filename, { code: options.code });
  } catch (e) {
    console.error("Error: while literating -- " + e.message);
    return 1;
  }

  // Output
  if (options.o) {
    fs.writeFileSync(options.o, litContents);
  } else {
    console.log(litContents);
  }
}

var ret = cli(process.argv.slice(2));
process.exit(ret);
```


## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality.
Lint and test your code using [Grunt](http://gruntjs.com/).
Make a pull request, but don't commit `README.md`!

## Release History

- 0.1.4 Usage as executable and library
  - run `ljs`
  - or `require("grunt-literate")(filename)`
- 0.1.3 Directives
- 0.1.2 Newline improvements
  - Newline at the end of comment
  - Only one newline at the end of generated file
- 0.1.1 Fix issue with unindenting
- 0.1.0 Initial release
## Related work

This task could be abused to do literate programming.
[Docco](http://jashkenas.github.io/docco/) is similar tool,
however *literate* is markup-language-agnostic.

## LICENSE

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

```js
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
```
