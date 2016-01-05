/* global require:false, exports:false, console:false */
/* jshint -W024 */

var R = require('ramda'),
    utils = require('./utils'),
    curry = utils.curry,
    isArray = Array.isArray,

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
     * @param {*} x the object that will be returned
     */
    identity = exports.identity =
        function (x) {
            'use strict';
            return x;
        },


///////////////////////////////////////////////////////////////////////////////
// Requestor factories
// - Takes arguments and returns a requestor function.
// ("Requestor factories" were previously called "requestories".)
//
// "Data-generating requestors";
// always ignores incoming arguments, and passes along their own original arguments.
//
// "Data-generating requestors" ignores incoming arguments, and produces outgoing arguments by other means.
// E.g. like here, with a explicitly provided value/function.
//
// A "data generator" requestor => No forwarding of incoming arguments/data.
// A typical parallel requestor, or as a starting requestor in a sequence.
//
///////////////////////////////////////////////////////////////////////////////

    /**
     * <hr style="border:0;height:1px;background:#333;background-image:-webkit-linear-gradient(left, #ccc, #333, #ccc);background-image:-moz-linear-gradient(left, #ccc, #333, #ccc);background-image:-ms-linear-gradient(left, #ccc, #333, #ccc);"/>
     * <p>
     * <pre>
     *     f(x) = R(callback(x))
     * </pre>
     * or
     * <pre>
     *     f(x) = R(callback(x()))
     * </pre>
     * if the provided argument is a function.
     * </p>
     * <p>
     * <em>Aliases</em>
     * </p>
     * <p>
     * <ul>
     *     <li><code>value</code></li>
     *     <li><code>return</code></li>
     *     <li><code>continueWith</code></li>
     * </ul>
     * </p>
     * <p>
     * <em>Usage examples</em>
     * </p>
     * <p>
     * <em>π</em> (pi) as argument to <code>myNextRequestor</code>:
     * <pre>
     *     var RQ = ('async-rq'),
     *         rq = ('rq-essentials');
     *
     *     RQ.sequence([
     *         rq.value(Math.PI),
     *         myNextRequestor,
     *         ...
     *     ]);
     * </pre>
     * </p>
     * <p>
     * Random numbers as arguments to <code>myNextRequestor</code>:
     * <pre>
     *     var RQ = ('async-rq'),
     *         rq = ('rq-essentials');
     *
     *     RQ.sequence([
     *         RQ.parallel([
     *             rq.value(Math.random),
     *             rq.value(Math.random),
     *             rq.value(Math.random),
     *             rq.value(Math.random)
     *         ]),
     *         myNextRequestor,
     *         ...
     *     ]);
     * </pre>
     * </p>
     * <p>
     * Extra/bonus feature: Including callback argument in string values:
     * <pre>
     *     var RQ = ('async-rq'),
     *         rq = ('rq-essentials');
     *
     *     RQ.sequence([
     *         rq.value(Math.random),
     *         rq.value('Sending the random number $(args) to the next requestor'),
     *         myNextRequestor,
     *         ...
     *     ]);
     * </pre>
     * </p>
     * <hr style="border:0;height:1px;background:#333;background-image:-webkit-linear-gradient(left, #ccc, #333, #ccc);background-image:-moz-linear-gradient(left, #ccc, #333, #ccc);background-image:-ms-linear-gradient(left, #ccc, #333, #ccc);"/>
     *
     * @function
     * @param {*} x a value or function, being or producing the argument that will be returned
     */
    identityFactory = exports.value = exports.return = exports.continueWith =
        function (x) {
            'use strict';
            return function requestor(callback, args) {
                var retVal = R.is(Function, x) ? x.call(this) : x,

                    hasValue = R.not(R.isNil(retVal)),
                    isStringValue = R.is(String, retVal),
                    hasPlaceholder,
                    indexOfPlaceholderStart, indexOfPlaceholderEnd,
                    logMessageBeforeArgs, logMessageAfterArgs;

                if (!hasValue || !isStringValue || !args) {
                    return callback(retVal, undefined);
                }

                // Hack: support for $() placeholder (when x is of string type) 
                hasPlaceholder = retVal.indexOf('$') > 0;
                if (!hasPlaceholder) {
                    return callback(retVal, undefined);
                }
                indexOfPlaceholderStart = retVal.indexOf('$');
                indexOfPlaceholderEnd = retVal.indexOf('}');
                logMessageBeforeArgs = retVal.substring(0, indexOfPlaceholderStart);
                logMessageAfterArgs = retVal.substring(indexOfPlaceholderEnd + 1);

                retVal = logMessageBeforeArgs + JSON.stringify(args) + logMessageAfterArgs;
                // /Hack

                return callback(retVal, undefined);
            };
        },


