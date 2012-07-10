// Widget test scaffold
define(['sinon', 'chai'], function(sinon, chai) {
  var assert = chai.assert;
  var widget = {};

  // Sinon test wrapper automatically creates a sandbox
  // that will be torn down after the test
  widget.test = function(name, func) {
    var tfn = function(done) {
      var sandbox = sinon.sandbox.create();
      try {
        func(sandbox, done);
      } finally {
        sandbox.verifyAndRestore();
      }
    }
    return test(name, tfn);
  }

  widget.Elem = function() {
    this.html = sinon.spy();
    this.find = sinon.spy();
  }

  widget.Promise = function(data) {
    var p = $.Deferred();
    p.resolve(data);
    return p.promise();
  }

  widget.srcPromise = function(expectedUrl, data) {
    return function(url, type) {
      assert.strictEqual(url, expectedUrl);
      return widget.Promise(data);
    }
  }

  widget.asyncWidget = function(Constructor, elem, params) {
    var ready = sinon.spy();
    var w = new Constructor(elem, params, ready);
    assert.instanceOf(w, Constructor);
    assert.strictEqual(w.$el, elem);
    assert(ready.withArgs(false).calledOnce, 'widgetReady(false) not called');
    assert(ready.calledTwice, 'widgetReady() not called');
    return w;
  }

  return widget;
});
