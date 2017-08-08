const fs = require('fs-extra');
const FilePath = require('./fileMap').filePath;

const truncate = require('truncate-utf8-bytes');

const illegalRe = /[\?<>\\:\*\|":]/g;
const controlRe = /[\x00-\x1f\x80-\x9f]/g;
const reservedRe = /^\.+$/;
const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
const windowsTrailingRe = /[\. ]+$/;

function sanitize(input, replacement) {
  // Source: https://github.com/parshap/node-sanitize-filename
  const sanitized = input
    .replace(illegalRe, replacement)
    .replace(controlRe, replacement)
    .replace(reservedRe, replacement)
    .replace(windowsReservedRe, replacement)
    .replace(windowsTrailingRe, replacement);
  return truncate(sanitized, 255);
}

module.exports = {
  realIp: async (ctx, next) => {
    ctx.req.ip = ctx.req.headers['x-forwarded-for'] || ctx.ip;
    await next();
  },

  handelError: async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      ctx.res.statusCode = err.status || 500;
      ctx.body = err.message;
      C.logger.error(err.stack);
      ctx.app.emit('error', err, ctx);
    }
  },

  loadRealPath: async (ctx, next) => {
    // router url format must be /api/(.*)
    const idx = ctx.url.indexOf('?');
    const path = ctx.url.slice(4, idx > 0 ? idx : undefined);
    ctx.req.fPath = FilePath(sanitize(path || '/'));
    C.logger.info(ctx.req.fPath);
    await next();
  },

  checkPathExists: async (ctx, next) => {
    // Must after loadRealPath
    if (!await fs.exists(ctx.req.fPath)) {
      ctx.status = 404;
      ctx.body = 'Path Not Exists!';
    } else {
      await next();
    }
  },

  checkPathNotExists: async (ctx, next) => {
    // Must after loadRealPath
    if (await fs.exists(ctx.req.fPath)) {
      ctx.status = 400;
      ctx.body = 'Path Has Exists!';
    } else {
      await next();
    }
  }
};
