/* global require:false, exports:false, console:false, JSON:false */

var utils = require('./utils'),

    _dispatchResponseStatusCode = exports.dispatchResponseStatusCode =
        function (response, statusCode) {
            'use strict';
            return function requestor(callback, args) {
                console.log("RQ-essentials-express :: HTTP Response: " + statusCode);
                response.sendStatus(statusCode);
                return callback(args);
            };
        },

    _dispatchResponseWithBody = exports.dispatchResponse =
        function (response, statusCode, responseKeys) {
            'use strict';
            return function requestor(callback, responseValues) {
                var responseBodyPropertyKeys = Array.isArray(responseKeys) ? responseKeys : [responseKeys],
                    responseBodyPropertyValues = Array.isArray(responseValues) ? responseValues : [responseValues],
                    responseBody = {};

                responseBodyPropertyKeys.map(function (responseBodyPropertyKey, index) {
                    responseBody[responseBodyPropertyKey] = responseBodyPropertyValues[index];
                });
                console.log(statusCode + ': ' + JSON.stringify(responseBody));
                response.status(statusCode).send(responseBody);
                return callback(responseValues);
            };
        },

    _response200Ok = exports.response200Ok =
        function (response) {
            'use strict';
            return utils.curry(_dispatchResponseWithBody, response, 200);
        },

    _response201Created = exports.response201Created =
        function (response) {
            'use strict';
            return utils.curry(_dispatchResponseWithBody, response, 201);
        },

    _response202Accepted = exports.response202Accepted =
        function (response) {
            'use strict';
            return utils.curry(_dispatchResponseWithBody, response, 202);
        },

    _response205ResetContent = exports.response205ResetContent =
        function (response) {
            'use strict';
            return utils.curry(_dispatchResponseWithBody, response, 205);
        },

    _response500InternalServerError = exports.response500InternalServerError =
        function (response) {
            'use strict';
            return utils.curry(_dispatchResponseWithBody, response, 500);
        };
