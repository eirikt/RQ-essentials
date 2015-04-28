/* global require:false, exports:false, console:false, JSON:false */

var utils = require('./utils'),

    _dispatchResponseStatusCode = exports.dispatchResponseStatusCode =
        function (doLog, response, statusCode) {
            'use strict';
            return function requestor(callback, args) {
                if (doLog) {
                    console.log('RQ-essentials-express4 :: HTTP Response status code ' + statusCode);
                }
                response.sendStatus(statusCode);
                return callback(args, undefined);
            };
        },

    _dispatchResponse = exports.dispatchResponse =
        function (doLog, response, statusCode) {
            'use strict';
            return function requestor(callback, responseBody) {
                response.status(statusCode).send(responseBody);
                return callback(responseBody, undefined);
            };
        },

    _dispatchResponseWithBody = exports.dispatchResponseBody =
        function (doLog, response, statusCode, responseKeys) {
            'use strict';
            return function requestor(callback, responseValues) {
                var responseBodyPropertyKeys = Array.isArray(responseKeys) ? responseKeys : [responseKeys],
                    responseBodyPropertyValues = Array.isArray(responseValues) ? responseValues : [responseValues],
                    responseBody = {};

                responseBodyPropertyKeys.map(function (responseBodyPropertyKey, index) {
                    responseBody[responseBodyPropertyKey] = responseBodyPropertyValues[index];
                });
                if (doLog) {
                    console.log('RQ-essentials-express4 :: HTTP Response status code ' + statusCode + ' { ' + JSON.stringify(responseBody) + ' }');
                }
                response.status(statusCode).send(responseBody);
                return callback(responseValues, undefined);
            };
        },

    _response200Ok = exports.response200Ok =
        function (response) {
            'use strict';
            return utils.curry(_dispatchResponseWithBody, false, response, 200);
        },

    _response201Created = exports.response201Created =
        function (response) {
            'use strict';
            return utils.curry(_dispatchResponseWithBody, false, response, 201);
        },

    _response202Accepted = exports.response202Accepted =
        function (response) {
            'use strict';
            return utils.curry(_dispatchResponseWithBody, false, response, 202);
        },

    _response205ResetContent = exports.response205ResetContent =
        function (response) {
            'use strict';
            return utils.curry(_dispatchResponseWithBody, false, response, 205);
        },

    _response500InternalServerError = exports.response500InternalServerError =
        function (response) {
            'use strict';
            return utils.curry(_dispatchResponseWithBody, false, response, 500);
        },

    _response501NotImplemented = exports.response501NotImplemented =
        function (response) {
            'use strict';
            return utils.curry(_dispatchResponseWithBody, false, response, 501);
        };
