"use strict";

/**
  #### lib/literate.js

  This is the heart of this task. Check the file, if you're interested

  *NOTE* this is demo of `include` directive
*/

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
