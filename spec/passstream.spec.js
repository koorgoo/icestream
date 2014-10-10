var async = require('async');
var assert = require('assert');
var PassStream = require('../lib/passstream');
var Writable = require('./writable');


describe('PassStream', function() {

  describe('_pass()', function() {
    var p = new PassStream();

    it('add element to _passers', function() {
      p._pass(0, PassStream._noop);
      p._pass(1, PassStream._noop);

      assert.equal(p._passers.length, 2);

      var a = p._passers[0];
      assert.equal(a.size, 0);
      assert.equal(a.callback, PassStream._noop);

      var b = p._passers[1];
      assert.equal(b.size, 1);
      assert.equal(b.callback, PassStream._noop);
    });
  });


  describe('_chunk()', function() {
    var p = new PassStream();

    it('add element to _chunkers', function() {
      p._chunk(0, PassStream._noop);
      p._chunk(1, PassStream._noop);

      assert.equal(p._chunkers.length, 2);

      var a = p._chunkers[0];
      assert.equal(a.size, 0);
      assert.equal(a.chunk.length, 0);
      assert.equal(a.transform, PassStream._noop);

      var b = p._chunkers[1];
      assert.equal(b.size, 1);
      assert.equal(b.chunk.length, 1);
      assert.equal(b.transform, PassStream._noop);
    });
  });


  describe('_processChunkers()', function() {
    var p = null;

    beforeEach(function() {
      p = new PassStream();
    });

    it('fill empty chunk fully', function() {
      p._chunk(1, p._noop);

      chunk = p._processChunkers(new Buffer([10, 20, 30, 40]));
      assert.equal(chunk.length, 3);  // [20, 30, 40]

      var a = p._chunkers[0];
      assert.deepEqual(a.chunk[0], 10);
      assert.equal(a.size, 0);
    });

    it('fill empty chunk partly', function() {
      p._chunk(2, p._noop);
      p._chunkers[0].chunk = new Buffer([0, 99]);

      chunk = p._processChunkers(new Buffer([10]));
      assert.equal(chunk.length, 0);  // []

      var slice = Array.prototype.slice;
      var a = p._chunkers[0];
      assert.deepEqual(slice.call(a.chunk), [10, 99]);
      assert.equal(a.size, 1);
    });

    it('fill partial chunk fully', function() {
      p._chunk(2, p._noop);
      p._chunkers[0].size = 1;
      p._chunkers[0].chunk = new Buffer([10, 0]);

      chunk = p._processChunkers(new Buffer([20, 30, 40]));
      assert.equal(chunk.length, 2);  // [30, 40]

      var slice = Array.prototype.slice;
      var a = p._chunkers[0];
      assert.deepEqual(slice.call(a.chunk), [10, 20]);
      assert.equal(a.size, 0);
    });

    it('do not change full chunk', function() {
      p._chunk(1, p._noop);
      p._chunkers[0].size = 0;

      chunk = p._processChunkers(new Buffer([20, 30, 40]));
      assert.equal(chunk.length, 3);  // [20, 30, 40]
    });
  });


  describe('_processPassers()', function() {
    var p = new PassStream();

    it('mark items to remove', function() {
      var pass1 = 1;
      var pass2 = 5;
      var data = 'test';

      p._pass(1, p._noop);
      p._pass(5, p._noop);
      p._processPassers(new Buffer(data));

      assert.ok(data.length < (pass1 + pass2));
      assert.equal(p._passers[0].remove, true);
      assert.equal(p._passers[1].remove, false);
    });
  });


  describe('_transform()', function() {
    var p, w;

    beforeEach(function() {
      p = new PassStream();
      w = new Writable();
      p.pipe(w);
    });

    afterEach(function() {
      p.end();
    });

    it('clear executed pass functions', function(done) {
      var transform = p._transform;

      p._transform = function(chunk, encoding, callback) {
        transform.apply(this, [chunk, encoding, callback]);
        assert.equal(this._passers.length, 0);
        done();
      };

      p._pass(3, function() {}).write(new Buffer('test'));
    });

    it('leave not executed pass functions', function(done) {
      var transform = p._transform;

      p._transform = function(chunk, encoding, callback) {
        transform.apply(this, [chunk, encoding, callback]);
        assert.equal(this._passers.length, 1);
        done();
      };

      var data = 'test';
      p._pass(data.length + 1, function() {}).write(new Buffer(data));
    });


    it('split chunk properly between chunk functions', function() {
      var lens = [];

      p._chunk(1, function(chunk, encoding, callback) {
        callback(null, chunk);
        lens.push(chunk.length);
      });

      p._chunk(2, function(chunk, encoding, callback) {
        callback(null, chunk);
        lens.push(chunk.length);
      });

      p._chunk(4, function(chunk, encoding, callback) {
        throw new Error('should not be called - no enough data');
      });

      p.write(new Buffer('test'));  // 4 < (1 + 2 + 4)

      assert.equal(lens.length, 2);
      assert.equal(lens[0], 1);
      assert.equal(lens[1], 2);
    });


    it('process chunks in time', function(done) {
      p._chunk(6, p._noop);

      p._transform(new Buffer('abcd'), null, function(error, chunk) {
        assert.equal(chunk.length, 0);  // not enough yet
      });

      p._transform(new Buffer('efgh'), null, function(error, chunk) {
        assert.equal(chunk.toString(), 'abcdefgh');
        done();
      });
    });


    it('process chunks with nested chunks in time', function(done) {
      p._chunk(3, function(chunk, encoding, callback) {
        this._chunk(6, this._noop);
        callback(null, chunk);
      });

      p._transform(new Buffer('abcd'), null, function(error, chunk) {
        assert.equal(chunk.toString(), 'abc');
      });

      p._transform(new Buffer('efgh'), null, function(error, chunk) {
        assert.equal(chunk.length, 0);
      });

      p._transform(new Buffer('i'), null, function(err, chunk) {
        assert.equal(chunk.toString(), 'defghi');
        done();
      });
    });
  });
});