///////////////////////////////////////////////////////////////////////////////
// Requestor factories
// - Takes arguments and returns a requestor function.
// ("Requestor factories" were previously called "requestories".)
//
// "Data-manipulating requestors";
// takes incoming arguments, utilizes them somehow, maybe manipulates them - before passing them along.
//
///////////////////////////////////////////////////////////////////////////////

    /**
     * <hr style="border:0;height:1px;background:#333;background-image:-webkit-linear-gradient(left, #ccc, #333, #ccc);background-image:-moz-linear-gradient(left, #ccc, #333, #ccc);background-image:-ms-linear-gradient(left, #ccc, #333, #ccc);"/>
     * <p>
     * The primary requestor factory:
     * <pre>
     *     f(g) = R(callback(g(x)))
     * </pre>
     * </p>
     * <p>
     * <em>Aliases</em>
     * </p>
     * <p>
     * <ul>
     *     <li><code>requestorize</code></li>
     *     <li><code>then</code></li>
     *     <li><code>do</code></li>
     * </ul>
     * </p>
     * <p>
     * <strong>
     * This requestor factory does not protect/seal/clone incoming arguments in any way.
     * That is the callback function's responsibility!
     * </strong>
     * </p>
     * <p>
     * <em>Usage examples</em>
     * </p>
     * <p>
     * Transforming a by-value number argument to its rounded version:
     * <pre>
     *     var RQ = ('async-rq'),
     *         rq = ('rq-essentials');
     *
     *     RQ.sequence([
     *         ...
     *         rq.then(Math.round),
     *         ...
     *     ]);
     * </pre>
     * </p>
     * <p>
     * Transforming a by-reference object argument:
     * <pre>
     *     var RQ = ('async-rq'),
     *         rq = ('rq-essentials'),
     *
     *         obj = {
     *             val: 13.49
     *         },
     *         mutatingAdder = function (obj) { // NB! Mutates incoming arguments
     *             obj.val += 1;
     *             return obj;
     *         },
     *         pureAdder = function (obj) {
     *             var newObj = clone(obj);
     *             newObj.val += 1;
     *             return newObj;
     *         };
     *
     *     RQ.sequence([
     *         rq.value(obj),
     *         rq.then(pureAdder),
     *         ...
     *     ]);
     * </pre>
     * </p>
     * <hr style="border:0;height:1px;background:#333;background-image:-webkit-linear-gradient(left, #ccc, #333, #ccc);background-image:-moz-linear-gradient(left, #ccc, #333, #ccc);background-image:-ms-linear-gradient(left, #ccc, #333, #ccc);"/>
     *
     * @function
     * @param {*} g a function which is applied to the arguments
     */
    requestorFactory = exports.requestorize = exports.then = exports.do =
        function (g) {
            'use strict';
            return function requestor(callback, args) {
                return callback(g(args), undefined);
            };
        },


    /**
     * <hr style="border:0;height:1px;background:#333;background-image:-webkit-linear-gradient(left, #ccc, #333, #ccc);background-image:-moz-linear-gradient(left, #ccc, #333, #ccc);background-image:-ms-linear-gradient(left, #ccc, #333, #ccc);"/>
     * <p>
     * The more lenient requestor factory.
     * The execution of the requestor is wrapped in a try-catch block.
     * If an exception is thrown, its error message is written to <code>console.error</code>,
     * and the requestor fails, halting further execution of the requestor chain.
     * </p>
     * <p>
     * <em>Aliases</em>
     * </p>
     * <p>
     * <ul>
     *     <li><code>lenientRequestorize</code></li>
     *     <li><code>lrequestorize</code></li>
     *     <li><code>lthen</code></li>
     *     <li><code>ldo</code></li>
     * </ul>
     * </p>
     * <p>
     * This factory creates "<em>data manipulator requestors</em>".
     * </p>
     * <hr style="border:0;height:1px;background:#333;background-image:-webkit-linear-gradient(left, #ccc, #333, #ccc);background-image:-moz-linear-gradient(left, #ccc, #333, #ccc);background-image:-ms-linear-gradient(left, #ccc, #333, #ccc);"/>
     *
     * @function
     * @param {*} g a function which is applied to the arguments
     */
    lenientRequestorFactory = exports.lenientRequestorize = exports.lrequestorize = exports.lthen = exports.ldo =
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


    propertyPickerFactory = exports.pick =
        function factory(propertyName) {
            'use strict';
            return function requestor(callback, args) {
                var propertyValue;
                if (R.not(R.isNil(args))) {
                    if (isArray(args)) {
                        propertyValue = R.map(R.prop(propertyName), args);
                    } else {
                        propertyValue = R.prop(propertyName, args);
                    }
                }
                return callback(propertyValue, undefined);
            };
        },


