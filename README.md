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


#### lib/literate.js

This is the heart of this task. Check the file, if you're interested

*NOTE* this is demo of `include` directive


## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality.
Lint and test your code using [Grunt](http://gruntjs.com/).
Make a pull request, but don't commit `README.md`!

## Release History

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
