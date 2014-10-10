#!/usr/bin/env node

var fs = require('fs');
var http = require('http');
var urlParse = require('url').parse;
var IceStream = require('..');

var url = "http://mp3.planetradio.de/planetradio/hqlivestream.mp3";
var path = __dirname + '/stream.mp3';

var radio = urlParse(url);


var req = http.request({
  hostname: radio.hostname,
  path: radio.path,
  headers: {'Icy-MetaData': 1}
});


req.on('response', function(res) {
  var ice = new IceStream({metaint: res.headers['icy-metaint']});
  var file = fs.createWriteStream(path);

  res.pipe(ice).pipe(file);

  ice.on('metadata', function(meta) {
    console.log(new Date().toTimeString() + ': ' + meta);
  });
});


req.end();
