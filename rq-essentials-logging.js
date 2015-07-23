/* global require:false, JSON:false */

var __ = require('underscore'),
    RQ = require('async-rq'),
    rq = require('./rq-essentials'),

    loggerFactory = exports.loggerFactory =
        function () {
            'use strict';

            var logArgument = arguments[0],

                hasLogArgument = !__.isUndefined(logArgument),
                isObjectLogArgument = __.isObject(logArgument),
                hasPlaceholder = hasLogArgument && !isObjectLogArgument && logArgument.indexOf('$') > 0,
                indexOfPlaceholderStart, indexOfPlaceholderEnd,
                logMessageBeforeArgs, logMessageAfterArgs;

            if (!hasLogArgument) {
                return function requestor(callback, args) {
                    logArgument = args;
                    isObjectLogArgument = __.isObject(logArgument);
                    if (isObjectLogArgument) {
                        logArgument = JSON.stringify(logArgument);
                    }
                    console.log(args);
                    callback(args);
                };
            }

            if (!hasPlaceholder) {
                if (isObjectLogArgument) {
                    logArgument = JSON.stringify(logArgument);
                }
                return function requestor(callback, args) {
                    console.log(logArgument);
                    callback(args);
                };
            }

            indexOfPlaceholderStart = logArgument.indexOf('$');
            indexOfPlaceholderEnd = logArgument.indexOf('}');
            logMessageBeforeArgs = logArgument.substring(0, indexOfPlaceholderStart);
            logMessageAfterArgs = logArgument.substring(indexOfPlaceholderEnd + 1);
            return function requestor(callback, args) {
                logArgument = args;
                isObjectLogArgument = __.isObject(logArgument);
                if (isObjectLogArgument) {
                    logArgument = JSON.stringify(logArgument);
                }
                console.log(logMessageBeforeArgs + logArgument + logMessageAfterArgs);
                callback(args);
            };
        };
