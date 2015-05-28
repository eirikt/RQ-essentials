/* global require:false, exports:false, console:false */

var __ = require('underscore'),
    curry = require('./utils').curry,

///////////////////////////////////////////////////////////////////////////////
// Basic functions
///////////////////////////////////////////////////////////////////////////////

    /**
     * <hr style="border:0;height:1px;background:#333;background-image:-webkit-linear-gradient(left, #ccc, #333, #ccc);background-image:-moz-linear-gradient(left, #ccc, #333, #ccc);background-image:-ms-linear-gradient(left, #ccc, #333, #ccc);"/>
     * <p>
     * The identity function:
     * <pre>
     *     f(x) = x
     * </pre>
     * </p>
     * <hr style="border:0;height:1px;background:#333;background-image:-webkit-linear-gradient(left, #ccc, #333, #ccc);background-image:-moz-linear-gradient(left, #ccc, #333, #ccc);background-image:-ms-linear-gradient(left, #ccc, #333, #ccc);"/>
     *
     * @function
     * @param {*} value the argument that will be returned
     */
    identity = exports.identity =
        function (value) {
            'use strict';
            return value;
        },


///////////////////////////////////////////////////////////////////////////////
// Requestor factories
// - Takes arguments and returns a requestor function.
// ("Requestor factories" were previously called "requestories".)
//
// "Data generator requestors",
// ignoring incoming arguments and passes along their own original arguments.
///////////////////////////////////////////////////////////////////////////////

    /**
     * <p>
     * <pre>
     *     f(x) = F(callback(x))
     * </pre>
     * or
     * <pre>
     *     f(x) = F(callback(x()))
     * </pre>
     * </p>
     * <p>
     * A "data generator" requestor => No forwarding of existing data.
     * A typical parallel requestor, or as a starting requestor in a sequence ...
     * </p>
     */
    identityFactory = exports.return = exports.value =
        function (valueOrFunc) {
            'use strict';
            return function requestor(callback, args) {
                var retVal = __.isFunction(valueOrFunc) ? valueOrFunc.call(this) : valueOrFunc;
                return callback(retVal, undefined);
            };
        },


///////////////////////////////////////////////////////////////////////////////
// Requestor factories
// - Takes arguments and returns a requestor function.
// ("Requestor factories" were previously called "requestories".)
//
// "Data manipulator requestors",
// takes incoming arguments, manipulates them, and passes them along.
///////////////////////////////////////////////////////////////////////////////

    /**
     * The primary requestor factory:
     * <pre>
     *     f(g) = F(callback(g(x)))
     * </pre>
     *
     * A typical sequence requestor ...
     */
        // TODO: To be a pure function, the arguments have to be cloned/not mutated!
    failFastFunctionFactory = exports.requestorize = exports.requestor = exports.then = exports.do =
        function (g) {
            'use strict';
            return function requestor(callback, args) {
                return callback(g(args), undefined);
            };
        },


    /**
     * The more lenient requestor factory:
     * <pre>
     *     f(g) = F(callback(g(x)))
     * </pre>
     * Catching exceptions, logging them, and terminating execution of requestors.
     *
     * A typical sequence requestor ...
     */
    lenientFunctionFactory = exports.lenientRequestorize = exports.lenientRequestor =
        function (g) {
            'use strict';
            return function requestor(callback, args) {
                var result;
                try {
                    result = g(args);
                    return callback(result, undefined);

                } catch (e) {
                    console.error(e.message);
                    return callback(undefined, e);
                }
            };
        },


    /**
     * ...
     */
    propertyPickerFactory = exports.pick =
        function (propertyName) {
            'use strict';
            return function requestor(callback, args) {
                var propertyValue = args[propertyName],
                    retVal = __.isFunction(propertyValue) ? propertyValue.call(this) : propertyValue;
                return callback(retVal, undefined);
            };
        },


