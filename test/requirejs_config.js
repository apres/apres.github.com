// Configure requirejs for running tests

// Only node is supported right now
exports.config = function() {
  var requirejs = require('requirejs');
  requirejs.config({
    nodeRequire: requirejs, // Use requirejs to load modules
    baseUrl: 'js/lib',
  });
  requirejs.define('jquery', function() {
    return require('jquery');
  });
  // load the version of apres under test to finish the requirejs config
  requirejs(['apres-dev']);
  return requirejs;
}

