// Tests for node-specific glue
var apres = require('../index')
  , assert = require('chai').assert
  , express = require('express')
  , expect = require('chai').expect
  , request = require('request');



suite('node');
test('#helpExpress', function(done) {
  // Create a test Express HTTP server
  var app = express.createServer();
  // Set up the middleware
  apres.helpExpress(app);
  app.use(app.router);
  // Listen
  var port = 31337;
  app.listen(port);
  // Query
  request({
    uri: 'http://localhost:' + port + '/apres/js/lib/apres-dev.js'
  }, function(e, r, b) {
    if (e) throw e;
    assert.equal(r.statusCode, 200);
    assert.equal(r.header("content-type"), "application/javascript");
    done();
  });
});
