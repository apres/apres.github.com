requirejs(
  ['apres', 'chai', 'sinon', 'jquery', './widget.js', 
   'widget/include', 'widget/handlebars'], 
  function(apres, chai, sinon, $, widget) {
  var assert = chai.assert;

  suite('include widget');
  widget.test('#with src', function(sandbox, done) {
    var findWidgets = sandbox.stub(apres, 'findWidgets');
    requirejs(['widget/include'], function(IncludeWidget) {
      var elem = new widget.Elem;
      var data = "Include This!";
      var include = widget.asyncWidget(IncludeWidget, elem, {src: new widget.Promise(data)});
      assert(elem.html.withArgs(data).calledOnce, 'elem.html() not called');
      assert(findWidgets.withArgs(elem).calledOnce, 'findWidgets() not called');
      done();
    });
  });
  
  widget.test('#escape', function(sandbox, done) {
    var findWidgets = sandbox.stub(apres, 'findWidgets');
    requirejs(['widget/include'], function(IncludeWidget) {
      var elem = new widget.Elem;
      var data = '<tag foo="wow"> & &entity;';
      var expected = '&lt;tag foo=&quot;wow&quot;&gt; &amp; &entity;';
      var include = widget.asyncWidget(IncludeWidget, elem, {src: new widget.Promise(data), escape: true});
      assert(elem.html.withArgs(expected).calledOnce, elem.html.args[0][0]);
      assert(findWidgets.withArgs(elem).calledOnce, 'findWidgets() not called');
      done();
    });
  });  

  widget.test('#no initial params', function(sandbox, done) {
    var ready = sandbox.spy();
    var findWidgets = sandbox.stub(apres, 'findWidgets');
    requirejs(['widget/include'], function(IncludeWidget) {
      var elem = new widget.Elem;
      var include = new IncludeWidget(elem, null, ready);
      assert.instanceOf(include, IncludeWidget);
      assert(!ready.withArgs(false).calledOnce, 'widgetReady(false) called');
      assert(!elem.html.called, 'elem.html() called');
      assert(!findWidgets.called, 'findWidgets() called');

      var data = 'Yo Mama';
      var url = 'include/data/path';
      var src = sandbox.stub(apres, 'srcPromise', widget.srcPromise(url, data));
      include.src(url);
      assert(elem.html.withArgs(data).calledOnce, elem.html.args[0][0]);
      assert(findWidgets.withArgs(elem).calledOnce, 'findWidgets() not called');
      done();
    });
  });

  suite('handlebars widget');  
  widget.test('#with src', function(sandbox, done) {
    var ready = sandbox.spy();
    var findWidgets = sandbox.stub(apres, 'findWidgets');
    requirejs(['widget/handlebars'], function(HandlebarsWidget) {
      var elem = new widget.Elem;
      var data = "My Name is: {{name}}";
      var handlebars = new HandlebarsWidget(elem, {src: new widget.Promise(data)}, ready);
      assert.instanceOf(handlebars, HandlebarsWidget);
      assert(!ready.withArgs(false).calledOnce, 'widgetReady(false) called');
      assert(!elem.html.called, 'elem.html() called');
      assert(!findWidgets.called, 'findWidgets() called');

      handlebars.render({name: 'Flomboozy'});
      assert(elem.html.withArgs('My Name is: Flomboozy').calledOnce, 'elem.html() not called');
      assert(findWidgets.withArgs(elem).calledOnce, 'findWidgets() not called');
      done();
    });
  });

  widget.test('#with src and context', function(sandbox, done) {
    var findWidgets = sandbox.stub(apres, 'findWidgets');
    requirejs(['widget/handlebars'], function(HandlebarsWidget) {
      var elem = new widget.Elem;
      var data = "My Name is: {{name}}";
      var handlebars = widget.asyncWidget(HandlebarsWidget, 
        elem, {src: new widget.Promise(data), context: new widget.Promise({name: 'Mudd'})});
      assert(elem.html.withArgs('My Name is: Mudd').calledOnce, 'elem.html() not called');
      assert(findWidgets.withArgs(elem).calledOnce, 'findWidgets() not called');
      done();
    });
  });

  widget.test('#no initial params', function(sandbox, done) {
    var ready = sandbox.spy();
    var findWidgets = sandbox.stub(apres, 'findWidgets');
    requirejs(['widget/handlebars'], function(HandlebarsWidget) {
      var elem = new widget.Elem;
      var handlebars = new HandlebarsWidget(elem, {}, ready);
      assert.instanceOf(handlebars, HandlebarsWidget);
      assert(!ready.withArgs(false).calledOnce, 'widgetReady(false) called');
      assert(!elem.html.called, 'elem.html() called');
      assert(!findWidgets.called, 'findWidgets() called');

      var data = "Your Name is: {{name}}";
      var url = 'handlebars/data/path';
      var src = sandbox.stub(apres, 'srcPromise', widget.srcPromise(url, data));
      handlebars.src(url);
      handlebars.render({name: 'FooBar'});
      assert(elem.html.withArgs('Your Name is: FooBar').calledOnce, 'elem.html() not called');
      assert(findWidgets.withArgs(elem).calledOnce, 'findWidgets() not called');
      done();
    });
  });
});
