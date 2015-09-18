var fs = require('co-fs');
var FilePath = require('./fileMap').filePath;

module.exports = {
  realIp: function * (next) {
      this.req.ip = this.headers['x-forwarded-for'] || this.ip;
      yield *next;
  },

  handelError: function * (next) {
    try {
      yield * next;
    } catch (err) {
      this.status = err.status || 500;
      this.body = err.message;
      C.logger.error(err.stack);
      this.app.emit('error', err, this);
    }
  },

  loadRealPath: function *(next) {
    // router url format must be /api/(.*)
    this.request.fPath = FilePath(this.params[0]);
    C.logger.info(this.request.fPath);
    yield * next;
  },

  checkPathExists: function *(next) {
    // Must after loadRealPath
    if (!(yield fs.exists(this.request.fPath))) {
      this.status = 404;
      this.body = 'Path Not Exists!';
    }
    else {
      yield * next;
    }
  },

  checkPathNotExists: function *(next) {
    // Must after loadRealPath
    if (yield fs.exists(this.request.fPath)) {
      this.status = 400;
      this.body = 'Path Has Exists!';
    }
    else {
      yield * next;
    }
  }

};
