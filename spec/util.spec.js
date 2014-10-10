var assert = require('assert');
var util = require('../lib/util');


describe('util', function() {

  describe('clean()', function() {
    var clean = util.clean;

    it('return list of `removed` items', function() {
      var rm = clean([
        {id: 1, remove: true},
        {id: 2, remove: false},
        {id: 3, remove: true},
        {id: 4}
      ]);

      assert.equal(rm.length, 2);
      assert.equal(rm[0].id, 1);
      assert.equal(rm[1].id, 3);
    });
  });


  describe('joinChunks()', function() {
    var joinChunks = util.joinChunks;

    it('join only buffer objects', function() {
      var chunk = joinChunks([
        undefined,
        new Buffer([0,1,2,3]),
        null,
        new Buffer([4,5])
      ]);

      assert.deepEqual(Array.prototype.slice.call(chunk), [0,1,2,3,4,5]);
    });
  });
});
