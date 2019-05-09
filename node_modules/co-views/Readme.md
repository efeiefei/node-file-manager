# co-views

  Template rendering for [co](https://github.com/tj/co) using
  [co-render](https://github.com/tj/co-render). This module
  provides higher level sugar than co-render to reduce redundancy,
  for example specifying a views directory and default extension name.

## Installation

```
$ npm install co-views
```

 And install whichever engine(s) you use:

```
$ npm install ejs jade
```

## Options

 - `map` an object mapping extension names to engine names [`{}`]
 - `default` default extension name to use when missing [`html`]
 - `cache` cached compiled functions [NODE_ENV != 'development']

### map

  For example if you wanted to use "swig" for .html files
  you would simply pass:

```js
{ map: { html: 'swig' } }
```

### default

  Set the default template extension when none is passed to
  the render function. This defaults to "html". For example
  if you mostly use Jade, then you'd likely want to assign
  this to:

```js
{ default: 'jade' }
```

  Allowing you to invoke `render('user')` instead of
  `render('user.jade')`.

### cache

  When __true__ compiled template functions will be cached in-memory,
  this prevents subsequent disk i/o, as well as the additional compilation
  step that most template engines peform. By default this is _enabled_
  when the __NODE_ENV__ environment variable is anything _but_ "development",
  such as "stage" or "production".

## Example

  Render several users with different template engines in parallel. View
  lookup is performed relative to the `./examples` directory passed,
  and the "swig" engine is mapped to ".html" files.

```js
var co = require('co');
var views = require('co-views');

var render = views('examples', {
  map: { html: 'swig' }
});

var tobi = {
  name: 'tobi',
  species: 'ferret'
};

var loki = {
  name: 'loki',
  species: 'ferret'
};

var luna = {
  name: 'luna',
  species: 'cat'
};

co(function *(){
  var a = render('user', { user: tobi });
  var b = render('user.jade', { user: loki });
  var c = render('user.ejs', { user: luna });
  var html = yield [a, b, c];
  html = html.join('');
  console.log(html);
});
```

## App-wide views

  Dependending on your choice of application structure, you may wish to
  share these same settings between all of your application, instead of
  constantly initializing co-views. To do this simply create a `views.js`
  module and export the render function returned:

```js
var views = require('co-views');

module.exports = views('views', {
  map: {
    html: 'swig',
    md: 'hogan'
  }
});
```

# License

  MIT