///////////////////////////////////////////////////////////////////////////////
// Requestor factories
// - Takes arguments and returns a requestor function.
// ("Requestor factories" were previously called "requestories".)
//
// "Data-ignoring requestors",
// ignores incoming arguments, does other stuff, causes various side-effects.
//
///////////////////////////////////////////////////////////////////////////////


    /**
     * <p>
     * Execution of arbitrary function:
     * <pre>
     *     f(g) = g(); R(callback(x))
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
     *     f(g, y) = g(y); R(callback(x))
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
 *     f(g, y) = g(y); R(callback(x))
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


///////////////////////////////////////////////////////////////////////////////
// Requestor factories
// - Takes arguments and returns a requestor function.
// ("Requestor factories" were previously called "requestories".)
//
// Other requestors;
// conditional execution, cancellers, and such.
///////////////////////////////////////////////////////////////////////////////

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


    waitFactory = exports.wait =
        function (suspensionPeriodInMilliseconds) {
            'use strict';
            return function requestor(callback, args) {
                setTimeout(function () {
                    callback(args, undefined);
                }, suspensionPeriodInMilliseconds);
            };
        },


// TODO: Specify/Test this one
    instrumentedConditionalFactory = exports.instrumentedCondition = exports.instrumentedIf =
        function (options, condition) {
            'use strict';
            return function requestor(callback, args) {
                // TODO: Suspicious recursive invocation of condition argument ... What does it really mean?
                while (R.is(Function, condition)) {
                    condition = R.is(Function, condition) ? condition.call(this, args) : condition;
                }
                if (condition) {
                    if (options && options.success) {
                        console.log(options.name + ': ' + options.success);
                    }
                    return callback(args, undefined);

                } else {
                    if (options && options.failure) {
                        console.warn(options.name + ': ' + options.failure);
                    }
                    return callback(undefined, 'Condition not met');
                }
            };
        },


    conditionalFactory = exports.condition = exports.continueIf = exports.if =
        curry(instrumentedConditionalFactory, null),


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
     * The <em>"nothingness"</em> requestor:
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
     * <em>Usage examples</em>
     * </p>
     * <p>
     * <code>undefined</code> as argument to <code>myNextRequestor</code>:
     * <pre>
     *     var RQ = ('async-rq'),
     *         rq = ('rq-essentials');
     *
     *     RQ.sequence([
     *         rq.undefined,
     *         myNextRequestor,
     *         ...
     *     ]);
     * </pre>
     * </p>
     * <hr style="border:0;height:1px;background:#333;background-image:-webkit-linear-gradient(left, #ccc, #333, #ccc);background-image:-moz-linear-gradient(left, #ccc, #333, #ccc);background-image:-ms-linear-gradient(left, #ccc, #333, #ccc);"/>
     *
     * @function
     */
    nothingRequestor = exports.nothingRequestor = exports.undefined = exports.unit =
        identityFactory(undefined),


    /**
     * The <em>empty function</em> requestor:
     * <pre>
     *     f(callback, x) = callback(null)
     * </pre>
     */
    emptyRequestor = exports.emptyRequestor = exports.empty = exports.null =
        identityFactory(null),


    /**
     * The <em>tautology</em> requestor:
     * <pre>
     *     f(callback, x) = callback(true)
     * </pre>
     */
    tautologyRequestor = exports.tautologyRequestor = exports.true =
        identityFactory(true),


    /**
     * The <em>contradiction</em> requestor:
     * <pre>
     *     f(callback, x) = callback(false)
     * </pre>
     */
    contradictionRequestor = exports.contradictionRequestor = exports.false =
        identityFactory(false),


    /**
     * The <em>UNIX timestamp</em> requestor:
     * <pre>
     *     f(callback, x) = callback(Date.now())
     * </pre>
     * Returning <code>Date.now()</code>, the number of milliseconds elapsed since 1 January 1970 00:00:00 UTC.
     */
    timestampRequestor = exports.timestampRequestor = exports.timestamp = exports.now =
        // TODO: This does not work, does it!?
        //identityFactory(Date.now()),

        identityFactory(Date.now),


    /**
     * The <em>"today"</em> requestor:
     * <pre>
     *     f(callback, x) = callback(new Date())
     * </pre>
     */
    // TODO: This does not work, does it!?
    //dateRequestor = exports.dateRequestor = exports.date =
    //    identityFactory(new Date()),


    /**
     * <hr style="border:0;height:1px;background:#333;background-image:-webkit-linear-gradient(left, #ccc, #333, #ccc);background-image:-moz-linear-gradient(left, #ccc, #333, #ccc);background-image:-ms-linear-gradient(left, #ccc, #333, #ccc);"/>
     * <p>
     * This is an alternative way of setting status code on the response - let the end-trigger/handler take care of it ...
     * </p>
     * ...
     * <p>
     * <em>Usage examples</em>
     * </p>
     * <p>
     * Letting the end-trigger/handler take care of HTTP response status code - if not timing out after 2 seconds, that is.
     * <pre>
     *     var RQ = ('async-rq'),
     *         rq = ('rq-essentials');
     *
     *     RQ.sequence([
     *         rq.notImplemented
     *     ], 2000)(rq.handleTimeoutAndStatusCode(request, response)); // => HTTP Response 501
     * </pre>
     * </p>
     * <hr style="border:0;height:1px;background:#333;background-image:-webkit-linear-gradient(left, #ccc, #333, #ccc);background-image:-moz-linear-gradient(left, #ccc, #333, #ccc);background-image:-ms-linear-gradient(left, #ccc, #333, #ccc);"/>
     *
     * @function
     */
    notImplemented = exports.notImplemented =
        function requestor(callback, args) {
            'use strict';
            return callback(undefined, 501);
        },


    /**
     * <hr style="border:0;height:1px;background:#333;background-image:-webkit-linear-gradient(left, #ccc, #333, #ccc);background-image:-moz-linear-gradient(left, #ccc, #333, #ccc);background-image:-ms-linear-gradient(left, #ccc, #333, #ccc);"/>
     * <p>
     * The <em>no operation (NOP/NOOP)</em> requestor:
     * <pre>
     *     f(callback, x) = callback(x)
     * </pre>
     *
     * Just pass things along without doing anything ...<br/>
     * Also known as <em>the null function</em>.
     * </p>
     * <hr style="border:0;height:1px;background:#333;background-image:-webkit-linear-gradient(left, #ccc, #333, #ccc);background-image:-moz-linear-gradient(left, #ccc, #333, #ccc);background-image:-ms-linear-gradient(left, #ccc, #333, #ccc);"/>
     *
     * @function
     */
    noopRequestor = exports.noopRequestor = exports.noop =
        function (callback, args) {
            'use strict';
            return callback(args, undefined);
        },


