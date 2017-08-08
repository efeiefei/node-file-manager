const fs = require('fs-extra');
const path = require('path');
const koaRouter = require('koa-router');
const koaBody = require('koa-body');
const koaStatic = require('koa-static');

const Tools = require('./tools');
const FilePath = require('./fileMap').filePath;
const FileManager = require('./fileManager');

const router = new koaRouter();

router.get('/', async (ctx, next) => {
  ctx.body = await fs.readFile(path.join(__dirname, './views/files.html'));
  ctx.set('Content-Type', 'text/html');
  await next();
});

const handleGet = async (ctx, next) => {
  const p = ctx.req.fPath;
  const stats = await fs.stat(p);
  if (stats.isDirectory()) {
    ctx.body = await FileManager.list(p);
  } else {
    ctx.body = fs.createReadStream(p);
  }
  await next();
};

const handlePost = async (ctx, next) => {
  const type = ctx.query.type;
  const p = ctx.req.fPath;
  const { files, src, embedDirs } = ctx.request.body;
  if (!type) {
    ctx.status = 400;
    ctx.body = 'Lack Arg Type!';
  } else if (type === 'CREATE_FOLDER') {
    await FileManager.mkdirs(p);
    ctx.body = 'Create Folder Succeed!';
  } else if (type === 'UPLOAD_FILE') {
    if (files) {
      const file = files.upload;
      const is = fs.createReadStream(file.path);
      const os = fs.createWriteStream(p);
      is.pipe(os);
      is.on('end', async () => {
        await fs.unlink(file.path);
      });
      ctx.body = 'Upload File Succeed!';
    } else {
      ctx.status = 400;
      ctx.body = 'Lack Upload File!';
    }
  } else if (type === 'CREATE_ARCHIVE') {
    if (!src) {
      return ctx.status = 400;
    }
    const srcPath = src.map(function(file) {
      return FilePath(file, true);
    });
    await FileManager.archive(srcPath, p, C.data.root, !!embedDirs);
    ctx.body = 'Create Archive Succeed!';
  } else {
    ctx.status = 400;
    ctx.body = 'Arg Type Error!';
  }
  await next();
};

const handlePut = async (ctx, next) => {
  const type = ctx.query.type;
  const p = ctx.req.fPath;
  const { src, target } = ctx.request.body;
  if (!type) {
    ctx.status = 400;
    ctx.body = 'Lack Arg Type'
  } else if (type === 'MOVE') {
    if (!src || !(src instanceof Array)) {
      return ctx.status = 400;
    }
    const srcPath = src.map(relPath => FilePath(relPath, true));
    await FileManager.move(srcPath, p);
    ctx.body = 'Move Succeed!';
  } else if (type === 'RENAME') {
    if (!target) {
      return ctx.status = 400;
    }
    await FileManager.rename(p, FilePath(target, true));
    ctx.body = 'Rename Succeed!';
  } else {
    ctx.status = 400;
    ctx.body = 'Arg Type Error!';
  }
  await next();
};

const handleDelete = async (ctx, next) => {
  await FileManager.remove(ctx.req.fPath);
  ctx.body = 'Delete Succeed!';
};

router.get(/^\/api\/(?:.*)/, Tools.loadRealPath, Tools.checkPathExists, handleGet);
router.post(/^\/api\/(?:.*)/, Tools.loadRealPath, Tools.checkPathNotExists, koaBody({
  multipart: true
}), handlePost);
router.put(/^\/api\/(?:.*)/, Tools.loadRealPath, Tools.checkPathExists, koaBody(), handlePut);
router.delete(/^\/api\/(?:.*)/, Tools.loadRealPath, Tools.checkPathExists, koaBody(), handleDelete);

module.exports = router;
