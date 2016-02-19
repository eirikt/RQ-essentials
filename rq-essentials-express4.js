/* global require:false, exports:false, console:false, JSON:false */
/* jshint -W024 */

var R = require('ramda'),
    httpResponse = require('statuses'),
    RQ = require('async-rq'),
    rq = require('./rq-essentials'),
    utils = require('./utils'),
    not = utils.not,
    isMissing = utils.isMissing,
    isEmpty = utils.isEmpty,
    isHttpMethod = utils.isHttpMethod,
    isNumber = utils.isNumber,
    curry = utils.curry,

// TODO: Document ...
    /**
     * ...
     *
     * Charset will by default be set to UTF-8.
     * Content Type will by default be set to 'application/json'.
     */
    dispatchResponseStatusCode = exports.dispatchResponseStatusCode =
        function (doLog, statusCode, response) {
            'use strict';
            return function requestor(callback, args) {
                if (doLog) {
                    console.log('RQ-essentials-express4 :: HTTP Response status code ' + statusCode);
                }
                if (response.finished) {
                    console.warn('RQ-essentials-express4 :: Response is already sent with status code ' + response.statusCode + ". Check your requestor setup!");
                    return callback(args, undefined);
                }
                response.sendStatus(statusCode);
                return callback(args, undefined);
            };
        },


// TODO: Document ...
    /**
     * Include the complete requestor argument as response body as is.
     *
     * Charset will by default be set to UTF-8.
     * Content Type will by default be set to 'application/json'.
     */
    dispatchResponseWithScalarBody = exports.dispatchResponseWithScalarBody =
        function (doLog, statusCode, response) {
            'use strict';
            return function requestor(callback, responseBody) {
                if (doLog) {
                    console.log('RQ-essentials-express4 :: HTTP Response status code ' + statusCode + ' { ' + JSON.stringify(responseBody) + ' }');
                }
                if (response.finished) {
                    console.warn('RQ-essentials-express4 :: Response is already sent with status code ' + response.statusCode + ". Check your requestor setup!");
                    return callback(responseBody, undefined);
                }
                response.status(statusCode).json(responseBody);
                return callback(responseBody, undefined);
            };
        },


// TODO: Document ...
    /**
     * Include the given properties (stated in "responseKeys" array) only,
     * picked from the requestor argument ("responseValues" object) as response body.
     *
     * Charset will by default be set to UTF-8.
     * Content Type will by default be set to 'application/json'.
     */
    dispatchResponseWithJsonBody = exports.dispatchResponseWithJsonBody =
        function (doLog, statusCode, responseKeys, response) {
            'use strict';
            return function requestor(callback, responseValues) {
                var responseBodyPropertyKeys = Array.isArray(responseKeys) ? responseKeys : [responseKeys],
                    responseBody = {};

                responseBodyPropertyKeys.map(function (responseBodyPropertyKey) {
                    responseBody[responseBodyPropertyKey] = responseValues[responseBodyPropertyKey];
                });
                if (doLog) {
                    console.log('RQ-essentials-express4 :: HTTP Response status code ' + statusCode + ' { ' + JSON.stringify(responseBody) + ' }');
                }
                if (response.finished) {
                    console.warn('RQ-essentials-express4 :: Response is already sent with status code ' + response.statusCode + ". Check your requestor setup!");
                    return callback(responseValues, undefined);
                }
                response.status(statusCode).json(responseBody);
                return callback(responseValues, undefined);
            };
        },


///////////////////////////////////////////////////////////////////////////////
// Handlers and instigators.

// RQ requestor chains need an initial callback function to start executing.
// This callback function also acts as a handler completed requestor chains.
// The callback function has two arguments: <code>success</code> and <code> failure</code>,
// handling both successful executions and failures, e.g. timeouts.
///////////////////////////////////////////////////////////////////////////////

    /**
     * Success handling: Only supports status code only, via (Number) incoming argument.
     *
     * @function
     * @private
     */
    _handleSuccess = function (doLog, success, failure, request, response) {
        'use strict';
        var successMessage,
            uri = request.originalUrl,
            internalServerError = httpResponse['Internal Server Error'],
            statusCode = internalServerError;

        if (R.is(Number, success)) {
            statusCode = success;
            successMessage = httpResponse[statusCode];
            response.status(statusCode).json(successMessage);
        }
        if (doLog) {
            if (successMessage) {
                console.log('RQ-essentials-express4 :: Resource \'' + uri + '\' processed successfully (' + successMessage + ')');

            } else {
                console.log('RQ-essentials-express4 :: Resource \'' + uri + '\' processed successfully');
            }

            if (failure) {
                console.warn('RQ-essentials-express4 :: Resource \'' + uri + '\' processed successfully, but failure also present (' + failure + ')');
            }
        }
    },


    /**
     * Failure handling: Supports timeout handling and all kinds of failures, with 500 Internal Server Error aa the default error response code.
     *
     * @function
     * @private
     */
    _handleFailure = function (doLog, success, failure, request, response) {
        'use strict';
        var failureMessage,
            internalServerError = httpResponse['Internal Server Error'],
            statusCode = internalServerError;

        if (R.is(Function, failure)) {
            failureMessage = typeof failure;

        } else if (R.is(Object, failure)) {
            failureMessage = 'Details: ';
            if (failure.name) {
                failureMessage += failure.name;
                if (failure.milliseconds) {
                    failureMessage += ' after ' + failure.milliseconds + ' milliseconds';
                }
            } else {
                failureMessage = JSON.stringify(failure);
            }

        } else if (R.is(Number, failure)) {
            statusCode = failure;
            failureMessage = httpResponse[statusCode];

        } else {
            failureMessage = failure;
        }

        console.error('RQ-essentials-express4 :: Resource \'' + request.originalUrl + '\' failed! (' + failureMessage + ')');
        response.status(statusCode).json(failureMessage);
    },


