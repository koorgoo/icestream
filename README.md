icestream
=========

Icecast stream metadata reader for Node.js


### Install

```shell
npm install icestream
```


### Usage

```js
var ice = new require('icestream')({
  metaint: icecastHeaders['icy-metaint']
});

ice.on('metadata', function(meta) {
  console.log(meta);
});

inputStream.pipe(ice).pipe(outputStream);
```


### Demo

```shell
node demo/radio.js
```
