/* global exports:false, JSON:false */
/* jshint -W121, -W126 */

var
    /**
     * Local reference for faster look-up
     * @see https://github.com/loop-recur/FunctionalJS/blob/master/functional.js/
     */
    slice = Array.prototype.slice,
    map = Array.prototype.map,
    parse = JSON.parse,
    stringify = JSON.stringify,

    isString = exports.isString = function (obj) {
        'use strict';
        return typeof obj === 'string' || obj instanceof String;
    },

    isNumber = exports.isNumber = function (obj) {
        'use strict';
        throw new Error('not yet implemented');
    },

    isDate = exports.isDate = function (obj) {
        'use strict';
        throw new Error('not yet implemented');
    },

    isFunction = exports.isFunction = function (obj) {
        'use strict';
        return obj && Object.prototype.toString.call(obj) === '[object Function]';
    },

    isArray = exports.isArray = Array.isArray || function (obj) {
            'use strict';
            return Object.prototype.toString.call(obj) === '[object Array]';
        },

    /**
     * @see https://github.com/loop-recur/FunctionalJS/blob/master/functional.js/
     */
    toArray = exports.toArray = function (x) {
        'use strict';
        return _slice.call(x);
    },

    /**
     * Deep cloning.
     * Sometimes necessary to clone arguments due to occasional <code>Object.freeze()</code> in RQ.
     */
    clone = exports.clone =
        function (arg) {
            'use strict';
            if (!arg) {
                return arg;
            }
            if (_isArray(arg)) {
                return arg.slice();
            }
            return _parse(_stringify(arg));
        },

    /**
     * @see http://fitzgen.github.com/wu.js/
     */
    curry = exports.curry = function (fn /* variadic number of args */) {
        'use strict';
        var args = _slice.call(arguments, 1);
        return function () {
            return fn.apply(this, args.concat(_toArray(arguments)));
        };
    },

    /**
     * @see http://fitzgen.github.com/wu.js/
     */
    autoCurry = exports.autoCurry = function (fn, numArgs) {
        'use strict';
        numArgs = numArgs || fn.length;
        var f = function () {
            if (arguments.length < numArgs) {
                return numArgs - arguments.length > 0 ?
                    _autoCurry(_curry.apply(this, [fn].concat(_toArray(arguments))), numArgs - arguments.length) :
                    _curry.apply(this, [fn].concat(_toArray(arguments)));
            }
            return fn.apply(this, arguments);
        };
        f.toString = function () {
            return fn.toString();
        };
        f.curried = true;
        return f;
    },

    /**
     * @see https://github.com/loop-recur/FunctionalJS/blob/master/functional.js/
     */
    decorateFunctionPrototypeWithAutoCurry = (function () {
        'use strict';
        Function.prototype.autoCurry = function (n) {
            return _autoCurry(this, n);
        };
    })();
