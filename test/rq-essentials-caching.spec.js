/* global require:false, describe:false, it:false, beforeEach:false, afterEach:false, JSON:false, console:false */
/* jshint -W030 */

var expect = require('chai').expect,
    RQ = require('rq-commonjs'),
    rq = require('./../rq-essentials'),
    rqCaching = require('./../rq-essentials-caching'),
    rqMocha = require('./../rq-essentials-mocha');


describe('RQ-essentials: Caching', function () {
    'use strict';

    beforeEach(function () {
        rqCaching._resetStack();
    });

    afterEach(function () {
    });

    it('should exist', function () {
        expect(rqCaching).to.exist;
        expect(rqCaching).to.be.an('object');
    });


    describe('Stack administration/testing', function () {
        it('should exist', function () {
            expect(rqCaching._getStack).to.exist;
            expect(rqCaching._getStack).to.be.a('function');

            expect(rqCaching._getStack().length).to.be.equal(0);
        });
    });


    describe('Stack \'push\' function', function () {
        it('should exist', function () {
            expect(rqCaching.push).to.exist;
            expect(rqCaching.push).to.be.a('function');
        });

        it('should hold on to falsey Boolean objects', function (done) {
            var inputArgs = false,
                verify = function (args) {
                    expect(args).to.be.equal(false);
                    expect(rqCaching._getStack().length).to.be.equal(1);
                    expect(rqCaching._getStack()[0]).to.be.equal(false);
                };

            rqMocha.executeAndVerify(rqCaching.push, inputArgs, verify, done);
        });

        it('should hold on to falsey Number objects', function (done) {
            var inputArgs = 0,
                verify = function (args) {
                    expect(args).to.be.equal(0);
                    expect(rqCaching._getStack().length).to.be.equal(1);
                    expect(rqCaching._getStack()[0]).to.be.equal(0);
                };

            rqMocha.executeAndVerify(rqCaching.push, inputArgs, verify, done);
        });

        it('should hold on to falsey String objects (1)', function (done) {
            var inputArgs = '',
                verify = function (args) {
                    expect(args).to.be.equal('');
                    expect(rqCaching._getStack().length).to.be.equal(1);
                    expect(rqCaching._getStack()[0]).to.be.equal('');
                };

            rqMocha.executeAndVerify(rqCaching.push, inputArgs, verify, done);
        });

        it('should hold on to falsey String objects (2)', function (done) {
            var inputArgs = '  ',
                verify = function (args) {
                    expect(args).to.be.equal('  ');
                    expect(rqCaching._getStack().length).to.be.equal(1);
                    expect(rqCaching._getStack()[0]).to.be.equal('  ');
                };

            rqMocha.executeAndVerify(rqCaching.push, inputArgs, verify, done);
        });

        it('should hold on to falsey/empty Objects', function (done) {
            var inputArgs = {},
                verify = function (args) {
                    expect(args).to.be.equal(inputArgs);
                    expect(rqCaching._getStack().length).to.be.equal(1);
                    expect(rqCaching._getStack()[0]).to.be.equal(inputArgs);
                };

            rqMocha.executeAndVerify(rqCaching.push, inputArgs, verify, done);
        });

        it('should hold on to falsey/empty Arrays', function (done) {
            var inputArgs = [],
                verify = function (args) {
                    expect(args).to.be.equal(inputArgs);
                    expect(rqCaching._getStack().length).to.be.equal(1);
                    expect(rqCaching._getStack()[0]).to.be.equal(inputArgs);
                };

            rqMocha.executeAndVerify(rqCaching.push, inputArgs, verify, done);
        });

        it('should hold on to Number objects (1)', function (done) {
            var inputArgs = 1,
                verify = function (args) {
                    expect(args).to.be.equal(1);
                    expect(rqCaching._getStack().length).to.be.equal(1);
                    expect(rqCaching._getStack()[0]).to.be.equal(1);
                };

            rqMocha.executeAndVerify(rqCaching.push, inputArgs, verify, done);
        });

        it('should hold on to Number objects (2)', function (done) {
            var inputArgs = 3.14,
                verify = function (args) {
                    expect(args).to.be.equal(3.14);
                    expect(rqCaching._getStack().length).to.be.equal(1);
                    expect(rqCaching._getStack()[0]).to.be.equal(3.14);
                };

            rqMocha.executeAndVerify(rqCaching.push, inputArgs, verify, done);
        });

        it('should hold on to complex objects', function (done) {
            var inputArgs = { entityId: 42 },
                verify = function (args) {
                    expect(args).to.be.equal(inputArgs);
                    expect(rqCaching._getStack().length).to.be.equal(1);
                    expect(rqCaching._getStack()[0]).to.be.equal(inputArgs);
                };

            rqMocha.executeAndVerify(rqCaching.push, inputArgs, verify, done);
        });

        it('should hold on to several complex objects', function (done) {
            var firstObjectToBeCached = { entityId: 42 },
                secondObjectToBeCached = { someProperty: 'Mr. Bond' };

            RQ.sequence([
                function (callback, args) {
                    expect(rqCaching._getStack().length).to.be.equal(0);
                    return callback(args, undefined);
                },
                rq.return(firstObjectToBeCached),
                function (callback, args) {
                    expect(args).to.be.equal(firstObjectToBeCached);
                    expect(rqCaching._getStack().length).to.be.equal(0);
                    return callback(args, undefined);
                },
                rqCaching.push,
                function (callback, args) {
                    expect(args).to.be.equal(firstObjectToBeCached);
                    expect(rqCaching._getStack().length).to.be.equal(1);
                    expect(rqCaching._getStack()[0]).to.be.equal(firstObjectToBeCached);
                    return callback(args, undefined);
                },
                rq.return(secondObjectToBeCached),
                function (callback, args) {
                    expect(args).to.be.equal(secondObjectToBeCached);
                    expect(rqCaching._getStack().length).to.be.equal(1);
                    expect(rqCaching._getStack()[0]).to.be.equal(firstObjectToBeCached);
                    return callback(args, undefined);
                },
                rqCaching.push,
                function (callback, args) {
                    expect(args).to.be.equal(secondObjectToBeCached);
                    expect(rqCaching._getStack().length).to.be.equal(2);
                    expect(rqCaching._getStack()[0]).to.be.equal(firstObjectToBeCached);
                    expect(rqCaching._getStack()[1]).to.be.equal(secondObjectToBeCached);
                    return callback(args, undefined);
                },
                rq.execute(done)

            ])(rq.vanillaExecutor);
        });
    });


    describe('Stack \'pop\' function', function () {
        it('should exist', function () {
            expect(rqCaching.pop).to.exist;
            expect(rqCaching.pop).to.be.a('function');
        });

        it('should return \'undefined\' when pop\'ing an empty stack', function (done) {
            var inputArgs = null,
                verify = function (args) {
                    expect(args).to.be.undefined;
                    expect(rqCaching._getStack().length).to.be.equal(0);
                    expect(rqCaching._getStack()[0]).to.be.undefined;
                };

            rqMocha.executeAndVerify(rqCaching.pop, inputArgs, verify, done);
        });


        it('should honour LIFO queue semantics', function (done) {
            var firstObjectToBeCached = { entityId: 42 },
                secondObjectToBeCached = { someProperty: 'Mr. Bond' };

            RQ.sequence([
                function (callback, args) {
                    expect(rqCaching._getStack().length).to.be.equal(0);
                    return callback(args, undefined);
                },
                rq.return(firstObjectToBeCached),
                function (callback, args) {
                    expect(args).to.be.equal(firstObjectToBeCached);
                    expect(rqCaching._getStack().length).to.be.equal(0);
                    return callback(args, undefined);
                },
                rqCaching.push,
                function (callback, args) {
                    expect(args).to.be.equal(firstObjectToBeCached);
                    expect(rqCaching._getStack().length).to.be.equal(1);
                    expect(rqCaching._getStack()[0]).to.be.equal(firstObjectToBeCached);
                    return callback(args, undefined);
                },
                rqCaching.pop,
                function (callback, args) {
                    expect(args).to.be.equal(firstObjectToBeCached);
                    expect(rqCaching._getStack().length).to.be.equal(0);
                    return callback(args, undefined);
                },
                rq.return(firstObjectToBeCached),
                rqCaching.push,
                function (callback, args) {
                    expect(args).to.be.equal(firstObjectToBeCached);
                    expect(rqCaching._getStack().length).to.be.equal(1);
                    expect(rqCaching._getStack()[0]).to.be.equal(firstObjectToBeCached);
                    return callback(args, undefined);
                },
                rq.return(secondObjectToBeCached),
                function (callback, args) {
                    expect(args).to.be.equal(secondObjectToBeCached);
                    expect(rqCaching._getStack().length).to.be.equal(1);
                    expect(rqCaching._getStack()[0]).to.be.equal(firstObjectToBeCached);
                    return callback(args, undefined);
                },
                rqCaching.push,
                function (callback, args) {
                    expect(args).to.be.equal(secondObjectToBeCached);
                    expect(rqCaching._getStack().length).to.be.equal(2);
                    expect(rqCaching._getStack()[0]).to.be.equal(firstObjectToBeCached);
                    expect(rqCaching._getStack()[1]).to.be.equal(secondObjectToBeCached);
                    return callback(args, undefined);
                },
                rqCaching.pop,
                function (callback, args) {
                    expect(args).to.be.equal(secondObjectToBeCached);
                    expect(rqCaching._getStack().length).to.be.equal(1);
                    expect(rqCaching._getStack()[0]).to.be.equal(firstObjectToBeCached);
                    return callback(args, undefined);
                },
                rqCaching.pop,
                function (callback, args) {
                    expect(args).to.be.equal(firstObjectToBeCached);
                    expect(rqCaching._getStack().length).to.be.equal(0);
                    return callback(args, undefined);
                },
                rq.execute(done)

            ])(rq.vanillaExecutor);
        });
    });
});
