/* global require:false, exports:false */
/* jshint -W126 */

var R = require('ramda'),

    /**
     * Local reference for faster look-up
     * @see https://github.com/loop-recur/FunctionalJS/blob/master/functional.js/
     */
    slice = Array.prototype.slice,
    isArray = Array.isArray,

    parse = JSON.parse,
    stringify = JSON.stringify,


    logPreamble = exports.logPreamble =
        function (mod) {
            'use strict';
            var rqEssentialsModule = (mod) ? ('-' + mod) : '';
            return '[' + new Date().toISOString() + ' rq-essentials' + rqEssentialsModule + '] :: ';
        },


// TODO: Specify/Test those below

    /**
     * @see https://github.com/loop-recur/FunctionalJS/blob/master/functional.js/
     */
    toArray = exports.toArray =
        function (x) {
            'use strict';
            return slice.call(x);
        },


    /**
     * Deep cloning.
     * It is sometimes necessary to clone arguments due to occasional <code>Object.freeze()</code> in RQ.
     */
    clone = exports.clone =
        function (arg) {
            'use strict';
            if (!arg) {
                return arg;
            }
            if (isArray(arg)) {
                return arg.slice();
            }
            return parse(stringify(arg));
        },


    /**
     * @see http://fitzgen.github.com/wu.js/
     */
    curry = exports.curry =
        function (fn /* variadic number of args */) {
            'use strict';
            var args = slice.call(arguments, 1);
            return function () {
                return fn.apply(this, args.concat(toArray(arguments)));
            };
        },

/**
 * @see http://fitzgen.github.com/wu.js/
 */
//autoCurry = exports.autoCurry = function (fn, numArgs) {
//    'use strict';
//    numArgs = numArgs || fn.length;
//    var f = function () {
//        if (arguments.length < numArgs) {
//            return numArgs - arguments.length > 0 ?
//                autoCurry(curry.apply(this, [fn].concat(toArray(arguments))), numArgs - arguments.length) :
//                curry.apply(this, [fn].concat(toArray(arguments)));
//        }
//        return fn.apply(this, arguments);
//    };
//    f.toString = function () {
//        return fn.toString();
//    };
//    f.curried = true;
//    return f;
//},


/**
 * @see https://github.com/loop-recur/FunctionalJS/blob/master/functional.js/
 */
//decorateFunctionPrototypeWithAutoCurry =
//    (function () {
//        'use strict';
//        Function.prototype.autoCurry = function (n) {
//            return autoCurry(this, n);
//        };
//    })();


///////////////////////////////////////////////////////////////////////////////
// Predicate factories / higher-order functions
// Generic curry-friendly helper (higher order) functions
// TODO: Specify/Test these
// TODO: Find some decent third-party lib for these things ...
///////////////////////////////////////////////////////////////////////////////


    /** Higher-order exhausting negation */
    not = exports.not =
        function (condition) {
            'use strict';
            return function (args) {
                while (R.is(Function, condition)) {
                    condition = R.is(Function, condition) ? condition.call(this, args) : condition;
                }
                return !condition;
            };
        },

    /** Higher-order "isNumber" */
    isNumber = exports.isNumber =
        function (numberObj) {
            'use strict';
            return function () {
                return R.is(Number, numberObj);
            };
        },

    isHttpMethod = exports.isHttpMethod =
        function (httpMethod, request) {
            'use strict';
            return function () {
                return request && request.method && request.method === httpMethod;
            };
        },

    /**
     * Meant for serialized/over-the-wire-sent data ...
     */
    isMissing = exports.isMissing =
        function (valueOrArray) {
            'use strict';
            return function () {
                if (!valueOrArray && valueOrArray !== 0) {
                    return true;
                }
                return !!(R.is(String, valueOrArray) && valueOrArray.trim() === '');
            };
        },

    /**
     * Meant for runtime objects ...
     */
    isEmpty = exports.isEmpty =
        function (objectOrArray) {
            'use strict';
            return function () {
                if (R.isArrayLike(objectOrArray)) {
                    return objectOrArray.length < 1;
                }
                if (R.is(Object, objectOrArray)) {
                    return Object.keys(objectOrArray).length === 0;
                }
                return isMissing(objectOrArray)();
            };
        };
