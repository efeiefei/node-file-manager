/* global describe:true, beforeEach:true, it:true */

var chan   = require('..')
var expect = require('expect.js')
var fs     = require('fs')

describe('Channel make', function () {

  it(
    'should return a channel function',
    function () {
      var ch = chan()
      expect(ch).to.be.a(Function)
    }
  )

})

describe('A channel', function () {

  var ch

  beforeEach(function () {
    ch = chan()
  })

  it(
    'should receive a value of any non-function type as the first argument',
    function () {
      var typeCases = [
        1,
        'foo',
        [1, 2 , 3],
        {foo: 'bar'},
        true,
        false,
        null,
        void 0
      ]
      typeCases.forEach(function (val) {
        ch(val)
        ch(function (err, result) {
          expect(result).to.be(val)
        })
      })
    }
  )

  it(
    'should receive a function value as a second argument if the first is null',
    function () {
      ch(null, function () {})
      ch(function (err, result) {
        expect(result).to.be.a(Function)
      })
    }
  )

  it(
    'should queue values until they are yielded/removed',
    function () {
      var values = [1, 2, 3, 4, 5]
      values.forEach(function (value) {
        ch(value)
      })
      values.forEach(function (value) {
        ch(function (err, result) {
          expect(result).to.be(value)
        })
      })
    }
  )

  it(
    'should queue callbacks until values are added',
    function () {
      var values = [1, 2, 3, 4, 5]
      values.forEach(function (value) {
        ch(function (err, result) {
          expect(result).to.be(value)
        })
      })
      values.forEach(function (value) {
        ch(value)
      })
    }
  )

  it(
    'should pass errors as the first argument to callbacks',
    function () {
      var e = new Error('Foo')
      ch(e)
      ch(function (err) {
        expect(err).to.be(e)
      })
    }
  )

  it(
    'should be useable directly as a callback for node style async functions',
    function (done) {
      ch(function (err, contents) {
        expect(err).to.be(null)
        expect(contents).to.be.a(Buffer)
        done()
      })
      fs.readFile(__filename, ch)
    }
  )

})
