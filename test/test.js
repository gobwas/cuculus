var assert = require('assert');
var cuculus = require('../index');
var expect = require('chai').expect;
var sinon = require('sinon');


describe('cuculus', function () {
	var fs;

	beforeEach(function() {
		fs = require('fs');
		delete require.cache[require.resolve('fs')];
	});

	afterEach(function() {
		delete require.cache[require.resolve('fs')];
	});

	describe("#replace", function() {
		it('should throw error when module not exists', function() {
			// when
			var fn = function() { cuculus.replace('fff'); };

			// then
			expect(fn).to.throw('Could not modify non existing module "fff"');
		});

		it('should replace original module', function () {
			var stub = {};

			// when
			cuculus.replace("fs", stub);

			// then
			expect(require("fs")).equal(stub);
		});
	});

	describe("#modify", function() {
		it('should throw error when module not exists', function() {
			// when
			var fn = function() { cuculus.modify('fff'); };

			// then
			expect(fn).to.throw('Could not modify non existing module "fff"');
		});

		it('should call replacer with original module', function() {
			var replacer, stub;

			// before
			replacer = sinon.spy(function(original) {
				return (stub = {});
			});

			// when
			cuculus.modify("fs", replacer);

			// then
			expect(replacer.callCount).equal(1);
			expect(replacer.firstCall.calledWithExactly(fs));
			expect(require("fs")).equal(stub);
		});
	});

	describe('#restore', function() {
		it('should restore original value', function() {
			var spy;

			// before
			spyA = sinon.spy();
			spyB = sinon.spy();

			// when
			cuculus.modify("fs", function(current, onRestore) {
				onRestore(spyA);
				return {};
			});
			cuculus.modify("fs", function(current, onRestore) {
				onRestore(spyB);
				return {};
			});
			cuculus.restore("fs");

			// then
			expect(require("fs")).equal(fs);
			expect(spyA.callCount).equal(1);
			expect(spyB.callCount).equal(1);
			expect(spyB.calledBefore(spyA)).to.be.true;
		});
	});
});
