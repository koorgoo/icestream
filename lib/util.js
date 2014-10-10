function clean(queue) {
  var removed = [];
  var removed_i = [];
  var counter = 0;

  for (var i = 0; i < queue.length; i++)
    if (queue[i].remove === true) {
      removed.push(queue[i]);
      removed_i.push(i);
    }

  for (i = 0; i < removed.length; i++) {
    queue.splice(removed_i[i] - counter, 1);
    counter++;
  }

  return removed;
}


function joinChunks(chunks) {
  var chunk = new Buffer(0);

  for (i = 0; i < chunks.length; i++) {
    /* jshint eqnull: true */
    if (chunks[i] == null || !Buffer.isBuffer(chunks[i]))
      continue;
    else {
      var total = chunk.length + chunks[i].length;
      chunk = Buffer.concat([chunk, chunks[i]], total);
    }
  }

  return chunk;
}


module.exports = {
  joinChunks: joinChunks,
  clean: clean
};
