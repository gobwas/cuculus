var ORIGINAL = Symbol('ORIGINAL');
var ON_RESTORE = Symbol('ON_RESTORE');

exports.replace = function(name, stub) {
    return exports.modify(name, function() {
        return stub;
    });
};

exports.modify = function(name, replacer) {
    var cached, original, path, cache,
        onRestore;

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
        } catch (err) {
            throw new Error('Could not modify non existing module "' + name + '"');
        }
    } else {
        original = cached.exports;
    }

    onRestore = [];
    cache = {
        exports: replacer(original, function(fn) {
            if (typeof fn != "function") {
                throw new TypeError("Should be function");
            }

            onRestore.push(fn);
        })
    };
    cache[ORIGINAL] = original;
    cache[ON_RESTORE] = onRestore;

    require.cache[path] = cache;

    return function() {
        exports.restore(name);
    };
};

exports.restore = function(name) {
    var cached, original, path;

    try {
        path = require.resolve(name);
    } catch (err) {
        throw new Error('Could not restore non existing module "' + name + '"');
    }

    if ( (cached = require.cache[path]) && (original = cached[ORIGINAL]) ) {
        require.cache[path] = { exports: original };

        cached[ON_RESTORE].forEach(function(fn) {
            fn.call(null);
        });
    }
};
