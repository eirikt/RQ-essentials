/* global console:false, require:false, exports:false */
/* jshint -W126 */

var R = require('ramda'),
    utils = require('./utils'),

///////////////////////////////////////////////////////////////////////////////
// A generic cache (NB! Global)
///////////////////////////////////////////////////////////////////////////////

    _cache = exports._cache = {},

    /**
     * <p>
     * Write to cache:
     * <pre>
     *     f(key) = F(callback(x))
     * </pre>
     * </p>
     * <p>
     * This function is just a NOOP function -
     * with the side effect of writing the arg to the associative array cache object using the given cache key.
     * </p>
     */
    cacheWrite = exports.write =
        function (key) {
            'use strict';
            return function (callback, argsToBeCached) {
                _cache[key] = argsToBeCached;
                return callback(argsToBeCached, undefined);
            };
        },


    cacheSynchronousWrite = exports._synchronousWrite =
        function (key, value) {
            'use strict';
            _cache[key] = value;
        },


    /**
     * <p>
     * Read from cache:
     * <pre>
     *     f(key) = F(callback(cache[key]))
     * </pre>
     * </p>
     * <p>
     * This function hi-jacks the argument-passing by substituting the callback arguments with a previously cached variable.
     * </p>
     */
    cacheRead = exports.read =
        function (key) {
            'use strict';
            return function (callback, args) {
                return callback(_cache[key], undefined);
            };
        },

    cacheSynchronousRead = exports._synchronousRead =
        function (key) {
            'use strict';
            return _cache[key];
        },

    /**
     * <p>
     * Remove from cache:
     * </p>
     */
    cacheRemove = exports.remove =
        function (cacheKey) {
            'use strict';
            return function (callback, args) {
                delete _cache[cacheKey];
                return callback(args, undefined);
            };
        },

    cacheSynchronousRemove = exports._synchronousRemove =
        function (key) {
            'use strict';
            delete _cache[key];
        },

    addToObject = exports.addToObject =
        function (obj, key) {
            'use strict';
            var stringifiedObj,
                stringifiedKey,
                stringifiedArgs;//,
                //getLogMessagePreamble = function () {
                //    try {
                //        stringifiedObj = JSON.stringify(obj);
                //    } catch (e) {
                //        stringifiedObj = obj;
                //    }
                //    try {
                //        stringifiedKey = JSON.stringify(key);
                //    } catch (e) {
                //        stringifiedKey = obj;
                //    }
                //    return 'addToObject(' + stringifiedObj + ', \'' + stringifiedKey + '\') : ';
                //};
            return function (callback, args) {
                var errMsg;
                try {
                    stringifiedArgs = JSON.stringify(args);
                } catch (e) {
                    stringifiedArgs = args;
                }
                if (!(R.is(Object, obj))) {
                    //errMsg = getLogMessagePreamble() + 'No suitable holder object given';
                    errMsg = utils.logPreamble('caching') + 'No suitable holder object given';
                } else if (R.isArrayLike(obj)) {
                    //errMsg = getLogMessagePreamble() + 'Given holder object must be an object, not an array';
                    errMsg = utils.logPreamble('caching') + 'Given holder object must be an object, not an array';
                }

                if (!key) {
                    if (!errMsg) {
                        //errMsg = getLogMessagePreamble() + 'Missing key';
                        errMsg = utils.logPreamble('caching') + 'Missing key';
                    } else {
                        errMsg += ' - and key is missing as well ...';
                    }
                }

                if (errMsg) {
                    console.error(utils.logPreamble('caching') + errMsg);
                    return callback(undefined, errMsg);
                }

                obj[key.toString()] = args;
                //console.log(getLogMessagePreamble() + 'obj[' + stringifiedKey + ']=' + stringifiedArgs);
                console.log(utils.logPreamble('caching') + 'cache[\'' + key + '\'] stored');
                return callback(args, undefined);
            };
        },

    getFromObject = exports.getFromObject =
        function (obj, key) {
            'use strict';
            var stringifiedObj,
                stringifiedKey,
                stringifiedArgs,
                retVal;//,
                //getLogMessagePreamble = function () {
                //    try {
                //        stringifiedObj = JSON.stringify(obj);
                //    } catch (e) {
                //        stringifiedObj = obj;
                //    }
                //    try {
                //        stringifiedKey = JSON.stringify(key);
                //    } catch (e) {
                //        stringifiedKey = obj;
                //    }
                //    return 'addToObject(' + stringifiedObj + ', \'' + stringifiedKey + '\') : ';
                //};
            return function (callback, args) {
                var errMsg;
                try {
                    stringifiedArgs = JSON.stringify(args);
                } catch (e) {
                    stringifiedArgs = args;
                }
                if (!(R.is(Object, obj))) {
                    //errMsg = getLogMessagePreamble() + 'No suitable holder object given';
                    errMsg = utils.logPreamble('caching') + 'No suitable holder object given';
                } else if (R.isArrayLike(obj)) {
                    //errMsg = getLogMessagePreamble() + 'Given holder object must be an object, not an array';
                    errMsg = utils.logPreamble('caching') + 'Given holder object must be an object, not an array';
                }

                if (!key) {
                    if (!errMsg) {
                        //errMsg = getLogMessagePreamble() + 'Missing key';
                        errMsg = utils.logPreamble('caching') + 'Missing key';
                    } else {
                        errMsg += ' - and key is missing as well ...';
                    }
                }

                if (errMsg) {
                    console.error(utils.logPreamble('caching') + errMsg);
                    return callback(undefined, errMsg);
                }

                retVal = obj[key.toString()];
                //console.log(getLogMessagePreamble() + 'obj[' + stringifiedKey + ']=' + retVal);
                errMsg = utils.logPreamble('caching') + 'cache[\'' + key + '\']=' + JSON.stringify(retVal);
                return callback(retVal, undefined);
            };
        },


///////////////////////////////////////////////////////////////////////////////
// A stack (NB! Global)
///////////////////////////////////////////////////////////////////////////////

    _stack = exports._stack = [],

    _getStack = exports._getStack =
        function () {
            'use strict';
            return _stack;
        },

    _resetStack = exports._resetStack =
        function () {
            'use strict';
            _stack = [];
        },

    stackPush = exports.stackPush = exports.push =
        function (callback, args) {
            'use strict';
            _stack.push(args);
            return callback(args, undefined);
        },

    stackPop = exports.stackPop = exports.pop =
        function (callback, args) {
            'use strict';
            return callback(_stack.pop(), undefined);
        };
