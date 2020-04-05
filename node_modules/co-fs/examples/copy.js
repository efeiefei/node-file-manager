
var co = require('co');
var fs = require('..');

copy('.', 'examples/dest', function(err){
  if (err) throw err;
  console.log('done');
});

function copy(src, dst, fn) {
  co(function *(){
    var files = yield fs.readdir(src);

    yield fs.mkdir(dst);

    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var stat = yield fs.stat(file);
      if (!stat.isFile()) continue;
      var buf = yield fs.readFile(file);
      console.log('copy %s -> %s', src + '/' + file, dst + '/' + file);
      yield fs.writeFile(dst + '/' + file, buf);
    }

  })(fn);
}
