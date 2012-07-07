if (!requirejs) var requirejs = require('./requirejs_config').config();

requirejs(
  ['apres', 'chai', 'sinon', 'jquery'], 
  function(apres, chai, sinon, $) {
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
    this.find = sinon.spy();
  }

  var Promise = function(data) {
    var p = $.Deferred();
    p.resolve(data);
    return p.promise();
  }

  var srcPromise = function(expectedUrl, data) {
    return function(url, type) {
      assert.strictEqual(url, expectedUrl);
      return Promise(data);
    }
  }

  var asyncWidget = function(Constructor, elem, params) {
    var ready = sinon.spy();
    var widget = new Constructor(elem, params, ready);
    assert.instanceOf(widget, constructor);
    assert.strictEqual(widget.$el, elem);
    assert(ready.withArgs(false).calledOnce, 'widgetReady(false) not called');
    assert(ready.calledTwice, 'widgetReady() not called');
    return widget;
  }

  suite('include widget');
  sinonTest('#with src', function(sandbox, done) {
    var findWidgets = sandbox.stub(apres, 'findWidgets');
    requirejs(['widget/include'], function(IncludeWidget) {
      var elem = new Elem;
      var data = "Include This!";
      var widget = asyncWidget(IncludeWidget, elem, {src: new Promise(data)});
      assert(elem.html.withArgs(data).calledOnce, 'elem.html() not called');
      assert(findWidgets.withArgs(elem).calledOnce, 'findWidgets() not called');
      done();
    });
  });
  
  sinonTest('#escape', function(sandbox, done) {
    var findWidgets = sandbox.stub(apres, 'findWidgets');
    requirejs(['widget/include'], function(IncludeWidget) {
      var elem = new Elem;
      var data = '<tag foo="wow"> & &entity;';
      var expected = '&lt;tag foo=&quot;wow&quot;&gt; &amp; &entity;';
      var widget = asyncWidget(IncludeWidget, elem, {src: new Promise(data), escape: true});
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

  suite('handlebars widget');  
  sinonTest('#with src', function(sandbox, done) {
    var ready = sandbox.spy();
    var findWidgets = sandbox.stub(apres, 'findWidgets');
    requirejs(['widget/handlebars'], function(HandlebarsWidget) {
      var elem = new Elem;
      var data = "My Name is: {{name}}";
      var widget = new HandlebarsWidget(elem, {src: new Promise(data)}, ready);
      assert.instanceOf(widget, HandlebarsWidget);
      assert(!ready.withArgs(false).calledOnce, 'widgetReady(false) called');
      assert(!elem.html.called, 'elem.html() called');
      assert(!findWidgets.called, 'findWidgets() called');

      widget.render({name: 'Flomboozy'});
      assert(elem.html.withArgs('My Name is: Flomboozy').calledOnce, 'elem.html() not called');
      assert(findWidgets.withArgs(elem).calledOnce, 'findWidgets() not called');
      done();
    });
  });

  sinonTest('#with src and context', function(sandbox, done) {
    var findWidgets = sandbox.stub(apres, 'findWidgets');
    requirejs(['widget/handlebars'], function(HandlebarsWidget) {
      var elem = new Elem;
      var data = "My Name is: {{name}}";
      var widget = asyncWidget(HandlebarsWidget, 
        elem, {src: new Promise(data), context: new Promise({name: 'Mudd'})});
      assert(elem.html.withArgs('My Name is: Mudd').calledOnce, 'elem.html() not called');
      assert(findWidgets.withArgs(elem).calledOnce, 'findWidgets() not called');
      done();
    });
  });

  sinonTest('#no initial params', function(sandbox, done) {
    var ready = sandbox.spy();
    var findWidgets = sandbox.stub(apres, 'findWidgets');
    requirejs(['widget/handlebars'], function(HandlebarsWidget) {
      var elem = new Elem;
      var widget = new HandlebarsWidget(elem, {}, ready);
      assert.instanceOf(widget, HandlebarsWidget);
      assert(!ready.withArgs(false).calledOnce, 'widgetReady(false) called');
      assert(!elem.html.called, 'elem.html() called');
      assert(!findWidgets.called, 'findWidgets() called');

      var data = "Your Name is: {{name}}";
      var url = 'handlebars/data/path';
      var src = sandbox.stub(apres, 'srcPromise', srcPromise(url, data));
      widget.src(url);
      widget.render({name: 'FooBar'});
      assert(elem.html.withArgs('Your Name is: FooBar').calledOnce, 'elem.html() not called');
      assert(findWidgets.withArgs(elem).calledOnce, 'findWidgets() not called');
      done();
    });
  });
});
