/* global exports:false */

var

    /**
     * <p>
     * Write to cache.
     * </p>
     * <p>
     * This function is a noop function
     * with the side effect of writing the arg to the given cache object using the given cache key.
     * </p>
     */
    cacheWrite = exports.cacheWrite = function (cacheObject, cacheKey) {
        'use strict';
        return function (callback, argsToBeCached) {
            cacheObject[cacheKey] = argsToBeCached;
            return callback(argsToBeCached, undefined);
        };
    },

    /**
     * <p>
     * Read from cache:
     * <pre>
     *     f(cache, key) = F(callback(cache[key]))
     * </pre>
     * </p>
     * <p>
     * This function hi-jacks the argument-passing by substituting the callback arguments with a previously cached variable.
     * </p>
     */
    cacheRead = exports.cacheRead = function (cacheObject, cacheKey) {
        'use strict';
        return function (callback, args) {
            return callback(cacheObject[cacheKey], undefined);
        };
    };