///////////////////////////////////////////////////////////////////////////////
// More requestor factories
// The requestors must be configured by currying.
//
// Functions that executes requests, synchronously or asynchronously
// Asynchronicity is handled by callbacks.
// ("callbacks" were previously called "request continuations"/"requestions".)
//
///////////////////////////////////////////////////////////////////////////////

    /**
     * <hr style="border:0;height:1px;background:#333;background-image:-webkit-linear-gradient(left, #ccc, #333, #ccc);background-image:-moz-linear-gradient(left, #ccc, #333, #ccc);background-image:-ms-linear-gradient(left, #ccc, #333, #ccc);"/>
     * <p>
     * This is the curry-friendly version of the primary requestor factory above (the one with the alias 'then').
     * Especially handy when you have to curry the callback, e.g. when terminating nested requestor chains.
     * <pre>
     *     f(g, callback, x) = callback(g(x))
     * </pre>
     * </p>
     * <p>
     * <strong>
     * <em>NB! alpha version</em>&nbsp;&ndash;&nbsp;This function has not been settled, neither the name nor the meaning/semantics of it ...
     * </strong>
     * </p>
     * <hr style="border:0;height:1px;background:#333;background-image:-webkit-linear-gradient(left, #ccc, #333, #ccc);background-image:-moz-linear-gradient(left, #ccc, #333, #ccc);background-image:-ms-linear-gradient(left, #ccc, #333, #ccc);"/>
     */
        // TODO: Do not feel I am quite on top of this one ... What does this function really mean?
    terminatorRequestor = exports.terminatorRequestor = exports.terminator =
        function (g, callback, args) {
            'use strict';
            return callback(g(args), undefined);
        },


    /**
     * <hr style="border:0;height:1px;background:#333;background-image:-webkit-linear-gradient(left, #ccc, #333, #ccc);background-image:-moz-linear-gradient(left, #ccc, #333, #ccc);background-image:-ms-linear-gradient(left, #ccc, #333, #ccc);"/>
     * <p>
     * This function hi-jacks the argument-passing by substituting the callback arguments with its own.
     * <pre>
     *     f(g, y, callback, x) = callback(g(y))
     * </pre>
     * </p>
     * <p>
     * <strong>
     * <em>NB! alpha version</em>&nbsp;&ndash;&nbsp;This function has not been settled, neither the name nor the meaning/semantics of it ...
     * </strong>
     * </p>
     * <hr style="border:0;height:1px;background:#333;background-image:-webkit-linear-gradient(left, #ccc, #333, #ccc);background-image:-moz-linear-gradient(left, #ccc, #333, #ccc);background-image:-ms-linear-gradient(left, #ccc, #333, #ccc);"/>
     */
        // TODO: Do not feel I am quite on top of this one ... What does this function really mean?
    interceptorRequestor = exports.interceptorRequestor = exports.interceptor =
        function (g, y, callback, args) {
            'use strict';

            // Argument 'y' may come from other requestors => cloning arguments due to Object.freeze() in RQ
            //return callback(g(_clone(y)));

            return callback(g(y), undefined);
        },


