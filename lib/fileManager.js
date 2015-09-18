var fs = require('co-fs');
var co = require('co');
var fse = require('co-fs-extra');
var path = require('path');

var FileManager = {};

FileManager.getStats = function *(p) {
  var stats = yield fs.stat(p);
  return {
    folder: stats.isDirectory(),
    size: stats.size,
    mtime: stats.mtime.getTime()
  }
};

FileManager.list = function *(dirPath) {
  var files = yield fs.readdir(dirPath);
  var stats = [];
  for (var i=0; i<files.length; ++i) {
    var fPath = path.join(dirPath, files[i]);
    var stat = yield FileManager.getStats(fPath);
    stat.name = files[i];
    stats.push(stat);
  }
  return stats;
};

FileManager.remove = function *(p) {
  yield fse.remove(p);
};

FileManager.mkdirs = function *(dirPath) {
  yield fse.mkdirs(dirPath);
};

FileManager.move = function *(srcs, dest) {
  for (var i=0; i<srcs.length; ++i) {
    var basename = path.basename(srcs[i]);
    yield fse.move(srcs[i], path.join(dest, basename));
  }
};

FileManager.rename = function *(src, dest) {
  yield fse.move(src, dest);
};
module.exports = FileManager;
