/* jshint expr:true */
/* global describe:true, beforeEach:true, afterEach:true, it:true */

var async  = require('../lib/async')
var should = require('should')
var sinon  = require('sinon')

describe('Async helper', function () {

  var err = {}
  var val = {}
  var ch
  var fn

  beforeEach(function () {
    ch = sinon.stub().returns(function (cb) { cb() })
    fn = sinon.stub().yields(err, val)
  })

  it(
    'should return a function with an arity of 1',
    function () {
      var thunk = async(ch, fn)
      thunk.should.be.a.Function
      thunk.length.should.be.exactly(1)
    }
  )

  it(
    'should call fn with args plus a callback',
    function () {
      async(ch, fn, 1, 2, 3, 'foo')
      var argsWithoutCb = fn.firstCall.args.slice(0, -1)
      argsWithoutCb.should.eql([1, 2, 3, 'foo'])
    }
  )

  it(
    'should call a method of an object with the third argument as the name',
    function () {
      var ob = { foo: fn }
      async(ch, ob, 'foo', 1, 2, 3)
      var argsWithoutCb = fn.firstCall.args.slice(0, -1)
      argsWithoutCb.should.eql([1, 2, 3])
      fn.firstCall.calledOn(ob).should.be.true
    }
  )

  it(
    'should call channel with arguments of the async function callback',
    function () {
      async(ch, fn)
      ch.firstCall.args.length.should.be.exactly(2)
      ch.firstCall.args[0].should.be.exactly(err)
      ch.firstCall.args[1].should.be.exactly(val)
    }
  )

  it(
    'should call callback given to returned function',
    function (done) {
      var cb = sinon.spy()
      async(ch, fn)(cb)
      setImmediate(function () {
        cb.callCount.should.be.exactly(1)
        done()
      })
    }
  )

})
