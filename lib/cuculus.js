var PREVIOUS = Symbol('PREVIOUS');
var ON_RESTORE = Symbol('ON_RESTORE');

exports.drop = function(name) {
    try {
        path = require.resolve(name);
    } catch (err) {
        throw new Error('Could not drop non existing module "' + name + '"');
    }

    delete require.cache[path];
};

exports.replace = function(name, stub) {
    return exports.modify(name, function() {
        return stub;
    });
};

exports.modify = function(name, replacer) {
    var cached, original, path, cache,
        onRestore, stub;

    try {
        path = require.resolve(name);
    } catch (err) {
        throw new Error('Could not modify non existing module "' + name + '"');
    }

    // if module is not cached yet
    // try to require it
    if ( !(cached = require.cache[path]) ) {
        try {
            original = require(name);
            cached = require.cache[path];
        } catch (err) {
            throw new Error('Could not modify non existing module "' + name + '"');
        }
    } else {
        original = cached.exports;
    }

    onRestore = [];
    stub = replacer(original, function(fn) {
        if (typeof fn != "function") {
            throw new TypeError("Should be function");
        }

        onRestore.push(fn);
    });

    cache = {
        exports: stub == void 0 ? original : stub
    };
    cache[PREVIOUS] = cached || { exports: original };
    cache[ON_RESTORE] = onRestore;

    require.cache[path] = cache;

    return function() {
        exports.restore(name);
    };
};

exports.restore = function(name, steps) {
    steps = steps || -1;

    function makeRestore(count) {
        var cached, previous, path;

        if ( (count - steps) == 0 ) {
            return;
        }

        try {
            path = require.resolve(name);
        } catch (err) {
            throw new Error('Could not restore non existing module "' + name + '"');
        }

        if ( (cached = require.cache[path]) && (previous = cached[PREVIOUS]) ) {
            require.cache[path] = previous;

            cached[ON_RESTORE].forEach(function(fn) {
                fn.call(null);
            });

            // step on top
            makeRestore(count + 1);
        }
    }

    makeRestore(0);
};
