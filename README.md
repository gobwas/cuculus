#  [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]

> Simpliest require mocking

## Whats up

Hey there!

This is a simple module mocking tool for your super clever unit testing.

## Install

```sh
$ npm install --save-dev cuculus
```


## Usage

The simple case:

```js
    var cuculus = require("cuculus");

    cuculus.replace("fs", {
        writeFile: function(path, contents) {
            // ...
        }
    });

    // now fs is your object

    cuculus.restore("fs");

    // now fs is original
```

Or:

```js
    var cuculus = require("cuculus"),
        restorer;

    restorer = cuculus.replace("fs", {
        writeFile: function(path, contents) {
            // ...
        }
    });

    // now fs is your object

    restorer();

    // now fs is original
```

Complete case:

```js
var cuculus = require("cuculus");
// mocking library
// feel free to use your favorite
var sinon = require("sinon");

cuculus.modify("fs", function(fs, onRestore) {
    var stub;

    stub = sinon.stub(fs, "writeFile", function(path, contents) {
        // your actions here
    });

    // register restore middleware
    onRestore.push(stub.restore.bind(stub));

    return fs;
});

// your tests here

// and after all, or, between each test
cuculus.restore("fs");

// now fs is native and without stubs
```

## API

### cuculus.replace(name: string, stub: Any) : Function()

Complete replace the module named `name` with `stub`. Returns function, that
simple proxy to `cuculus.restore(name)`.

### cuculus.modify(name: string, replacer: Function(original: Any, onRestore: Function(fn: Function))) : Function()

Modifies original module with `replacer` function. If `replacer` modifies object, then `restore`
method will not restore the changes, until you not register the backupers with `onRestore` function.

## License

MIT © [Sergey Kamardin](https://github.com/gobwas)


[npm-image]: https://badge.fury.io/js/cuculus.svg
[npm-url]: https://npmjs.org/package/cuculus
[travis-image]: https://travis-ci.org/gobwas/cuculus.svg?branch=master
[travis-url]: https://travis-ci.org/gobwas/cuculus
[daviddm-image]: https://david-dm.org/gobwas/cuculus.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/gobwas/cuculus
