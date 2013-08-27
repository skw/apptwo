// static file server

"use strict";

var express = require('express');
var app = express();

var config = {
  port: '3030',
  dir: '/public',
  assets: '/bower_components'
};

app.configure(function(){
  app.use( express.static(__dirname + config.dir) );
  app.use( '/assets', express.static(__dirname + config.assets) );
});

app.listen(config.port);

console.log(
  '> static files from "' + config.dir + '", asset files from "' + config.assets + '"',
  '\n: being served on port ' + config.port
);