///////////////////////////////////////////////////////////////////////////////
// Requestor factories
// - Takes arguments and returns a requestor function.
// ("Requestor factories" were previously called "requestories".)
//
// "Data ignoring requestors",
// ignores incoming arguments, does other stuff, causes various side-effects.
///////////////////////////////////////////////////////////////////////////////


    /**
     * <p>
     * Execution of arbitrary function:
     * <pre>
     *     f(g) = g(); F(callback(x))
     * </pre>
     * </p>
     * <p>
     * The given function will be executed isolated from the requestor argument passing.
     * </p>
     */
    arbitraryFunctionExecutorFactory = exports.execute = exports.terminate =
        function (g) {
            'use strict';
            return function requestor(callback, args) {
                g.call(this, null);
                return callback(args, undefined);
            };
        },


    /**
     * <p>
     * Simple interceptor for execution of arbitrary function and argument:
     * <pre>
     *     f(g, y) = g(y); F(callback(x))
     * </pre>
     * </p>
     * <p>
     * The given function will be executed isolated from the requestor argument passing.
     * </p>
     */
    arbitraryFunctionAndArgumentExecutorFactory = exports.execArgs = exports.terminateArgs =
        function (g, y) {
            'use strict';
            return function requestor(callback, args) {
                g.call(this, y);
                return callback(args, undefined);
            };
        },


/**
 * <p>
 * <pre>
 *     f(g, y) = g(y); F(callback(x))
 * </pre>
 * </p>
 */
// Same as arbitraryFunctionExecutorFactory above ...
//terminatorRequestorFactory = exports.terminate =
//    function (callbackToInvoke, argsToBeInvokedWith) {
//        'use strict';
//        return function (callback, args) {
//            callbackToInvoke(argsToBeInvokedWith, undefined);
//            return callback(args, undefined);
//        };
//    },
//


    /**
     * Nice for stubbing requestor factories in tests.
     */
    noopFactory = exports.noopFactory =
        function () {
            'use strict';
            return function requestor(callback, args) {
                return callback(args, undefined);
            };
        },


///////////////////////////////////////////////////////////////////////////////
// Requestor factories
// - Takes arguments and returns a requestor function.
// ("Requestor factories" were previously called "requestories".)
//
// Other requestors,
// conditional execution, canellers, and such.
///////////////////////////////////////////////////////////////////////////////

    /**
     * ...
     */
    instrumentedConditionalFactory = exports.instrumentedCondition = exports.instrumentedIf =
        function (options, condition) {
            'use strict';
            return function requestor(callback, args) {
                if (condition.call(this, args)) {
                    if (options && options.success) {
                        console.log(options.name + ': ' + options.success);
                    }
                    return callback(args, undefined);
                }
                else {
                    if (options && options.failure) {
                        console.warn(options.name + ': ' + options.failure);
                    }
                    return callback(undefined, 'Condition not met');
                }
            };
        },


    /**
     * ...
     */
    conditionalFactory = exports.condition = exports.continueIf = exports.if =
        //function (condition) {
        //    'use strict';
        //    return function requestor(callback, args) {
        //        if (condition.call(this, args)) {
        //            return callback(args, undefined);
        //        } else {
        //            return callback(undefined, 'Condition not met');
        //        }
        //    };
        //},
        curry(instrumentedConditionalFactory, null),


    /**
     * ...
     */
    cancelFactory = exports.cancel =
        function (callbackToCancel, logMessage) {
            'use strict';
            return function requestor(callback, args) {
                callback(args, undefined);
                if (logMessage) {
                    console.error(logMessage);
                    return callbackToCancel(undefined, logMessage);
                } else {
                    return callbackToCancel(undefined, 'Callback cancelled');
                }
            };
        },


    /**
     * ...
     */
    errorFactory = exports.error =
        function (errorMessage) {
            'use strict';
            return function requestor(callback, args) {
                throw new Error(errorMessage);
            };
        },


