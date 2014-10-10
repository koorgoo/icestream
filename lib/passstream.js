var inherits = require('util').inherits;
var Transform = require('stream').Transform;
var util = require('./util');


function PassStream() {
  Transform.call(this);
  this._passers = [];
  this._chunkers = [];
}

inherits(PassStream, Transform);


PassStream.prototype._transform = function(chunk, encoding, callback) {
  var chunks = [], cleaned = [];

  function push(error, chunk) {
    chunks.push(chunk);
  }

  do {
    this._resetChanges();
    this._processPassers(chunk);
    util.clean(this._passers);

    chunk = this._processChunkers(chunk);
    cleaned = util.clean(this._chunkers);

    for (var i = 0; i < cleaned.length; i++) {
      // Support only synchronous transforms currently
      cleaned[i].transform.apply(this, [cleaned[i].chunk, encoding, push]);
    }
  } while (this._hasChanges());

  push(null, chunk);

  callback(null, util.joinChunks(chunks));
};


PassStream.prototype._processPassers = function(chunk) {
  for (var i = 0; i < this._passers.length; i++) {
    var ps = this._passers[i];
    var delta = ps.size > chunk.length ? chunk.length : ps.size;

    this._chunkers.unshift({
      size: delta,
      chunk: new Buffer(0),
      transform: this._noop
    });

    ps.size -= delta;
    chunk = chunk.slice(delta);

    if (ps.size === 0) {
      ps.callback.call(this);
      ps.remove = true;
    } else {
      ps.remove = false;
    }
  }
};


PassStream.prototype._processChunkers = function(chunk) {
  if (chunk.length === 0)
    return chunk;

  for (var i = 0; i < this._chunkers.length; i++) {
    if (chunk.length === 0)
      break;

    var ch = this._chunkers[i];
    var toRead = ch.size > chunk.length ? chunk.length : ch.size;

    ch.chunk = Buffer.concat([ch.chunk, chunk.slice(0, toRead)]);
    ch.size -= toRead;

    if (ch.size === 0) ch.remove = true;

    chunk = chunk.slice(toRead);
  }

  return chunk;
};


PassStream.prototype._pass = function(size, fn) {
  this._passers.changed = true;
  this._passers.push({
    size: size,
    callback: fn
  });
  return this;
};


PassStream.prototype._chunk = function(size, callback) {
  this._chunkers.changed = true;
  this._chunkers.push({
    size: size,
    chunk: new Buffer(0),
    transform: callback
  });
  return this;
};


PassStream.prototype._hasChanges = function() {
  return this._passers.changed || this._chunkers.changed;
};


PassStream.prototype._resetChanges = function() {
  this._passers.changed = false;
  this._chunkers.changed = false;
};


PassStream.prototype._noop = function(chunk, encoding, callback) {
  if (callback)
    callback(null, chunk);
};


module.exports = PassStream;
