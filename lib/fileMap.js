var path = require('path');

var DATA_ROOT = C.data.root;

exports.filePath = function (relPath) {
  if (relPath.indexOf('..') >= 0){
    var e = new Error('Do Not Contain .. in relPath!');
    e.status = 400;
    throw e;
  }
  else {
    return path.join(DATA_ROOT, relPath);
  }
};