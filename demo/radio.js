#!/usr/bin/env node

var fs = require('fs');
var http = require('http');
var urlParse = require('url').parse;
var IceStream = require('..');
var opts = require('nomnom')
  .option('url', {
    abbr: 'u',
    default: 'http://mp3.planetradio.de/planetradio/hqlivestream.mp3',
    help: 'Icecast stream url'
  })
  .option('path', {
    abbr: 'p',
    default: __dirname + '/stream.mp3',
    help: 'Output file path'
  })
  .parse();

var radio = urlParse(opts.url);


var req = http.request({
  hostname: radio.hostname,
  path: radio.path,
  headers: {'Icy-MetaData': 1}
});


req.on('response', function(res) {
  var ice = new IceStream({metaint: res.headers['icy-metaint']});
  var file = fs.createWriteStream(opts.path);

  res.pipe(ice).pipe(file);

  ice.on('metadata', function(meta) {
    console.log(new Date().toTimeString() + ': ' + meta);
  });
});


req.end();
