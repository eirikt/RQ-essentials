/* global require:false, describe:false, it:false, beforeEach:false, afterEach:false, JSON:false */

var sinon = require('sinon'),
    expect = require('chai').expect,
    RQ = require('async-rq'),
    rq = require('./../rq-essentials'),
    rqExpress = require('./../rq-essentials-express4'),
    run = rqExpress.vanillaExecutor,
    rqLogging = require('./../rq-essentials-logging'),
    log = rqLogging.loggerFactory;


describe('RQ-essentials: Logging', function () {
    'use strict';

    beforeEach(function () {
        sinon.spy(console, 'log');
    });

    afterEach(function () {
        console.log.restore();
    });


    it('should exist', function () {
        expect(rqLogging).to.exist;
        expect(rqLogging).to.be.an('object');
    });


    describe('Log function', function () {
        it('should exist', function () {
            expect(rqLogging.loggerFactory).to.exist;
            expect(rqLogging.loggerFactory).to.be.a('function');
        });


        it('should not have formal arguments (arguments handled through introspection)', function () {
            expect(rqLogging.loggerFactory.length).to.be.equal(0);
        });


        it('should call console.log', function (done) {
            RQ.sequence([
                log('Hello!'),
                function (callback, args) {
                    expect(console.log.calledOnce).to.be.true;
                    expect(console.log.calledWith('Hello!')).to.be.true;
                    done();
                }
            ])(run);
        });


        it('should stringify objects before calling console.log', function (done) {
            var objectToLog = {
                name: 'Johnny',
                profession: 'Crazy'
            };
            RQ.sequence([
                log(objectToLog),
                function (callback, args) {
                    expect(console.log.calledWith(JSON.stringify(objectToLog))).to.be.true;
                    done();
                }
            ])(run);
        });


        it('should handle empty invocations', function (done) {
            RQ.sequence([
                log(),
                function (callback, args) {
                    expect(console.log.calledOnce).to.be.true;
                    expect(console.log.calledWith()).to.be.true;
                    callback(args, undefined);
                },
                function (callback, args) {
                    expect(args).to.be.undefined;
                    done();
                }
            ])(run);
        });


        it('should include passed on argument in log message with placeholder ${}', function (done) {
            RQ.sequence([
                rq.value('World!'),
                log('Hello ${}'),
                function (callback, args) {
                    expect(console.log.calledWith('Hello World!')).to.be.true;
                    done();
                }
            ])(run);
        });


        it('should include passed on argument (stringified) in log message with placeholder ${}', function (done) {
            var objectToLog = {
                name: 'Johnny',
                profession: 'Crazy'
            };
            RQ.sequence([
                rq.value(objectToLog),
                log('Hello to: ${args}'),
                function (callback, args) {
                    expect(console.log.calledWith('Hello to: ' + JSON.stringify(objectToLog))).to.be.true;
                    done();
                }
            ])(run);
        });


        it('should include passed on argument in between log message with placeholder ${}', function (done) {
            RQ.sequence([
                rq.value('World!'),
                log('Hello ${args} Say it again!'),
                function (callback, args) {
                    expect(console.log.calledWith('Hello World! Say it again!')).to.be.true;
                    done();
                }
            ])(run);
        });


        it('should not mutate nor alter callback arguments passed 1', function (done) {
            RQ.sequence([
                rq.value('Hello!'),
                log(),
                function (callback, args) {
                    expect(args).to.be.equal('Hello!');
                    done();
                }
            ])(run);
        });


        it('should not mutate nor alter callback arguments passed 2', function (done) {
            RQ.sequence([
                rq.value('Hello!'),
                log('Yo!'),
                function (callback, args) {
                    expect(args).to.be.equal('Hello!');
                    done();
                }
            ])(run);
        });


        it('should not mutate nor alter callback arguments passed 3', function (done) {
            RQ.sequence([
                rq.value('World!'),
                log('Hello ${} And again!'),
                function (callback, args) {
                    expect(args).to.be.equal('World!');
                    done();
                }
            ])(run);
        });


        it('should not mutate nor alter callback arguments passed 4', function (done) {
            var objectToLog = {
                name: 'Johnny',
                profession: 'Crazy'
            };
            RQ.sequence([
                rq.value(objectToLog),
                log('Hello to: ${args}'),
                function (callback, args) {
                    expect(args).to.be.deep.equal(objectToLog);
                    done();
                }
            ])(run);
        });
    });
});
