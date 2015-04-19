/* global require:false, module:false */

var essentials = require('./rq-essentials'),
    request = require('./rq-essentials-request'),
    mocha = require('./rq-essentials-mocha');

essentials.get = request.get;

essentials.executeAndVerify = mocha.executeAndVerify;

essentials.version = require('./package').version;

module.exports = essentials;
