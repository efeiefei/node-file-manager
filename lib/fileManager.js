var fs = require('co-fs');
var co = require('co');
var fse = require('co-fs-extra');
var path = require('path');
var JSZip = require('jszip');

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

FileManager.archive = function *(dirPath, archive, src, embedDirs) {
  var zip = new JSZip();
  var baseName = slashify(path.basename(archive, '.zip'));

  function slashify(f) {
    if (!f.endsWith('/')) {
      f += '/';
    }
    return f;
  }

  function* addFile(file) {
    var data = yield fs.readFile(file);
    var name = embedDirs ? baseName + file : path.basename(file);
    zip.file(name, data);
    console.log('Added ' + name + ' ' + data.length + ' bytes to archive ' + archive);
  }

  function* addDir(dir) {
    var contents = yield fs.readdir(dir);
    for (var file of contents) {
      yield * process(slashify(dir) + file);
    }
  }

  function* process(fp) {
    var stat = yield fs.stat(fp);
    if (stat.isDirectory()) {
      yield * addDir(fp);
    } else {
      yield addFile(fp);
    }
  }

  // Add each src.  For directories, do the entire recursive dir.
  for (var file of src) {
    yield * process(file.replace(/^\//, ''));
  }

  // Generate the zip and store the final.
  var data = yield zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'});
  yield fs.writeFile(archive, data, 'binary');
};

module.exports = FileManager;
