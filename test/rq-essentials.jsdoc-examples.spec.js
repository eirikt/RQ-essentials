/* global require:false, describe:false, it:false, beforeEach:false, afterEach:false */
/* jshint -W030 */

var expect = require('chai').expect,
    __ = require('underscore'),
    RQ = require('async-rq'),
    rq = require('./../rq-essentials'),
    rqExpress = require('./../rq-essentials-express4'),
    run = rqExpress.vanillaExecutor;


describe('RQ-essentials, test/specification of JSDoc examples', function () {
    'use strict';


    describe('identityFactory examples', function () {
        it('should provide a working usage example, #1', function (done) {
            RQ.sequence([
                rq.value(Math.PI),
                function (callback, args) {
                    expect(args).to.be.equal(Math.PI);
                    done();
                }
            ])(run);
        });

        it('should provide a working usage example, #2', function (done) {
            RQ.sequence([
                RQ.parallel([
                    rq.value(Math.random),
                    rq.value(Math.random)
                ]),
                function (callback, args) {
                    expect(args).to.be.an('array');
                    expect(args.length).to.be.equal(2);
                    done()
                }
            ])(run);
        });

        it('should provide a working usage example, #2', function (done) {
            RQ.sequence([
                RQ.parallel([
                    rq.value(1),
                    rq.value(2),
                    rq.value(3),
                    rq.value(4)
                ]),
                function (callback, args) {
                    expect(args).to.be.an('array');
                    expect(args.length).to.be.equal(4);
                    expect(args[0]).to.be.equal(1);
                    expect(args[1]).to.be.equal(2);
                    expect(args[2]).to.be.equal(3);
                    expect(args[3]).to.be.equal(4);
                    callback(args);
                },
                rq.undefined, // Just to deliver no argument to done function
                rq.then(done)
            ])(run);
        });
    });


    describe('requestorFactory examples', function () {
        it('should provide a working usage example, #1', function (done) {
            RQ.sequence([
                rq.value(13.49),
                rq.then(Math.round),
                function (callback, args) {
                    expect(args).to.be.equal(13);
                    expect(args).to.be.equal(Math.round(13.48));
                    done();
                }
            ])(run);
        });
    });


    describe('nullRequestor examples', function () {
        it('should provide a working usage example, #1', function (done) {
            RQ.sequence([
                rq.undefined,
                function (callback, args) {
                    expect(args).to.be.undefined;
                    callback(args);
                },
                rq.then(done)
            ])(run);
        });
    });
});
