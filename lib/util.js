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


function calculateTotalSize(chunks) {
  var size = 0;
  for (var i = 0; i < chunks.length; i++)
    /* jshint eqnull: true */
    if (chunks[i] == null || !Buffer.isBuffer(chunks[i])) 
      continue;
    else
      size += chunks[i].length;
  return size;
}


function joinChunks(chunks) {
  var size = calculateTotalSize(chunks);
  var chunk = new Buffer(size);
  var offset = 0;

  for (i = 0; i < chunks.length; i++) {
    /* jshint eqnull: true */
    if (chunks[i] == null || !Buffer.isBuffer(chunks[i]))
      continue;
    else {
      chunk.write(chunks[i].toString(), offset);
      offset += chunks[i].length;
    }
  }

  return chunk;
}


module.exports = {
  joinChunks: joinChunks,
  calculateTotalSize: calculateTotalSize,
  clean: clean
};