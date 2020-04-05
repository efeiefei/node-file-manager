
# co-render

  Template rendering for [co](https://github.com/tj/co) using [consolidate.js](https://github.com/tj/consolidate.js),
  providing support for dozens of template engines.

## Installation

```
$ npm install co-render
```

 And install whichever engine(s) you use:

```
$ npm install ejs jade
```

## Example

  Render several users with different template engines in parallel:

```js
var co = require('co');
var render = require('co-render');

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
  var a = render('examples/user.html', { user: tobi, engine: 'swig' });
  var b = render('examples/user.jade', { user: loki });
  var c = render('examples/user.ejs', { user: luna });
  var html = yield [a, b, c];
  html = html.join('');
  console.log(html);
});
```

# License

  MIT
