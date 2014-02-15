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
