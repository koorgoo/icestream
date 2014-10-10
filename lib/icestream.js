var util = require('util');
var PassStream = require('./passstream');


function IceStream(opts) {
  PassStream.call(this);

  this.metaint = parseInt(opts.metaint, 10);
  this._pass(this.metaint, this._then);
}

util.inherits(IceStream, PassStream);


IceStream.prototype._then = function() {
  this._chunk(1, this._metasize);
};


IceStream.prototype._metasize = function(chunk, encoding, callback) {
  var metasize = chunk[0] * 16;  // meta block size
  this._chunk(metasize, this._meta);
  callback(null, chunk);
};


IceStream.prototype._meta = function(chunk, encoding, callback) {
  if (chunk.length) this.emit('metadata', chunk.toString());
  this._pass(this.metaint, this._then);
  callback(null, chunk);
};


module.exports = IceStream;
