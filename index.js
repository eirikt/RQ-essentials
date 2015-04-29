/* global require:false, module:false */

var essentials = require('./rq-essentials'),
    express4 = require('./rq-essentials-express4'),
    mocha = require('./rq-essentials-mocha'),
    mongoose4 = require('./rq-essentials-mongoose4'),
    request = require('./rq-essentials-request');

essentials.doLog = true;
essentials.doNotLog = false;

essentials.dispatchResponseStatusCode = express4.dispatchResponseStatusCode;
essentials.dispatchResponse = express4.dispatchResponse;
//essentials.response200Ok = express4.response200Ok;
//essentials.response201Created = express4.response201Created;
//essentials.response202Accepted = express4.response202Accepted;
//essentials.response205ResetContent = express4.response205ResetContent;
//essentials.response500InternalServerError = express4.response500InternalServerError;

essentials.executeAndVerify = mocha.executeAndVerify;

essentials.mongoose = mongoose4.mongoose;
essentials.mongooseJson = mongoose4.mongooseJson;
essentials.mongooseQueryInvocation = mongoose4.mongooseQueryInvocation;

essentials.get = request.get;
essentials.getEncoded = request.getEncoded;

essentials.version = require('./package').version;

module.exports = essentials;