///////////////////////////////////////////////////////////////////////////////
// Requestors
//
// Functions that executes requests, synchronously or asynchronously
// Asynchronicity is handled by callbacks.
// ("callbacks" were previously called "request continuations"/"requestions".)
//
// Standard 'canned' requestors below
///////////////////////////////////////////////////////////////////////////////

    /**
     * <hr style="border:0;height:1px;background:#333;background-image:-webkit-linear-gradient(left, #ccc, #333, #ccc);background-image:-moz-linear-gradient(left, #ccc, #333, #ccc);background-image:-ms-linear-gradient(left, #ccc, #333, #ccc);"/>
     * <p>
     * The requestor version of "the null function":
     * <pre>
     *     f(callback, x) = callback(undefined)
     * </pre>
     * </p>
     * <p>
     * <em>Aliases</em>
     * </p>
     * <p>
     * <ul>
     *     <li><code>undefined</code></li>
     * </ul>
     * </p>
     * <p>
     * A "data generator" requestor => No forwarding of incoming arguments/data.
     * A typical parallel requestor, or as a starting requestor in a sequence.
     * </p>
     * ...
     * <p>
     * <em>Usage examples</em>
     * </p>
     * <p>
     * <code>undefined</code> as argument to <code>myNextRequestor</code>:
     * <pre>
     *     var RQ = ('async-rq');
     *     var rq = ('rq-essentials');
     *
     *     RQ.sequence([
     *         rq.undefined,
     *         myNextRequestor,
     *         ...
     *     ])
     * </pre>
     * </p>
     * <hr style="border:0;height:1px;background:#333;background-image:-webkit-linear-gradient(left, #ccc, #333, #ccc);background-image:-moz-linear-gradient(left, #ccc, #333, #ccc);background-image:-ms-linear-gradient(left, #ccc, #333, #ccc);"/>
     *
     * @function
     */
    nullRequestor = exports.nullRequestor = exports.undefined =
        identityFactory(undefined),


    /**
     * The requestor version of "the empty function":
     * <pre>
     *     f(callback, x) = callback(null)
     * </pre>
     */
    emptyRequestor = exports.emptyRequestor = exports.empty = exports.null =
        identityFactory(null),


    /**
     * The tautology requestor:
     * <pre>
     *     f(callback, x) = callback(true)
     * </pre>
     */
    tautologyRequestor = exports.tautologyRequestor = exports.true =
        identityFactory(true),


    /**
     * The contradiction requestor:
     * <pre>
     *     f(callback, x) = callback(false)
     * </pre>
     */
    contradictionRequestor = exports.contradictionRequestor = exports.false =
        identityFactory(false),


    /**
     * The UNIX timestamp requestor:
     * <pre>
     *     f(callback, x) = callback(Date.now())
     * </pre>
     * Returning <code>Date.now()</code>, the number of milliseconds elapsed since 1 January 1970 00:00:00 UTC.
     */
    timestampRequestor = exports.timestampRequestor = exports.timestamp = exports.now =
        identityFactory(Date.now()),


    /**
     * The "new Date()" requestor:
     * <pre>
     *     f(callback, x) = callback(new Date())
     * </pre>
     */
    dateRequestor = exports.dateRequestor = exports.date =
        identityFactory(new Date()),


    /** @function */
    notImplemented = exports.notImplemented =
        errorFactory('Not yet implemented'),


    /**
     * The NOP/NOOP requestor:
     * <pre>
     *     f(callback, x) = callback(x)
     * </pre>
     *
     * Just pass things along without doing anything ...
     */
    noopRequestor = exports.noopRequestor = exports.noop =
        function (callback, args) {
            'use strict';
            return callback(args, undefined);
        },


///////////////////////////////////////////////////////////////////////////////
// More requestors, curry-friendly.
//
// Functions that executes requests, synchronously or asynchronously
// Asynchronicity is handled by callbacks.
// ("callbacks" were previously called "request continuations"/"requestions".)
///////////////////////////////////////////////////////////////////////////////

    /**
     * <pre>
     *     f(g, callback, x) = callback(g(x))
     * </pre>
     *
     * This is the curry-friendly version of the primary requestor factory below (with the alias 'then').
     * Especially handy when you have to curry the callback, e.g. when terminating nested requestor pipelines.
     *
     */
        // TODO: Do not feel I am quite on top of this one ... What does this function really mean?
    terminatorRequestor = exports.terminatorRequestor = exports.terminator =
        function (g, callback, args) {
            'use strict';
            return callback(g(args), undefined);
        },


    /**
     * <pre>
     *     f(g, y, callback, x) = callback(g(y))
     * </pre>
     *
     * This function hi-jacks the argument-passing by substituting the callback arguments with its own.
     */
        // TODO: Do not feel I am quite on top of this one ... What does this function really mean?
    interceptorRequestor = exports.interceptorRequestor = exports.interceptor =
        function (g, y, callback, args) {
            'use strict';

            // Argument 'y' may come from other requestors => cloning arguments due to Object.freeze() in RQ
            //return callback(g(_clone(y)));

            return callback(g(y), undefined);
        };
