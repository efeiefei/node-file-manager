const path = require('path');

const DATA_ROOT = C.data.root;

exports.filePath = (relPath, decodeURI) => {
  if (decodeURI) {
    relPath = decodeURIComponent(relPath);
  }
  if (relPath.indexOf('..') >= 0) {
    const e = new Error('Do Not Contain .. in relPath!');
    e.status = 400;
    throw e;
  } else {
    return path.join(DATA_ROOT, relPath);
  }
};
