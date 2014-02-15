## beautiful-docs

This package plays well with [beautiful-docs](http://beautifuldocs.com/) and [grunt-beautiful-docs](https://www.npmjs.org/package/grunt-beautiful-docs) especially.

Check [`Gruntfile.js`](https://github.com/phadej/grunt-literate/blob/master/Gruntfile.js) in the repository for an example.

### Getting started

Configure `literate` and `bfdocs` tasks:

```js
grunt.initConfig({
  literate: {
     "README.md": ["lib/*.js"]
  },
  bfdocs: {
    docs: {
      options: {
        title: "Grunt literate",
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
