
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



```js
"use strict";
```

#### lib/literate.js

This is the heart of this task. Check the file, if you're interested

*NOTE* this is demo of `include` directive


```js
var lex = require("./lex.js");
var fs = require("fs");
var path = require("path");
var assert = require("assert");

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

function getTokens(filename) {
  var contents = fs.readFileSync(filename).toString();
  var tokens = lex(contents);
  var m, value, includename;

  var resTokens = [];
  tokens.forEach(function (token) {
    if (token.type === "Comment" && token.value.type === "Line" && token.value.value[0] === "/") {
      value = token.value.value.substr(1);
      m = value.match(/^\s*plain\s+(.*?)\s*$/);
      if (m) {
        includename = path.join(path.dirname(filename), m[1]);
        resTokens.push({
          type: "Plain",
          value: fs.readFileSync(includename).toString(),
        });
        return;
      }

      m = value.match(/^\s*include\s+(.*?)\s*$/);
      if (m) {
        includename = path.join(path.dirname(filename), m[1]);
        resTokens = resTokens.concat(getTokens(includename));
        return;
      }

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


## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality.
Lint and test your code using [Grunt](http://gruntjs.com/).
Make a pull request, but don't commit `README.md`!

## Release History

- 0.1.2 Newline improvements
  - Newline at the end of comment
  - Only one newline at the end of generated file
- 0.1.1 Fix issue with unindenting
- 0.1.0 Initial release

## Related work

This task could be abused to do literate programming.
[Docco](http://jashkenas.github.io/docco/) is similar tool,
however *literate* is markup-language-agnostic.

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
