/* global exports:false, console:false, JSON:false */

var

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
                response.status(statusCode).json(responseBody);
                return callback(responseValues, undefined);
            };
        };
