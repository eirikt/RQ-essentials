/* global require:false, module:false */

var essentials = require('./rq-essentials'),
    caching = require('./rq-essentials-caching'),
    express4 = require('./rq-essentials-express4'),
    logging = require('./rq-essentials-logging'),
    mocha = require('./rq-essentials-mocha'),
    mongoose4 = require('./rq-essentials-mongoose4'),
    request = require('./rq-essentials-request'),
    utils = require('./utils');

essentials.doLog = true;
essentials.doNotLog = false;

//essentials.run = essentials.vanillaExecutor;
//essentials.go = essentials.vanillaExecutor;


essentials.cacheWrite = caching.cacheWrite;
essentials.cacheRead = caching.cacheRead;
essentials.push = caching.push;
essentials.pop = caching.pop;
essentials._getStack = caching._getStack;
essentials._resetStack = caching._resetStack;


essentials.utilities = {};
essentials.utilities.clone = utils.clone;


essentials.predicates = {};
essentials.predicates.not = utils.not;
essentials.predicates.isNumber = utils.isNumber;
essentials.predicates.isHttpMethod = utils.isHttpMethod;
essentials.predicates.isMissing = utils.isMissing;
essentials.predicates.isEmpty = utils.isEmpty;


essentials.express = {};
essentials.express.dispatchResponseStatusCode = express4.dispatchResponseStatusCode;
essentials.express.dispatchResponseWithScalarBody = express4.dispatchResponseWithScalarBody;
essentials.express.dispatchResponseWithJsonBody = express4.dispatchResponseWithJsonBody;

essentials.express.handleTimeoutAndStatusCode = express4.handleTimeoutAndStatusCode;

essentials.express.send200OkResponse = express4.send200OkResponse;
essentials.express.send200OkResponseWithArgumentAsBody = express4.send200OkResponseWithArgumentAsBody;
essentials.express.send200CreatedResponseWithBodyConsistingOf = express4.send200CreatedResponseWithBodyConsistingOf;
essentials.express.send201CreatedResponseWithArgumentAsBody = express4.send201CreatedResponseWithArgumentAsBody;
essentials.express.send201CreatedResponseWithBodyConsistingOf = express4.send201CreatedResponseWithBodyConsistingOf;
essentials.express.send202AcceptedResponse = express4.send202AcceptedResponse;
essentials.express.send200OkResponseWithArgumentAsBody = express4.send200OkResponseWithArgumentAsBody;
essentials.express.send202AcceptedResponseWithArgumentAsBody = express4.send202AcceptedResponseWithArgumentAsBody;
essentials.express.send205ResetContentResponse = express4.send205ResetContentResponse;
essentials.express.send400BadRequestResponseWithArgumentAsBody = express4.send400BadRequestResponseWithArgumentAsBody;
essentials.express.send403ForbiddenResponseWithArgumentAsBody = express4.send403ForbiddenResponseWithArgumentAsBody;
essentials.express.send404NotFoundResponseWithArgumentAsBody = express4.send404NotFoundResponseWithArgumentAsBody;
essentials.express.send405MethodNotAllowedResponseWithArgumentAsBody = express4.send405MethodNotAllowedResponseWithArgumentAsBody;
essentials.express.send500InternalServerErrorResponse = express4.send500InternalServerErrorResponse;
essentials.express.send500InternalServerErrorResponseWithArgumentAsBody = express4.send500InternalServerErrorResponseWithArgumentAsBody;
essentials.express.send501NotImplementedServerErrorResponse = express4.send501NotImplementedServerErrorResponse;

essentials.express.ensureHttpGet = express4.ensureHttpGet;
essentials.express.ensureHttpPost = express4.ensureHttpPost;
essentials.express.ensureHttpPut = express4.ensureHttpPut;
essentials.express.ensureHttpDelete = express4.ensureHttpDelete;
essentials.express.ensure = express4.ensure;
essentials.express.ensureHttpResourceElement = express4.ensureHttpResourceElement;
essentials.express.ensureHttpParameter = express4.ensureHttpParameter;
essentials.express.ensureNumericHttpParameter = express4.ensureNumericHttpParameter;
essentials.express.ensureHttpBody = express4.ensureHttpBody;

essentials.log = logging.loggerFactory;

essentials.executeAndVerify = mocha.executeAndVerify;

essentials.mongoose = mongoose4.mongoose;
essentials.mongooseJson = mongoose4.mongooseJson;
essentials.mongooseFindInvocation = mongoose4.mongooseFindInvocation;
essentials.mongooseQueryInvocation = mongoose4.mongooseQueryInvocation;

essentials.get = request.get;
essentials.getEncoded = request.getEncoded;

essentials.version = require('./package').version;

module.exports = essentials;
