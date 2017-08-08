#!/usr/bin/env node

const path = require('path');
const koa = require('koa');
const tracer = require('tracer');
const morgan = require('koa-morgan');
const koaStatic = require('koa-static');

const dev = process.env.NODE_ENV !== 'production';

// Config
const argv = require('optimist')
  .usage([
    'USAGE: $0 [-p <port>] [-d <directory>]']
  )
  .option('port', {
    alias: 'p',
    'default': 5000,
    description: 'Server Port'
  })
  .option('directory', {
    alias: 'd',
    description: 'Root Files Directory'
  })
  .option('version', {
    alias: 'v',
    description: 'Server　Version'
  })
  .option('help', {
    alias: 'h',
    description: 'Display This Help Message'
  })
  .argv;

if (argv.help) {
  require('optimist').showHelp(console.log);
  process.exit(0);
}

if (argv.version) {
  console.log('FileManager', require('./package.json').version);
  process.exit(0);
}

global.C = {
  data: {
    root: argv.directory || path.dirname('.')
  },
  logger: require('tracer').console({level: 'info'}),
  morganFormat: ':date[iso] :remote-addr :method :url :status :res[content-length] :response-time ms'
};

// Start Server
const Tools = require('./tools');

const app = new koa();
app.proxy = true;
app.use(Tools.realIp);
app.use(Tools.handelError);
app.use(morgan(C.morganFormat));

const router = require('./routes');
app.use(router.routes()).use(router.allowedMethods());
app.use(koaStatic(path.join(__dirname,'./public/')));
app.listen(+argv.port, err => {
  if (err) {
    throw err;
  }
  C.logger.info('listening on *.' + argv.port);
});
