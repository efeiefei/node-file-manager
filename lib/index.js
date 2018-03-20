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
    'USAGE: $0 [-p <port>] [-d <directory>] [--user <user>] [--password <password>]']
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
  .option('user', {
    description: "Username for basic http auth"
  })
  .option('password', {
    description: "Password for basic http auth"
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

if ((argv.user && !argv.password) || (argv.password && !argv.user)) {
  console.log('Both username and password are required to enable http auth')
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

var startServer = function (app, port) {
  app.listen(port);
  C.logger.info('listening on *.' + port);
};

var app = koa();

if (argv.user && argv.password) {
  var enableAuth = require('./auth')
  enableAuth(app, argv.user, argv.password)
}

app.proxy = true;
app.use(Tools.handelError);
app.use(Tools.realIp);
app.use(morgan.middleware(C.morganFormat));

var IndexRouter = require('./routes');
app.use(mount('/', IndexRouter));
app.use(koaStatic(path.join(__dirname,'./public/')));

startServer(app, +argv.port);

