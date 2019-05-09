/* jshint loopfunc:true */
/* global describe:true, beforeEach:true, afterEach:true, it:true */

var chan   = require('..')
var expect = require('expect.js')

describe('Channel select', function () {
  var random
  beforeEach(function (done) {
    // save Math.random
    random = Math.random
    done()
  })

  afterEach(function (done) {
    // restore Math.random
    Math.random = random
    done()
  })

  it(
    'should be able to select on channels',
    function (done) {
      var ch1 = chan()
      var ch2 = chan()
      chan.select(ch1, ch2)(function (err, ch) {
        expect(ch).to.equal(ch2)
        ch2.selected(function (err, val) {
          expect(val).to.equal(42)
          done()
        })
      })
      ch2(42)
    }
  )

  it(
    'should be able to select on multiple channels',
    function (done) {
      var chs = [chan(), chan()]
      var remaining = chs.length
      chs.forEach(function (needle, i) {
        chan.select.apply(null, chs)(function (err, ch) {
          expect(ch).to.equal(needle)
          ch.selected(function (err, val) {
            expect(val).to.equal(i*10)
            if (--remaining === 0) {
              done()
            }
          })
        })
      })
      chs.forEach(function (ch, i) {
        ch(i*10)
      })
    }
  )

  it(
    'should be able to select with queued messages',
    function (done) {
      var chs = [chan(), chan()]
      var remaining = chs.length
      var i = -1
      while (++i < 10) {
        (function (i) {
          chan.select.apply(null, chs)(function (err, ch) {
            expect(ch).to.equal(chs[0])
            ch.selected(function (err, val) {
              expect(val).to.equal(i * 10)
              if (--remaining === 0) {
                done()
              }
            })
          })
        })(i)
      }
      var j = -1
      while (++j < 10) {
        chs[0](j * 10)
      }
    }
  )

  it(
    'should be able to select with existing messages on the channels',
    function (done) {
      var ch1 = chan()
      var ch2 = chan()
      ch2(42)
      chan.select(ch1, ch2)(function (err, ch) {
        expect(ch).to.equal(ch2)
        ch2.selected(function (err, val) {
          expect(val).to.equal(42)
          done()
        })
      })
    }
  )

  it(
    'should randomly choose a channel to return with multiple full channels',
    function (done) {
      var ch1 = chan()
      var ch2 = chan()

      // force the random selection to be the second channel
      Math.random = function () { return 0.5 }

      // fill up both the channels
      ch1(21)
      ch2(42)

      // random selection should choose the second channel "randomly"
      chan.select(ch1, ch2)(function (err, ch) {
        expect(ch).to.equal(ch2)
        ch2.selected(function (err, val) {
          expect(val).to.equal(42)
          done()
        })
      })
    }
  )

  it (
    'should wait for previously queued callbacks before selecting',
    function (done) {
      var ch1 = chan()
      var ch2 = chan()

      // queue a callback for ch1
      ch1(function () {})

      chan.select(ch1, ch2)(function (err, ch) {
        expect(ch).to.be(ch2)
        done()
      })

      ch1(74)
      ch2(47)
    }
  )
})
