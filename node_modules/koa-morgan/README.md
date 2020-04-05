# koa-morgan

> HTTP request logger middleware for koa.  
> [morgan] wrapper for koa's middleware.

[![NPM version][npm-img]][npm-url]
[![Build status][travis-img]][travis-url]
[![Test coverage][coveralls-img]][coveralls-url]
[![License][license-img]][license-url]
[![Dependency status][david-img]][david-url]

## Install

```sh
$ npm install --save koa-morgan
```

## Usage

Adding this into your koa server file:

```js
var koa = require('koa');
var morgan = require('koa-morgan');
var app = koa();

app.use(morgan.middleware(format, options));

```

## API

* **morgan**

* **morgan.middleware(format, options)**:
> Just **morgan** wrapper, returns a GeneratorFunction.

[npm-img]: https://img.shields.io/npm/v/koa-morgan.svg?style=flat-square
[npm-url]: https://npmjs.org/package/koa-morgan
[travis-img]: https://img.shields.io/travis/koa-modules/morgan.svg?style=flat-square
[travis-url]: https://travis-ci.org/koa-modules/morgan
[coveralls-img]: https://img.shields.io/coveralls/koa-modules/morgan.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/koa-modules/morgan?branch=master
[license-img]: https://img.shields.io/badge/license-MIT-green.svg?style=flat-square
[license-url]: LICENSE
[david-img]: https://img.shields.io/david/koa-modules/morgan.svg?style=flat-square
[david-url]: https://david-dm.org/koa-modules/morgan
[morgan]: https://github.com/expressjs/morgan