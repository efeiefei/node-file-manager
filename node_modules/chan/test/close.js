/* global describe:true, beforeEach:true, it:true */

var chan   = require('..')
var expect = require('expect.js')

describe('A closed channel', function () {

  it(
    'should yield an error when attempting to add a value',
    function () {
      var ch = chan()
      ch.close()
      ch('foo')(function (err) {
        expect(err).to.be.an(Error)
      })
    }
  )

  describe('that is has items in the buffer', function () {

    it(
      'should return `false` when the `done()` method is called',
      function () {
        var ch = chan(1)
        ch('foo')
        ch.close()
        expect(ch.done()).to.be(false)
      }
    )

  })

  describe('that is empty', function () {

    it(
      'should invoke peding callbacks with empty value',
      function () {
        var ch = chan()
        ch(function (err, value) {
          expect(value).to.be(ch.empty)
        })
        ch.close()
      }
    )

    it(
      'should return `true` when the `done()` method is called',
      function () {
        var ch = chan()
        ch.close()
        expect(ch.done()).to.be(true)
      }
    )

    it(
      'should immediately invoke any callback added with the empty value',
      function () {
        var ch = chan()
        ch.close()
        ch(function (err, value) {
          expect(value).to.be(ch.empty)
        })
      }
    )

  })

})
