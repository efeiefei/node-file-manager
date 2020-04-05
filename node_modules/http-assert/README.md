# http-assert

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Node.js Version][node-version-image]][node-version-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]

Assert with status codes. Like ctx.throw() in Koa, but with a guard.

## Install

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/). Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
$ npm install http-assert
```

## Example
```js
var assert = require('http-assert')
var ok = require('assert')

var username = 'foobar' // username from request

try {
  assert(username === 'fjodor', 401, 'authentication failed')
} catch (err) {
  ok(err.status === 401)
  ok(err.message === 'authentication failed')
  ok(err.expose)
}
```

## API

The API of this module is intended to be similar to the
[Node.js `assert` module](https://nodejs.org/dist/latest/docs/api/assert.html).

Each function will throw an instance of `HttpError` from
[the `http-errors` module](https://www.npmjs.com/package/http-errors)
when the assertion fails.

### assert(value, [status], [message], [properties])

Tests if `value` is truthy. If `value` is not truthy, an `HttpError`
is thrown that is constructed with the given `status`, `message`,
and `properties`.

### assert.deepEqual(a, b, [status], [message], [properties])

Tests for deep equality between `a` and `b`. Primitive values are
compared with the Abstract Equality Comparison (`==`). If `a` and `b`
are not equal, an `HttpError` is thrown that is constructed with the
given `status`, `message`, and `properties`.

### assert.equal(a, b, [status], [message], [properties])

Tests shallow, coercive equality between `a` and `b` using the Abstract
Equality Comparison (`==`). If `a` and `b` are not equal, an `HttpError`
is thrown that is constructed with the given `status`, `message`,
and `properties`.

### assert.notDeepEqual(a, b, [status], [message], [properties])

Tests for deep equality between `a` and `b`. Primitive values are
compared with the Abstract Equality Comparison (`==`). If `a` and `b`
are equal, an `HttpError` is thrown that is constructed with the given
`status`, `message`, and `properties`.

### assert.notEqual(a, b, [status], [message], [properties])

Tests shallow, coercive equality between `a` and `b` using the Abstract
Equality Comparison (`==`). If `a` and `b` are equal, an `HttpError` is
thrown that is constructed with the given `status`, `message`, and
`properties`.

### assert.notStrictEqual(a, b, [status], [message], [properties])

Tests strict equality between `a` and `b` as determined by the SameValue
Comparison (`===`). If `a` and `b` are equal, an `HttpError` is thrown
that is constructed with the given `status`, `message`, and `properties`.

### assert.ok(value, [status], [message], [properties])

Tests if `value` is truthy. If `value` is not truthy, an `HttpError`
is thrown that is constructed with the given `status`, `message`,
and `properties`.

### assert.strictEqual(a, b, [status], [message], [properties])

Tests strict equality between `a` and `b` as determined by the SameValue
Comparison (`===`). If `a` and `b` are not equal, an `HttpError`
is thrown that is constructed with the given `status`, `message`,
and `properties`.

## Licence

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/http-assert.svg
[npm-url]: https://npmjs.org/package/http-assert
[node-version-image]: https://img.shields.io/node/v/http-assert.svg
[node-version-url]: https://nodejs.org/en/download/
[travis-image]: https://img.shields.io/travis/jshttp/http-assert/master.svg
[travis-url]: https://travis-ci.org/jshttp/http-assert
[coveralls-image]: https://img.shields.io/coveralls/jshttp/http-assert/master.svg
[coveralls-url]: https://coveralls.io/r/jshttp/http-assert
[downloads-image]: https://img.shields.io/npm/dm/http-assert.svg
[downloads-url]: https://npmjs.org/package/http-assert
