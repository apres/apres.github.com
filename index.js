/*
 * Copyright (c) 2012 Niall O'Higgins, all rights reserved
 * Apres is distributed freely under the MIT license
 * See http://apres.github.com/ for details
 *
 * Convenience middleware for Node.JS / Express.
 *
 * In your Express app setup you can do:
 *
 * var apres = require('apres');
 *
 * Now when you are setting up your middlewares, routes, etc you can add:
 *
 * apres.helpExpress(app);
 *
 * Which will automagically serve up static apres assets from /apres/
 *
 */
var express = require('express')
  , path = require('path');

exports.helpExpress = function(app) {
  var basePath = __dirname;
  // If not installed as an NPM module, ie test mode
  // This is kind of a hack for apres not being a dependency of itself at the moment.
  if (basePath.indexOf('node_modules') === -1) {
    var staticServer = express.static(basePath);
    app.get('/apres/*', function(req, res, next) {
      req.url = req.url.slice("/apres".length, req.url.length);
      staticServer(req, res, next);
    });
  } else {
    basePath = path.dirname(basePath);
    var staticServer = express.static(basePath);
    app.get('/apres/*', function(req, res, next) {
      staticServer(req, res, next);
    });
  }
}