//handleTimeout = exports.handleTimeout =
//    function (request, response) {
//        'use strict';
//        return function (success, failure) {
//            if (failure) {
//                _handleFailure(success, failure, request, response);
//            }
//        };
//    },


    handleTimeoutAndStatusCode = exports.handleTimeoutAndStatusCode =
        function (doLogArg, requestArg, responseArg) {
            'use strict';
            var doLog = doLogArg,
                request = requestArg,
                response = responseArg;

            if (arguments.length === 2) {
                doLog = false;
                request = doLogArg;
                response = requestArg;
            }
            return function (success, failure) {
                if (success) {
                    _handleSuccess(doLog, success, failure, request, response);

                } else if (failure) {
                    _handleFailure(doLog, success, failure, request, response);
                }

                // else do nothing
            };
        },


// TODO: Move to 'app.config.js'? Or to RQ-essentials Express stuff
///////////////////////////////////////////////////////////////////////////////
// Some curried Express requestors
// Just add response object, then use them in RQ pipelines
///////////////////////////////////////////////////////////////////////////////

    silentRqDispatchResponseStatusCode = curry(dispatchResponseStatusCode, false),
    silentRqDispatchResponseWithScalarBody = curry(dispatchResponseWithScalarBody, false),
    silentRqDispatchResponseWithJsonBody = curry(dispatchResponseWithJsonBody, false),

    verboseRqDispatchResponseStatusCode = curry(dispatchResponseStatusCode, true),
    verboseRqDispatchResponseWithScalarBody = curry(dispatchResponseWithScalarBody, true),
    verboseRqDispatchResponseWithJsonBody = curry(dispatchResponseWithJsonBody, true),


    send200OkResponse = exports.send200OkResponse = curry(silentRqDispatchResponseStatusCode, 200),
    send200OkResponseWithArgumentAsBody = exports.send200OkResponseWithArgumentAsBody = curry(silentRqDispatchResponseWithScalarBody, 200),
    send200CreatedResponseWithBodyConsistingOf = exports.send200CreatedResponseWithBodyConsistingOf = curry(silentRqDispatchResponseWithJsonBody, 200),
    send201CreatedResponseWithArgumentAsBody = exports.send201CreatedResponseWithArgumentAsBody = curry(silentRqDispatchResponseWithScalarBody, 201),
    send201CreatedResponseWithBodyConsistingOf = exports.send201CreatedResponseWithBodyConsistingOf = curry(silentRqDispatchResponseWithJsonBody, 201),
    send202AcceptedResponse = exports.send202AcceptedResponse = curry(silentRqDispatchResponseStatusCode, 202),
    send202AcceptedResponseWithArgumentAsBody = exports.send202AcceptedResponseWithArgumentAsBody = curry(silentRqDispatchResponseWithScalarBody, 202),
    send205ResetContentResponse = exports.send205ResetContentResponse = curry(silentRqDispatchResponseStatusCode, 205),
    send400BadRequestResponseWithArgumentAsBody = exports.send400BadRequestResponseWithArgumentAsBody = curry(silentRqDispatchResponseWithScalarBody, 400),
    send403ForbiddenResponseWithArgumentAsBody = exports.send403ForbiddenResponseWithArgumentAsBody = curry(silentRqDispatchResponseWithScalarBody, 403),
    send404NotFoundResponseWithArgumentAsBody = exports.send404NotFoundResponseWithArgumentAsBody = curry(silentRqDispatchResponseWithScalarBody, 404),
    send405MethodNotAllowedResponseWithArgumentAsBody = exports.send405MethodNotAllowedResponseWithArgumentAsBody = curry(silentRqDispatchResponseWithScalarBody, 405),
    send500InternalServerErrorResponse = exports.send500InternalServerErrorResponse = curry(silentRqDispatchResponseStatusCode, 500),
    send500InternalServerErrorResponseWithArgumentAsBody = exports.send500InternalServerErrorResponseWithArgumentAsBody = curry(silentRqDispatchResponseWithScalarBody, 500),
    send501NotImplementedServerErrorResponse = exports.send501NotImplementedServerErrorResponse = curry(silentRqDispatchResponseStatusCode, 501),


    ensureHttpGet = exports.ensureHttpGet =
        function (request, response) {
            'use strict';
            return RQ.sequence([
                rq.if(not(isHttpMethod('GET', request))),
                rq.value('URI \'' + request.originalUrl + '\' supports GET requests only'),
                send405MethodNotAllowedResponseWithArgumentAsBody(response)
            ]);
        },

    ensureHttpPost = exports.ensureHttpPost =
        function (request, response) {
            'use strict';
            return RQ.sequence([
                rq.if(not(isHttpMethod('POST', request))),
                rq.value('URI \'' + request.originalUrl + '\' supports POST requests only'),
                send405MethodNotAllowedResponseWithArgumentAsBody(response)
            ]);
        },

    ensureHttpPut = exports.ensureHttpPut =
        function (request, response) {
            'use strict';
            return RQ.sequence([
                rq.if(not(isHttpMethod('PUT', request))),
                rq.value('URI \'' + request.originalUrl + '\' supports PUT requests only'),
                send405MethodNotAllowedResponseWithArgumentAsBody(response)
            ]);
        },

    ensureHttpDelete = exports.ensureHttpDelete =
        function (request, response) {
            'use strict';
            return RQ.sequence([
                rq.if(not(isHttpMethod('DELETE', request))),
                rq.value('URI \'' + request.originalUrl + '\' supports DELETE requests only'),
                send405MethodNotAllowedResponseWithArgumentAsBody(response)
            ]);
        },

    ensure = exports.ensure =
        function (valueOrArray, request, response) {
            'use strict';
            return RQ.sequence([
                rq.if(isMissing(valueOrArray)),
                rq.value('Mandatory parameter is missing'),
                send400BadRequestResponseWithArgumentAsBody(response)
            ]);
        },

    ensureHttpResourceElement = exports.ensureHttpResourceElement =
        function (resourceElementName, request, response) {
            'use strict';
            return RQ.sequence([
                rq.value(request.params[resourceElementName]),
                rq.if(isMissing),
                rq.value('Mandatory HTTP URL element \'' + resourceElementName + '\' is missing'),
                send400BadRequestResponseWithArgumentAsBody(response)
            ]);
        },

    ensureHttpParameter = exports.ensureHttpParameter =
        function (httpParameterName, request, response) {
            'use strict';
            return RQ.sequence([
                RQ.parallel([
                    function (callback, args) {
                        if (request && request.body && R.is(Object, request.body)) {
                            callback(request.body[httpParameterName], undefined);
                        } else {
                            callback(undefined, undefined);
                        }
                    },
                    rq.value(request.params[httpParameterName])
                ]),
                RQ.fallback([
                    RQ.sequence([
                        rq.if(function (args) {
                            return args.length > 1 && args[0] && args[1];
                        }),
                        rq.value('HTTP parameter \'' + httpParameterName + '\' present in both body and URL'),
                        send400BadRequestResponseWithArgumentAsBody(response)
                    ]),
                    RQ.sequence([
                        function (callback, args) {
                            var bodyParam = args[0],
                                urlParam = args[1];

                            if (bodyParam) {
                                callback(bodyParam, undefined);

                            } else {
                                callback(urlParam, undefined);
                            }
                        },
                        rq.if(isMissing),
                        rq.value('Mandatory HTTP parameter \'' + httpParameterName + '\' is missing'),
                        send400BadRequestResponseWithArgumentAsBody(response)
                    ])
                ])
            ]);
        },

    ensureNumericHttpParameter = exports.ensureNumericHttpParameter =
        function (httpParameterName, request, response) {
            'use strict';
            return RQ.fallback([
                ensureHttpParameter(httpParameterName, request, response),
                // TODO: If failed requestors could pass arguments to the next requestor in the fallback pipeline ...
                // => Save a lot of boilerplate code (no need to retrieve stuff all over again) ...
                // => Aggregation of failure messages ...
                RQ.sequence([
                    RQ.parallel([
                        function (callback, args) {
                            if (request && request.body && R.is(Object, request.body)) {
                                callback(request.body[httpParameterName], undefined);
                            } else {
                                callback(undefined, undefined);
                            }
                        },
                        rq.value(request.params[httpParameterName])
                    ]),
                    RQ.fallback([
                        function (callback, args) {
                            var bodyParam = args[0],
                                urlParam = args[1];

                            if (bodyParam) {
                                callback(bodyParam, undefined);

                            } else {
                                callback(urlParam, undefined);
                            }
                        }
                    ]),
                    rq.if(not(isNumber)),
                    rq.value('Mandatory HTTP parameter \'' + httpParameterName + '\' is not a number'),
                    send400BadRequestResponseWithArgumentAsBody(response)
                ])
            ]);
        },

    ensureHttpBody = exports.ensureHttpBody =
        function (request, response) {
            'use strict';
            return RQ.fallback([
                RQ.sequence([
                    rq.if(isMissing(request.body)),
                    rq.value('Mandatory request body is missing'),
                    send400BadRequestResponseWithArgumentAsBody(response)
                ]),
                RQ.sequence([
                    rq.if(isEmpty(request.body)),
                    rq.value('Mandatory request body is not valid'),
                    send400BadRequestResponseWithArgumentAsBody(response)
                ])
            ]);
        };
