/*!
 * morgan
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2014 Douglas Christopher Wilson
 * Copyright(c) 2015 Fangdun Cai
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var thenify = require('thenify');
var originalMorgan = require('morgan');

/**
 * Expose `morgan`.
 */

module.exports = originalMorgan;

originalMorgan.middleware = morgan;

/**
 * morgan wrapper.
 */

function morgan() {
  var middleware = thenify(originalMorgan.apply(null, arguments));
  return function* morgan(next) {
    yield* next;
    yield middleware(this.req, this.res);
  }
}