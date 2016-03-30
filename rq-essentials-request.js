/* global require:false, exports:false, console:false, Buffer:false */

var request = require('request'),
    iconv = require('iconv-lite'),

    /**
     * <hr style="border:0;height:1px;background:#333;background-image:-webkit-linear-gradient(left, #ccc, #333, #ccc);background-image:-moz-linear-gradient(left, #ccc, #333, #ccc);background-image:-ms-linear-gradient(left, #ccc, #333, #ccc);"/>
     * <p>
     * Simple requestor factory for HTTP GET using the "request" library.
     * </p>
     * <p>
     * A "data generator" requestor => No forwarding of existing data.
     * A typical parallel requestor, or as a starting requestor in a sequence ...
     * </p>
     * <p>
     * <em>Aliases</em>
     * </p>
     * <p>
     * <em>Usage examples</em>
     * </p>
     * <hr style="border:0;height:1px;background:#333;background-image:-webkit-linear-gradient(left, #ccc, #333, #ccc);background-image:-moz-linear-gradient(left, #ccc, #333, #ccc);background-image:-ms-linear-gradient(left, #ccc, #333, #ccc);"/>
     *
     * @see https://github.com/mikeal/request
     * @see https://www.npmjs.org/package/request
     * @function
     */
    httpGetFactory = exports.httpGet =
        function (encoding, uri) {
            'use strict';
            if (arguments.length < 2) {
                uri = encoding;
                encoding = null;
            }
            return function requestor(callback, args) {
                return request(uri, function (err, response, body) {
                        var decodedBody;
                        if (err) {
                            console.error('[' + new Date().toISOString() + ' rq-essentials-request.get] ' + err);
                            return callback(undefined, err);
                        }
                        if (response.request.href !== uri) {
                            err = 'This is a response from \'' + response.request.href + '\', but the requested URL was \'' + uri + '\'. A redirection has probably taken place - this is not supported';
                            console.error('[' + new Date().toISOString() + ' rq-essentials-request.get] ' + err);
                            return callback(undefined, err);
                        }

                        if (response.statusCode !== 200) {
                            err = 'Unexpected HTTP status code: ' + response.statusCode + ' (only status code 200 is supported)';
                            console.error('[' + new Date().toISOString() + ' rq-essentials-request.get] ' + err);
                            return callback(undefined, err);

                        } else {
                            if (encoding) {
                                decodedBody = iconv.decode(new Buffer(body), encoding);
                            } else {
                                decodedBody = body;
                            }
                            return callback(decodedBody);
                        }
                    }
                );
            };
        };
