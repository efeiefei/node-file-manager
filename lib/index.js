#!/usr/bin/env node

var koa =require('koa');
var path = require('path');
var tracer = require('tracer');
var mount = require('koa-mount');
var morgan = require('koa-morgan');
var koaStatic = require('koa-static');

// Config
var argv = require('optimist')
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
    description: "Display This Help Message"
  })
  .option('host', {
    alias: 'H',
    'default': '127.0.0.1',
    description: 'Bind Address, defaults to loopback'
  })
  .option('token', {
    alias: 't',
    description: 'Require this bearer token on every request'
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
var Tools = require('./tools');

var startServer = function (app, port, host) {
  app.listen(port, host);
  C.logger.info('listening on ' + host + ':' + port);
};

var authToken = argv.token || process.env.FM_TOKEN;
var host = argv.host;
var loopback = host === '127.0.0.1' || host === '::1' || host === 'localhost';
if (!loopback && !authToken) {
  C.logger.error('Refusing to listen on ' + host + ' without a token. Set --token/FM_TOKEN or bind to a loopback address.');
  process.exit(1);
}

var app = koa();
app.proxy = true;
app.use(Tools.handelError);
app.use(Tools.realIp);
app.use(morgan.middleware(C.morganFormat));
if (authToken) {
  app.use(Tools.requireAuth(authToken));
}

var IndexRouter = require('./routes');
app.use(mount('/', IndexRouter));
app.use(koaStatic(path.join(__dirname,'./public/')));

startServer(app, +argv.port, host);

