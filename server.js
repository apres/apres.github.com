var http = require('http'),
    static = require('node-static');

// Disable Cache-Control header for development
var file = new (static.Server)('./', {cache: false});

http.createServer(function(req, res) {
  req.addListener('end', function() {
    file.serve(req, res);
  });
}).listen(5000);

console.log("Apres now being server at http://localhost:5000");
