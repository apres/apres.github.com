if (!requirejs) var requirejs = require('./requirejs_config').config();

requirejs(['apres', 'chai'], function(apres, chai) {
  var expect = chai.expect, assert = chai.assert;

  var emptyDocument = {
    getElementsByTagName: function() {return [];},
    getElementsByClassName: function() {return [];},
    location: {
      search: ''
    }
  }

  suite('module');
  test('#version', function() {
    assert.equal(apres.VERSION, 'dev');
  });
});
