/* global require:false, describe:false, it:false, beforeEach:false, afterEach:false */
/* jshint -W030 */

var expect = require('chai').expect,
    __ = require('underscore'),

    rq = require('./../rq-essentials');


describe('RQ-essentials', function () {
    'use strict';

    it('should exist', function () {
        expect(rq).to.exist;
        expect(rq).to.be.an('object');
    });


    describe('nullRequestor', function () {
        it('should exist', function () {
            expect(rq.undefined).to.exist;
            expect(rq.undefined).to.be.a('function');
        });

        it('should be a requestor', function () {
            var nullRequestor = rq.undefined;

            expect(nullRequestor.name).to.be.equal('requestor');
            expect(nullRequestor.length).to.be.equal(2);
        });

        it('should ignore requestor incoming arguments', function () {
            var nullRequestor = rq.undefined,
                trivialCallback = rq.identity,
                args = { entityId: 42 };

            nullRequestor(trivialCallback, args);

            expect(__.keys(args).length).to.be.equal(1);
            expect(args.entityId).to.be.equal(42);
        });

        it('should return undefined', function () {
            var nullRequestor = rq.undefined,
                trivialCallback = rq.identity,
                executedTimestampRequestor = nullRequestor(trivialCallback);

            expect(executedTimestampRequestor).to.be.undefined;
        });
    });


    describe('timestampRequestor', function () {
        it('should exist', function () {
            expect(rq.timestamp).to.exist;
            expect(rq.timestamp).to.be.a('function');
        });

        it('should be a requestor', function () {
            var timestampRequestor = rq.timestamp;

            expect(timestampRequestor.name).to.be.equal('requestor');
            expect(timestampRequestor.length).to.be.equal(2);
        });

        it('should ignore requestor incoming arguments', function () {
            var timestampRequestor = rq.timestamp,
                trivialCallback = rq.identity,
                args = { entityId: 42 };

            timestampRequestor(trivialCallback, args);

            expect(__.keys(args).length).to.be.equal(1);
            expect(args.entityId).to.be.equal(42);
        });

        it('should return a UNIX timestamp', function () {
            var timestampRequestor = rq.timestamp,
                trivialCallback = rq.identity,
                executedTimestampRequestor = timestampRequestor(trivialCallback);

            expect(executedTimestampRequestor).to.be.a('number');
            expect(executedTimestampRequestor).to.be.above(new Date(2015, 4, 1).getTime());
            expect(executedTimestampRequestor).to.be.below(Date.now());
        });
    });


    describe('conditionalRequestorFactory', function () {
        it('should exist', function () {
            expect(rq.if).to.exist;
            expect(rq.if).to.be.a('function');
        });

        it('should be a requestor factory', function () {
            var conditionalRequestorFactory = rq.if,
                condition = 1 === 1,
                requestor = conditionalRequestorFactory(condition);

            expect(requestor.name).to.be.equal('requestor');
            expect(requestor.length).to.be.equal(2);
        });

        it('should let true conditions through', function () {
            var conditionalRequestorFactory = rq.if,
                noopRequestor = conditionalRequestorFactory(true);

            // TODO: Use fallbacks and done ...

        });

        it('should cancel further processing when condition is false', function () {
            var conditionalRequestorFactory = rq.if,
                cancelRequestor = conditionalRequestorFactory(false);

            // TODO: Use fallbacks and done ...

        });
    });
});
