"use strict";

var lex = require("./lex.js");

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

function literate(contents, opts) {
  opts = opts || {};
  var code = opts.code || false;
  var codeOpen = opts.codeOpen || "\n```js\n";
  var codeClose = opts.codeClose || "\n```\n\n";

  var tokens = lex(contents);
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
    if (token.type === "Comment" && token.value.type === "Block" && token.value.value[0] === "*") {
      appendCode();

      // literate comment
      var comment = token.value;

      // block comment starting with /**
      var value = comment.value.slice(1).replace(whitespaceRe, "");

      var lines = value.split(/\n/);
      var first = find(lines, function (line) { return !isWhitespace(line); } );
      var indent = first ? whitespaceRe.exec(first)[1] : "";

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

      content += lines.join("\n");
    } else if (code) {
      // Code
      if (state !== "code") {
        state = "code";
        tmp = "";
      }

      tmp += contents.substr(token.range[0], token.range[1] - token.range[0]);
    }
  });

  // Append code at end of the file
  appendCode();

  return content;
}

module.exports = literate;
