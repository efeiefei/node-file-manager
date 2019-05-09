
var co = require('co');
var fs = require('..');

co(function *(){
  yield fs.mkdir('examples/apps');

  for (var i = 0; i < 3; ++i) {
    console.log('creating app %s', i);
    yield fs.mkdir('examples/apps/' + i);
    yield fs.writeFile('examples/apps/' + i + '/index.js', '');
    yield fs.writeFile('examples/apps/' + i + '/Makefile', '');
    yield fs.writeFile('examples/apps/' + i + '/Readme.md', '');
  }
});
