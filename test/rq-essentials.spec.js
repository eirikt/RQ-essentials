/* global require:false, describe:false, it:false, beforeEach:false, afterEach:false, JSON:false, console:false */
/* jshint -W030 */

var expect = require('chai').expect,
    R = require('ramda'),
    RQ = require('async-rq'),
    rq = require('./../rq-essentials'),
    run = rq.vanillaExecutor,
    utils = require('./../utils'),
    clone = utils.clone;


describe('RQ-essentials', function () {
    'use strict';

    it('should exist', function () {
        expect(rq).to.exist;
        expect(rq).to.be.an('object');
    });


    describe('requestorFactory', function () {
        it('should transform incoming arguments', function (done) {
            RQ.sequence([
                rq.value(13.49),
                rq.then(Math.round),
                function (callback, args) {
                    expect(args).to.be.equal(13);
                    expect(args).to.be.equal(Math.round(13.49));
                    done();
                }
            ])(run);
        });

        it('should not mutate incoming by-value arguments', function (done) {
            var val = 13.49;
            RQ.sequence([
                rq.value(val),
                rq.then(Math.round),
                function (callback, args) {
                    expect(args).to.be.equal(13);
                    expect(args).to.be.equal(Math.round(13.49));
                    expect(val).to.be.equal(13.49);
                    done();
                }
            ])(run);
        });

        it('should not seal incoming by-reference arguments, #1', function (done) {
            var obj = {
                    val: 13.49
                },
                pureFunction = function (obj) {
                    var newObj = clone(obj);
                    newObj.val += 1;
                    return newObj;
                };

            RQ.sequence([
                rq.value(obj),
                rq.then(pureFunction),
                function (callback, args) {
                    expect(obj.val).to.be.equal(13.49);
                    expect(args.val).to.be.equal(14.49);
                    done();
                }
            ])(run);
        });

        it('should, or more precisely, will not seal incoming by-reference arguments, #2', function (done) {
            var obj = {
                    val: 13.49
                },
                mutatingFunction = function (obj) {
                    obj.val += 1;
                    return obj;
                };

            RQ.sequence([
                rq.value(obj),
                rq.then(mutatingFunction), // NB! Will mutate by-reference arguments
                function (callback, args) {
                    expect(obj.val).to.be.equal(args.val);
                    expect(obj.val).to.be.equal(14.49);
                    done();
                }
            ])(run);
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

        it('should let true conditions through', function (done) {
            var conditionalRequestorFactory = rq.if,
                noopRequestor = conditionalRequestorFactory(true);

            RQ.sequence([
                noopRequestor,
                rq.then(done)
            ])(run);
        });

        it('should cancel further processing when condition is false', function (done) {
            var conditionalRequestorFactory = rq.if,
                cancelRequestor = conditionalRequestorFactory(false);

            RQ.fallback([
                RQ.sequence([
                    cancelRequestor,
                    rq.then(function () {
                        throw new Error('Should not reach this place');
                    })
                ]),
                rq.then(done)
            ])(run);
        });
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

            expect(Object.keys(args).length).to.be.equal(1);
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

            expect(Object.keys(args).length).to.be.equal(1);
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

        it('should return this exact time', function () {
            var timestampRequestor = rq.timestamp,
                trivialCallback = rq.identity,
                executedTimestampRequestor1 = timestampRequestor(trivialCallback),
                executedTimestampRequestor2;

            RQ.sequence([
                rq.wait(10),
                function(callback, args) {
                    expect(executedTimestampRequestor1).to.be.below(Date.now());
                    executedTimestampRequestor2 = timestampRequestor(trivialCallback);
                    return callback(args);
                },
                rq.wait(10),
                function(callback, args) {
                    expect(executedTimestampRequestor2).to.be.above(executedTimestampRequestor1);
                    expect(executedTimestampRequestor2).to.be.below(Date.now());
                    return callback(args);
                }
            ])(rq.do);
        });
    });


    describe('propertyPickerFactory', function () {
        it('should exist', function () {
            expect(rq.pick).to.exist;
            expect(rq.pick).to.be.a('function');
        });

        it('should be a requestor factory, taking one single argument', function () {
            var timestampRequestor = rq.pick;

            expect(timestampRequestor.name).to.be.equal('factory');
            expect(timestampRequestor.length).to.be.equal(1);

            expect(timestampRequestor().name).to.be.equal('requestor');
            expect(timestampRequestor().length).to.be.equal(2);
        });

        it('should return nothing if ...', function (done) {
            RQ.sequence([
                rq.undefined,
                rq.pick(undefined),
                function (callback, args) {
                    expect(args).to.be.undefined;
                    done();
                }
            ])(run);
        });

        it('should return nothing if ...', function (done) {
            RQ.sequence([
                rq.undefined,
                rq.pick('year'),
                function (callback, args) {
                    expect(args).to.be.undefined;
                    done();
                }
            ])(run);
        });

        it('should return nothing if ...', function (done) {
            var obj = {
                type: 'Tesla',
                model: 'Model S'
            };
            RQ.sequence([
                rq.value(obj),
                rq.pick(undefined),
                function (callback, args) {
                    expect(args).to.be.undefined;
                    done();
                }
            ])(run);
        });

        it('should pick a given property from an object, even if it does not exist', function (done) {
            var obj = {
                type: 'Tesla',
                model: 'Model S'
            };
            RQ.sequence([
                rq.value(obj),
                rq.pick('year'),
                function (callback, args) {
                    expect(args).to.be.undefined;
                    done();
                }
            ])(run);
        });

        it('should pick a given property from an object', function (done) {
            var obj = {
                type: 'Tesla',
                model: 'Model S'
            };
            RQ.sequence([
                rq.value(obj),
                rq.pick('model'),
                function (callback, args) {
                    expect(args).to.be.equal('Model S');
                    done();
                }
            ])(run);
        });

        it('should pick given properties from an array', function (done) {
            var arr = [];
            arr.push({
                type: 'Tesla',
                model: 'Model S'
            });
            arr.push({
                type: 'Kia',
                model: 'Soul'
            });
            RQ.sequence([
                rq.value(arr),
                rq.pick('model'),
                function (callback, args) {
                    expect(args).to.be.an.array;
                    expect(args.length).to.be.equal(2);
                    expect(args[0]).to.be.equal('Model S');
                    expect(args[1]).to.be.equal('Soul');
                    done();
                }
            ])(run);
        });
    });
});
