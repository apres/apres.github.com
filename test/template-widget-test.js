if (!requirejs) var requirejs = require('./requirejs_config').config();

requirejs(['apres', 'chai', 'sinon'], function(apres, chai, sinon) {
  var assert = chai.assert;

  // Sinon test wrapper automatically creates a sandbox
  // that will be torn down after the test
  var sinonTest = function(name, func) {
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
  // Helper assertions for string prefix compare
  assert.startsWith = function(x, y, msg) {
    assert.equal(x.substring(0, y.length), y, 
      msg || '"' + x + '" does not start with "' + y + '"');
  }

  var Elem = function() {
    this.html = sinon.spy();
  }

  var Promise = function(data) {
    this.done = function(func) {
      func(data);
    }
  }

  var srcPromise = function(expectedUrl, data) {
    return function(url, type) {
      assert.strictEqual(url, expectedUrl);
      return {
        done: function(func) {
          func(data);
        }
      };
    }
  }

  suite('include widget');
  sinonTest('#with src', function(sandbox, done) {
    var ready = sandbox.spy();
    var findWidgets = sandbox.stub(apres, 'findWidgets');
    requirejs(['widget/include'], function(IncludeWidget) {
      var elem = new Elem;
      var data = "Include This!";
      var widget = new IncludeWidget(elem, {src: new Promise(data)}, ready);
      assert.instanceOf(widget, IncludeWidget);
      assert.strictEqual(widget.$el, elem);
      assert(ready.withArgs(false).calledOnce, 'widgetReady(false) not called');
      assert(ready.calledTwice, 'widgetReady() not called');
      assert(elem.html.withArgs(data).calledOnce, 'elem.html() not called');
      assert(findWidgets.withArgs(elem).calledOnce, 'findWidgets() not called');
      done();
    });
  });
  
  sinonTest('#escape', function(sandbox, done) {
    var ready = sandbox.spy();
    var findWidgets = sandbox.stub(apres, 'findWidgets');
    requirejs(['widget/include'], function(IncludeWidget) {
      var elem = new Elem;
      var data = '<tag foo="wow"> & &entity;';
      var expected = '&lt;tag foo=&quot;wow&quot;&gt; &amp; &entity;';
      var widget = new IncludeWidget(elem, {src: new Promise(data), escape: true}, ready);
      assert.instanceOf(widget, IncludeWidget);
      assert(ready.withArgs(false).calledOnce, 'widgetReady(false) not called');
      assert(ready.calledTwice, 'widgetReady() not called');
      assert(elem.html.withArgs(expected).calledOnce, elem.html.args[0][0]);
      assert(findWidgets.withArgs(elem).calledOnce, 'findWidgets() not called');
      done();
    });
  });  

  sinonTest('#no initial params', function(sandbox, done) {
    var ready = sandbox.spy();
    var findWidgets = sandbox.stub(apres, 'findWidgets');
    requirejs(['widget/include'], function(IncludeWidget) {
      var elem = new Elem;
      var widget = new IncludeWidget(elem, null, ready);
      assert.instanceOf(widget, IncludeWidget);
      assert(!ready.withArgs(false).calledOnce, 'widgetReady(false) called');
      assert(!elem.html.called, 'elem.html() called');
      assert(!findWidgets.called, 'findWidgets() called');

      var data = 'Yo Mama';
      var url = 'include/data/path';
      var src = sandbox.stub(apres, 'srcPromise', srcPromise(url, data));
      widget.src(url);
      assert(elem.html.withArgs(data).calledOnce, elem.html.args[0][0]);
      assert(findWidgets.withArgs(elem).calledOnce, 'findWidgets() not called');
      done();
    });
  });

});
