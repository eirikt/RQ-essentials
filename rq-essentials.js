/* global exports:false, console:false */

var

///////////////////////////////////////////////////////////////////////////////
// Basic functions
///////////////////////////////////////////////////////////////////////////////

    /**
     * The identity function:
     * <pre>
     *     f(x) = x
     * </pre>
     *
     * Convenient for triggering execution of RQ's sequential requestors.
     *
     * @param {*} value the argument
     * @return {*} the given argument
     */
    identity = exports.identity = exports.execute = exports.go =
        function (value) {
            'use strict';
            return value;
        },


///////////////////////////////////////////////////////////////////////////////
// Requestors
//
// Functions that executes requests, synchronously or asynchronously
// Asynchronicity is handled by callbacks,
// or "request continuations"/"requestions" as they were previously named
//
// Standard 'canned' requestors below
///////////////////////////////////////////////////////////////////////////////

    /**
     * <p>
     * The requestor version of "the null function":
     * <pre>
     *     f(callback, x) = callback(undefined)
     * </pre>
     * </p>
     * <p>
     * A "data generator" requestor => No forwarding of existing data.
     * A typical parallel requestor, or as a starting requestor in a sequence ...
     * </p>
     * <p>
     * Usage example, <code>undefined</code> as argument to <code>myNextRequestor</code>:
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
     */
    nullRequestor = exports.undefined =
        function (callback, args) {
            'use strict';
            return callback(undefined, undefined);
        },


    /**
     * The requestor version of "the empty function":
     * <pre>
     *     f(callback, x) = callback(null)
     * </pre>
     *
     * A "data generator" requestor => No forwarding of existing data.
     * A typical parallel requestor, or as a starting requestor in a sequence ...
     */
    emptyRequestor = exports.empty = exports.null =
        function (callback, args) {
            'use strict';
            return callback(null, undefined);
        },


    /**
     * The tautology requestor:
     * <pre>
     *     f(callback, x) = callback(true)
     * </pre>
     *
     * A "data generator" requestor => No forwarding of existing data.
     * A typical parallel requestor, or as a starting requestor in a sequence ...
     */
    tautologyRequestor = exports.true =
        function (callback, args) {
            'use strict';
            return callback(true, undefined);
        },


    /**
     * The contradiction requestor:
     * <pre>
     *     f(callback, x) = callback(false)
     * </pre>
     *
     * A "data generator" requestor => No forwarding of existing data.
     * A typical parallel requestor, or as a starting requestor in a sequence ...
     */
    contradictionRequestor = exports.false =
        function (callback, args) {
            'use strict';
            return callback(false, undefined);
        },


    /**
     * The UNIX timestamp requestor:
     * <pre>
     *     f(callback, x) = callback(Date.now())
     * </pre>
     * Returning <code>Date.now()</code>, the number of milliseconds elapsed since 1 January 1970 00:00:00 UTC.
     *
     * A "data generator" requestor => No forwarding of existing data.
     * A typical parallel requestor, or as a starting requestor in a sequence ...
     */
    timestampRequestor = exports.timestamp = exports.now =
        function (callback, args) {
            'use strict';
            return callback(Date.now(), undefined);
        },


    /**
     * The "new Date()" requestor:
     * <pre>
     *     f(callback, x) = callback(new Date())
     * </pre>
     *
     * A "data generator" requestor => No forwarding of existing data.
     * A typical parallel requestor, or as a starting requestor in a sequence ...
     */
    dateRequestor = exports.date =
        function (callback, args) {
            'use strict';
            return callback(new Date(), undefined);
        },


    /**
     * The NOP/NOOP requestor:
     * <pre>
     *     f(callback, x) = callback(x)
     * </pre>
     *
     * Just pass things along without doing anything ...
     */
    noopRequestor = exports.noop =
        function (callback, args) {
            'use strict';
            return callback(args, undefined);
        },


    notImplemented = exports.notImplemented =
        function (callback, args) {
            'use strict';
            throw new Error('Not yet implemented');
        },


///////////////////////////////////////////////////////////////////////////////
// More requestors, curry-friendly.
//
// Functions that executes requests, synchronously or asynchronously
// Asynchronicity is handled by callbacks,
// or "request continuations"/"requestions" as they were previously named
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
    // TODO: Do not feel I am quite on top of this one ... What is it really!?
    terminatorRequestor = exports.terminator =
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
        // TODO: Do not feel I am quite on top of this one ... What is it really!?
    interceptorRequestor = exports.interceptor =
        function (g, y, callback, args) {
            'use strict';

            // Argument 'y' may come from other requestors => cloning arguments due to Object.freeze() in RQ
            //return callback(g(_clone(y)));

            return callback(g(y), undefined);
        },


///////////////////////////////////////////////////////////////////////////////
// Requestor factories, or "requestories" as they were previously named
// - Takes arguments and returns a requestor function
///////////////////////////////////////////////////////////////////////////////

    /**
     * <pre>
     *     f(x) = F(callback(x))
     * </pre>
     *
     * A "data generator" requestor => No forwarding of existing data.
     * A typical parallel requestor, or as a starting requestor in a sequence ...
     */
    identityFactory = exports.return = exports.value =
        function (value) {
            'use strict';
            return function requestor(callback, args) {
                return callback(value, undefined);
            };
        },


    conditionalFactory = exports.condition = exports.if =
        function (condition) {
            'use strict';
            return function requestor(callback, args) {
                //if (condition.call(this, args)) {
                if (condition(args)) {
                    return callback(args, undefined);
                } else {
                    return callback(undefined, 'Condition not met');
                }
            };
        },


    instrumentedConditionalFactory = exports.instrumentedCondition = exports.instrumentedIf =
        function (condition, options) {
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


    arbitraryFunctionExecutor = exports.exec =
        function (g) {
            'use strict';
            return function requestor(callback, args) {
                g();
                return callback(args, undefined);
            };
        },


    /**
     * The primary requestor factory:
     * <pre>
     *     f(g) = F(callback(g(x)))
     * </pre>
     *
     * A typical sequence requestor ...
     */
    failFastFunctionFactory = exports.requestorize = exports.requestor = exports.then = exports.do =
        function (g) {
            'use strict';
            return function requestor(callback, args) {
                return callback(g(args), undefined);
            };
        },

    terminator2Requestor = exports.terminator2 =
        function (callback, args) {
            'use strict';
            return function (callback2, args2) {
                callback(args, undefined);
                return callback2(args2, undefined);
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
        };
