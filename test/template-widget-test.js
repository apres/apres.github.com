requirejs(
  ['apres', 'chai', 'sinon', 'jquery', 'apres-testing', 
   'widget/include', 'widget/handlebars', 'widget/jade'], 
  function(apres, chai, sinon, $, testing) {
  var assert = chai.assert;
  var spy = sinon.spy();

  suite('include widget');
  testing.testWidgetModule('widget/include');
  testing.testWidgetElem('widget/include');

  testing.moduleTest('#render src', 'widget/include', 
    function(sandbox, IncludeWidget) {
      var findWidgets = sandbox.stub(apres, 'findWidgets');
      var elem = testing.BasicElem();
      var data = "Include This!";
      var include = new IncludeWidget(elem, {src: data}, spy);
      assert(elem.html.withArgs(data).calledOnce, 'elem.html() not called');
      assert(findWidgets.withArgs(elem).calledOnce, 'findWidgets() not called');
    }
  );

  testing.moduleTest('#escape', 'widget/include', 
    function(sandbox, IncludeWidget) {
      var findWidgets = sandbox.stub(apres, 'findWidgets');
      var elem = testing.BasicElem();
      var data = '<tag foo="wow"> & &entity;';
      var expected = '&lt;tag foo=&quot;wow&quot;&gt; &amp; &entity;';
      var include = new IncludeWidget(elem, {src: data, escape: true}, spy);
      assert(elem.html.withArgs(expected).calledOnce, elem.html.args[0][0]);
      assert(findWidgets.withArgs(elem).calledOnce, 'findWidgets() not called');
    }
  );

  testing.moduleTest('#no initial params', 'widget/include', 
    function(sandbox, IncludeWidget) {
      var ready = sandbox.spy();
      var findWidgets = sandbox.stub(apres, 'findWidgets');
      var elem = testing.BasicElem();
      var include = new IncludeWidget(elem, null, ready);
      assert.instanceOf(include, IncludeWidget);
      assert(!ready.withArgs(false).calledOnce, 'widgetReady(false) called');
      assert(!elem.html.called, 'elem.html() called');
      assert(!findWidgets.called, 'findWidgets() called');

      var data = 'Yo Mama';
      var url = 'include/data/path';
      testing.injectSrc(sandbox, data, url);
      include.src(url);
      assert(elem.html.withArgs(data).calledOnce, elem.html.args[0][0]);
      assert(findWidgets.withArgs(elem).calledOnce, 'findWidgets() not called');
    }
  );

  suite('handlebars widget');  
  testing.testWidgetModule('widget/handlebars');
  testing.testWidgetElem('widget/handlebars');

  testing.moduleTest('#render src', 'widget/handlebars',
    function(sandbox, HandlebarsWidget) {
      var ready = sandbox.spy();
      var findWidgets = sandbox.stub(apres, 'findWidgets');
      var elem = testing.BasicElem();
      var data = "My Name is: {{name}}";
      var handlebars = new HandlebarsWidget(elem, {src: data}, ready);
      assert(!ready.withArgs(false).calledOnce, 'widgetReady(false) called');
      assert(!elem.html.called, 'elem.html() called');
      assert(!findWidgets.called, 'findWidgets() called');

      handlebars.render({name: 'Flomboozy'});
      assert(elem.html.withArgs('My Name is: Flomboozy').calledOnce, 'elem.html() not called');
      assert(findWidgets.withArgs(elem).calledOnce, 'findWidgets() not called');
    }
  );

  testing.moduleTest('#with src and context', 'widget/handlebars',
    function(sandbox, HandlebarsWidget) {
      var findWidgets = sandbox.stub(apres, 'findWidgets');
      var elem = testing.BasicElem();
      var data = "My Name is: {{name}}";
      var handlebars = new HandlebarsWidget( 
        elem, {src: data, context: {name: 'Mudd'}}, spy);
      assert(elem.html.withArgs('My Name is: Mudd').calledOnce, 'elem.html() not called');
      assert(findWidgets.withArgs(elem).calledOnce, 'findWidgets() not called');
    }
  );

  testing.moduleTest('#no initial params', 'widget/handlebars',
    function(sandbox, HandlebarsWidget) {
      var ready = sandbox.spy();
      var findWidgets = sandbox.stub(apres, 'findWidgets');
      var elem = testing.BasicElem();
      var handlebars = new HandlebarsWidget(elem, {}, ready);
      assert.instanceOf(handlebars, HandlebarsWidget);
      assert(!ready.withArgs(false).calledOnce, 'widgetReady(false) called');
      assert(!elem.html.called, 'elem.html() called');
      assert(!findWidgets.called, 'findWidgets() called');

      var data = "Your Name is: {{name}}";
      var url = 'handlebars/data/path';
      testing.injectSrc(sandbox, data, url);
      handlebars.src(url);
      handlebars.render({name: 'FooBar'});
      assert(elem.html.withArgs('Your Name is: FooBar').calledOnce, 'elem.html() not called');
      assert(findWidgets.withArgs(elem).calledOnce, 'findWidgets() not called');
    }
  );

  suite('jade widget');  
  testing.testWidgetModule('widget/jade');
  testing.testWidgetElem('widget/jade');

  testing.moduleTest('#render src', 'widget/jade',
    function(sandbox, JadeWidget) {
      var ready = sandbox.spy();
      var findWidgets = sandbox.stub(apres, 'findWidgets');
      var elem = testing.BasicElem();
      var data = "p Goodbye #{name}";
      var jade = new JadeWidget(elem, {src: data}, ready);
      assert(!elem.html.called, 'elem.html() called');
      assert(!findWidgets.called, 'findWidgets() called');

      jade.render({name: 'Batman'});
      assert(elem.html.withArgs('<p>Goodbye Batman</p>').calledOnce, 'elem.html() not called');
      assert(findWidgets.withArgs(elem).calledOnce, 'findWidgets() not called');
    }
  );

  testing.moduleTest('#with src and context', 'widget/jade',
    function(sandbox, JadeWidget) {
      var findWidgets = sandbox.stub(apres, 'findWidgets');
      var elem = testing.BasicElem();
      var data = "p Goodbye #{name}";
      var jade = new JadeWidget( 
        elem, {src: data, context: {name: 'Mudd'}}, spy);
      assert(elem.html.withArgs('<p>Goodbye Mudd</p>').calledOnce, 'elem.html() not called');
      assert(findWidgets.withArgs(elem).calledOnce, 'findWidgets() not called');
    }
  );

  testing.moduleTest('#no initial params', 'widget/jade',
    function(sandbox, JadeWidget) {
      var ready = sandbox.spy();
      var findWidgets = sandbox.stub(apres, 'findWidgets');
      var elem = testing.BasicElem();
      var jade = new JadeWidget(elem, {}, ready);
      assert(!ready.withArgs(false).calledOnce, 'widgetReady(false) called');
      assert(!elem.html.called, 'elem.html() called');
      assert(!findWidgets.called, 'findWidgets() called');

      var data = "p Farewell #{name}";
      var url = 'jade/data/path';
      testing.injectSrc(sandbox, data, url);
      jade.src(url);
      jade.render({name: 'FooBar'});
      assert(elem.html.withArgs('<p>Farewell FooBar</p>').calledOnce, 'elem.html() not called');
      assert(findWidgets.withArgs(elem).calledOnce, 'findWidgets() not called');
    }
  );
});
