var util = require('util');
var stream = require('stream');


function Writable(opts) {
  stream.Writable.call(this, opts);
  this.counter = 0;
}

util.inherits(Writable, stream.Writable);


Writable.prototype.write = function(chunk) {
  this.counter += chunk.length;
  return true;
};


module.exports = Writable;