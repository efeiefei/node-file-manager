const fs = require('fs-extra');
const path = require('path');
const JSZip = require('jszip');

const FileManager = {};

FileManager.getStats = async p => {
  const stats = fs.statSync(p);
  return {
    folder: stats.isDirectory(),
    size: stats.size,
    mtime: stats.mtime.getTime()
  }
};

FileManager.list = async dirPath => {
  const files = await fs.readdir(dirPath);
  const stats = [];
  for (let i = 0; i < files.length; ++i) {
    const fPath = path.join(dirPath, files[i]);
    const stat = await FileManager.getStats(fPath);
    stat.name = files[i];
    stats.push(stat);
  }
  return stats;
};

FileManager.remove = async p => {
  await fs.remove(p);
};

FileManager.mkdirs = async dirPath => {
  await fs.mkdirs(dirPath);
};

FileManager.move = async (srcs, dest) => {
  for (let i = 0; i < srcs.length; ++i) {
    const basename = path.basename(srcs[i]);
    await fs.move(srcs[i], path.join(dest, basename));
  }
};

FileManager.rename = async (src, dest) => {
  await fs.move(src, dest);
};

FileManager.archive = async (src, archive, dirPath, embedDirs) => {
  const zip = new JSZip();
  const baseName = path.basename(archive, '.zip');

  const addFile = async file => {
    const data = await fs.readFile(file);
    let name;
    if (embedDirs) {
      name = file;
      if (name.indexOf(dirPath) === 0) {
        name = name.substring(dirPath.length);
      }
    } else {
      name = path.basename(file);
    }
    zip.file(name, data);
    C.logger.info('Added ' + name + ' ' + data.length + ' bytes to archive ' + archive);
  }

  const addDir = async dir => {
    const contents = await fs.readdir(dir);
    for (const file of contents) {
      await process(path.join(dir, file));
    }
  }

  const process = async fp => {
    const stat = await fs.stat(fp);
    if (stat.isDirectory()) {
      await addDir(fp);
    } else {
      await addFile(fp);
    }
  }

  // Add each src.  For directories, do the entire recursive dir.
  for (const file of src) {
    await process(file);
  }

  // Generate the zip and store the final.
  const data = await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'});
  await fs.writeFile(archive, data, 'binary');
};

module.exports = FileManager;
