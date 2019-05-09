
var co = require('co');
var fs = require('..');
var assert = require('assert');

describe('.exists()', function(){
  it('should work', function(done){
    co(function *(){
      var ret = yield fs.exists('test/fixtures/msg.txt');
      assert(true === ret);

      var ret = yield fs.exists('test/fixtures');
      assert(true === ret);

      var ret = yield fs.exists('test/fixtures/hey');
      assert(false === ret);
    })(done);
  })
})

describe('.createReadStream()', function(){
  it('should work', function(done){
    co(function *(){
      var read = fs.createReadStream('test/fixtures/msg.txt');
      assert('hello\n' == (yield read()).toString());
    })(done);
  })
})

describe('others', function(){
  it('should be wrapped', function(done){
    co(function *(){
      var ret = yield fs.stat('test/fixtures/msg.txt');
      assert(ret.size);

      var ret = yield fs.readFile('test/fixtures/msg.txt');
      assert(Buffer.isBuffer(ret));

      var ret = yield fs.readFile('test/fixtures/msg.txt', 'utf8');
      assert('hello\n' == ret);
    })(done);
  })
})