///////////////////////////////////////////////////////////////////////////////
// Handlers and instigators.

// RQ requestor chains need an initial callback function to start executing.
// This callback function also acts as a handler completed requestor chains.
// The callback function has two arguments: <code>success</code> and <code> failure</code>,
// handling both successful executions and failures, e.g. timeouts.
//
///////////////////////////////////////////////////////////////////////////////

    /**
     * <hr style="border:0;height:1px;background:#333;background-image:-webkit-linear-gradient(left, #ccc, #333, #ccc);background-image:-moz-linear-gradient(left, #ccc, #333, #ccc);background-image:-ms-linear-gradient(left, #ccc, #333, #ccc);"/>
     * <p>
     * The identity function as a vanilla requestor chain executor/handler.
     * </p>
     * <p>
     * <em>Aliases</em>
     * </p>
     * <p>
     * <ul>
     *     <li><code>run</code></li>
     *     <li><code>go</code></li>
     * </ul>
     * </p>
     * ...
     * <p>
     * <em>Usage examples</em>
     * </p>
     * <p>
     * Convenient for triggering execution of RQ requestor chains:
     * <pre>
     *     var RQ = ('async-rq'),
     *         rq = ('rq-essentials'),
     *         run = rq.run;
     *
     *     RQ.sequence([
     *         myRequestor,
     *         myNextRequestor,
     *         ...
     *     ])(run)
     * </pre>
     * </p>
     * <hr style="border:0;height:1px;background:#333;background-image:-webkit-linear-gradient(left, #ccc, #333, #ccc);background-image:-moz-linear-gradient(left, #ccc, #333, #ccc);background-image:-ms-linear-gradient(left, #ccc, #333, #ccc);"/>
     *
     * @function
     */
    vanillaExecutor = exports.vanillaExecutor = exports.run = exports.go =
        identity;
