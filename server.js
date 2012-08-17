// Run a static server on localhost:8080 from the current directory, 
// serving Apres files under /apres

var express = require('express');
var apres = require('./index.js');

var port = 8080,
    app = express.createServer(),
    wd = process.cwd();
if (wd.lastIndexOf('/node_modules/') > 0) {
  // Serve from the directory above node_modules
  wd = wd.slice(0, wd.lastIndexOf('/node_modules/'));
}
apres.helpExpress(app);
app.use(express.static(wd));
app.listen(port, "127.0.0.1");
console.log('Serving ' + wd + ' at http://localhost:' + port + '/');
console.log('Apres files can be found at http://localhost:' + port + '/apres/');
