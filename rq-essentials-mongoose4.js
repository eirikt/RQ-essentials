/* global require:false, exports:false, console:false, JSON:false */

var utils = require('./utils'),

    _mongoose4 = exports.mongoose =
        function (mongooseModel, mongooseModelFunction, conditions) {
            'use strict';

            var func = utils.isString(mongooseModelFunction) ?
                mongooseModel[mongooseModelFunction] :
                mongooseModelFunction;

            return function requestor(callback, args) {
                func.call(mongooseModel, conditions, function (err, count) {
                    if (err) {
                        return callback(undefined, err);
                        // TODO:
                        //return error.handle(err, { rqCallback: callback });
                    }
                    return callback(count, undefined);
                });
            };
        };
