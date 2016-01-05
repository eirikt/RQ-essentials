/* global require:false, describe:false, it:false, beforeEach:false, afterEach:false, JSON:false, console:false */
/* jshint -W030 */

var R = require('ramda'),
    expect = require('chai').expect,
    utils = require('./../utils');


describe('utils "clone"', function () {
    'use strict';

    it('should be a function', function () {
        expect(utils.clone).to.exist;
        expect(utils.clone).to.be.a.function;
    });

    it('should just return falsy values', function () {
        expect(utils.clone()).not.to.exist;
        expect(utils.clone(null)).to.be.null;
        expect(utils.clone(false)).to.be.false;
        expect(utils.clone(0)).to.be.equal(0);
        expect(utils.clone('')).to.be.equal('');
    });

    it('should clone arrays (of e.g. dates)', function () {
        var aDate = new Date(2014, 10, 25, 0, 0, 0);
        var anArray = [];

        anArray[0] = null;
        anArray[1] = aDate;
        anArray[2] = 'Something else';

        var aClonedArray = utils.clone(anArray);
        expect(aClonedArray[0]).to.be.null;
        expect(aClonedArray[1]).to.be.an.object;
        expect(aClonedArray[1].getTime()).to.be.equal(new Date(2014, 10, 25, 0, 0, 0).getTime());
        expect(aClonedArray[1]).to.be.equal(aDate);
        expect(aClonedArray[2]).to.be.equal('Something else');
    });
});


describe('utils "isFunction"', function () {
    'use strict';

    //it('should be a function', function () {
    //    expect(utils.isFunction).to.exist;
    //    expect(utils.isFunction).to.be.a.function;
    //});

    //it('...', function () {
    //    var n = 13,
    //        s = 'yo',
    //        f = function(x, y){
    //            return x + y;
    //        };
    //    expect(utils.isFunction(n)).to.be.false;
    //    expect(utils.isFunction(s)).to.be.false;
    //    expect(utils.isFunction(f)).to.be.true;
    //});

    it('what about ramda ...', function () {
        var n = 13,
            s = 'yo',
            f = function(x, y){
                return x + y;
            };
        expect(R.is(Function, n)).to.be.false;
        expect(R.is(Function, s)).to.be.false;
        expect(R.is(Function, f)).to.be.true;
    });
});


describe('utils "isMissing" factory function', function () {
    'use strict';

    it('should treat most falsey values as "missing"', function () {
        expect(utils.isMissing()()).to.be.true;
        expect(utils.isMissing(null)()).to.be.true;
        expect(utils.isMissing(false)()).to.be.true;

        // NB! But not:
        expect(utils.isMissing(0)()).to.be.false;
        expect(utils.isMissing({})()).to.be.false;
        expect(utils.isMissing([])()).to.be.false;
    });

    it('should treat blank strings as "missing"', function () {
        expect(utils.isMissing('')()).to.be.true;
        expect(utils.isMissing('  ')()).to.be.true;

        // Not:
        expect(utils.isMissing(' /t ')()).to.be.false;
        expect(utils.isMissing('yo')()).to.be.false;
    });
});


describe('Test "isEmpty" factory function', function () {
    'use strict';

    it('should treat most falsey values as empty', function () {
        expect(utils.isEmpty()()).to.be.true;
        expect(utils.isEmpty(null)()).to.be.true;
        expect(utils.isEmpty(false)()).to.be.true;
        expect(utils.isEmpty('')()).to.be.true;
        expect(utils.isEmpty('  ')()).to.be.true;

        // NB! But not:
        expect(utils.isEmpty(0)()).to.be.false;
    });

    it('should treat empty objects as, yes "empty"', function () {
        expect(utils.isEmpty({})()).to.be.true;
        expect(utils.isEmpty({})()).to.be.true;

        // Not:
        expect(utils.isEmpty({ myProp: 0 })()).to.be.false;
    });

    it('should treat empty arrays as, yes "empty"', function () {
        expect(utils.isEmpty([])()).to.be.true;

        // Not:
        expect(utils.isEmpty([false])()).to.be.false;
        expect(utils.isEmpty([0])()).to.be.false;
    });
});
