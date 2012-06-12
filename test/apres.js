if (!requirejs) var requirejs = require('./requirejs_config').config();

requirejs(['apres', 'chai', 'sinon'], function(apres, chai, sinon) {
  var expect = chai.expect, assert = chai.assert;

  // Sinon test wrapper automatically creates a sandbox
  // that will be torn down after the test
  var sinonTest = function(name, func) {
    return test(name, sinon.test(func));
  }

  suite('apres module');
  test('#version', function() {
    assert.equal(apres.VERSION, 'dev');
  });

  suite('apres.delegate()');

  var MockElem = function() {
    this.delegates = [];
  }
  MockElem.prototype.delegate = function(selector, eventName, method) {
   this.delegates.push({selector: selector, eventName:eventName, method:method});
  }
  MockElem.prototype.bind = function(eventName, method) {
    this.delegates.push({eventName:eventName, method:method});
  }
  var handler = function() {return this};
  var bindee = {};

  sinonTest('#basic events', function() {
    this.stub(apres, '$').returnsArg(0);

    var elem = new MockElem;
    var events = {
      'click #clicker': handler,
      'foo tag.baz div': handler,
      'load': handler,
    };
    assert.equal(elem.delegates.length, 0);
    assert.notStrictEqual(handler(), bindee);
    assert.strictEqual(apres.delegate(events, elem, bindee), apres);
    assert.equal(elem.delegates.length, 3);
    assert.equal(elem.delegates[0].eventName, 'click');
    assert.equal(elem.delegates[0].selector, '#clicker');
    assert.strictEqual(elem.delegates[0].method(), bindee);
    assert.equal(elem.delegates[1].eventName, 'foo');
    assert.equal(elem.delegates[1].selector, 'tag.baz div');
    assert.strictEqual(elem.delegates[1].method(), bindee);
    assert.equal(elem.delegates[2].eventName, 'load');
    assert.strictEqual(elem.delegates[2].selector, undefined);
    assert.strictEqual(elem.delegates[2].method(), bindee);
  });

  sinonTest('#bindee default', function() {
    this.stub(apres, '$').returnsArg(0);

    var elem = new MockElem;
    var events = {'foo': handler};
    apres.delegate(events, elem);
    assert.equal(elem.delegates.length, 1);
    assert.equal(elem.delegates[0].eventName, 'foo');
    assert.strictEqual(elem.delegates[0].method(), events);
  });

  sinonTest('#inner events bindee', function() {
    this.stub(apres, '$').returnsArg(0);

    var elem = new MockElem;
    var controller = {
      events: {'bar': handler}
    };
    apres.delegate(controller, elem);
    assert.equal(elem.delegates.length, 1);
    assert.equal(elem.delegates[0].eventName, 'bar');
    assert.strictEqual(elem.delegates[0].method(), controller);
  });

  sinonTest('#inner events function', function() {
    this.stub(apres, '$').returnsArg(0);

    var elem = new MockElem;
    var controller = {
      events: function() {
        return {
          'jekyll': handler,
          'hyde': handler
        };
      }
    };
    apres.delegate(controller, elem);
    assert.equal(elem.delegates.length, 2);
    assert.equal(elem.delegates[0].eventName, 'jekyll');
    assert.strictEqual(elem.delegates[0].method(), controller);
    assert.equal(elem.delegates[1].eventName, 'hyde');
    assert.strictEqual(elem.delegates[1].method(), controller);

  });

  sinonTest('#inner elem', function() {
    this.stub(apres, '$').returnsArg(0);

    var c = {
      elem: new MockElem,
      events: {'baz #spam': handler}
    };
    apres.delegate(c);
    assert.equal(c.elem.delegates.length, 1);
    assert.equal(c.elem.delegates[0].eventName, 'baz');
    assert.equal(c.elem.delegates[0].method(), c);
  });

  suite('apres.widget()');

  var Mock$Elem = function(attrs) {
    this.attrs = attrs || {};
  }
  Mock$Elem.prototype = Object.create(MockElem.prototype);
  Mock$Elem.prototype.attr = function(k, v) {
    if (v === undefined) {
      return this.attrs[k];
    } else {
      this.attrs[k] = v;
    }
  }

  var MockDomElem = function(attrs) {
    this.delegates = [];
    this.attrs = attrs || {};
  }
  MockDomElem.prototype = Object.create(MockElem.prototype);
  MockDomElem.prototype.getAttribute = function(k) {
    return this.attrs[k];
  }
  MockDomElem.prototype.setAttribute = function(k, v) {
    this.attrs[k] = v;
  }
  MockDomElem.prototype.attr = function(k, v) {
    if (v === undefined) {
      return this.attrs[k];
    } else {
      this.attrs[k] = v;
    }
  }
  var Widget = function(elem, params) {
    this.elem = elem;
    this.params = params;
  }

  test('#get unknown widget', function() {
    assert.isUndefined(apres.widget(new Mock$Elem));
    assert.isUndefined(apres.widget(new MockDomElem));
  });

  sinonTest('#add widget $ elem', function() {
    this.stub(apres, '$').returnsArg(0);

    var params = {foo: 'bar'};
    var elem = new Mock$Elem;
    var w = apres.widget(elem, Widget, params);
    assert.strictEqual(w, apres.widget(elem));
    assert.instanceOf(w, Widget);
    assert.strictEqual(w.elem, elem);
    assert.strictEqual(w.params, params);
  });

  sinonTest('#add widget DOM elem', function() {
    var params = {green: 'eggs'};
    var elem = new MockDomElem;
    var w = apres.widget(elem, Widget, params);
    assert.strictEqual(w, apres.widget(elem));
    assert.instanceOf(w, Widget);
    assert.deepEqual(w.elem, apres.$(elem));
    assert.strictEqual(w.params, params);
  });

  sinonTest('#add widget delegates', function() {
    this.stub(apres, '$').returnsArg(0);

    var params = {blue: 'eggs'};
    var elem = new MockDomElem;
    var EventedWidget = function(elemArg, paramsArg) {
      assert.deepEqual(elemArg, apres.$(elem));
      this.elem = elemArg;
      assert.strictEqual(paramsArg, params);
      this.params = paramsArg;
      this.events = {
        'blur #glasses': handler
      }
    }
    EventedWidget.prototype = Object.create(Widget.prototype);
    assert.equal(elem.delegates.length, 0);
    var widget = apres.widget(elem, EventedWidget, params);
    assert.instanceOf(widget, EventedWidget);
    assert.equal(elem.delegates.length, 1)
    assert.equal(elem.delegates[0].eventName, 'blur');
    assert.equal(elem.delegates[0].selector, '#glasses');
    assert.strictEqual(elem.delegates[0].method(), widget);
  });

  sinonTest('#widget ready event', function() {
    this.stub(apres, '$').returnsArg(0);
    var spy = this.spy();
    apres.pubsub.subscribe(apres.topic.widgetReady, spy);

    assert(!spy.called, 'widget ready fired prematurely');
    var elem = new MockDomElem;
    var widget = apres.widget(elem, Widget);
    this.clock.tick(1);
    assert(spy.calledOnce, 'widget ready did not fire');
    assert(spy.calledWithExactly(apres.topic.widgetReady, {widget: widget, elem: elem}), 
      'widgetReady called with ' + sinon.format(spy.args));

    apres.pubsub.unsubscribe(spy);
  });

  sinonTest('#widget ready event pending widget', function() {
    this.stub(apres, '$').returnsArg(0);
    var spy = this.spy();
    apres.pubsub.subscribe(apres.topic.widgetReady, spy);

    var elem = new MockDomElem;
    var widgetReadyCallback;
    var PendingWidget = function(elemArg, paramsArg, readyArg) {
      this.elem = elemArg;
      this.params = paramsArg;
      assert.isFunction(readyArg)
      readyArg(false);
      widgetReadyCallback = readyArg;
    }
    var widget = apres.widget(elem, PendingWidget);
    this.clock.tick(1);
    assert(!spy.called, 'widget ready fired prematurely');
    widgetReadyCallback();
    this.clock.tick(1);
    assert(spy.calledOnce, 'widget ready did not fire');
    assert(spy.calledWithExactly(apres.topic.widgetReady, {widget: widget, elem: elem}), 
      'widgetReady called with ' + sinon.format(spy.args));

    apres.pubsub.unsubscribe(spy);
  });

  sinonTest('#widget ready callback is one-shot', function() {
    this.stub(apres, '$').returnsArg(0);
    var spy = this.spy();
    apres.pubsub.subscribe(apres.topic.widgetReady, spy);

    var elem = new MockDomElem;
    var widgetReadyCallback;
    var PendingWidget = function(elemArg, paramsArg, readyArg) {
      this.elem = elemArg;
      this.params = paramsArg;
      assert.isFunction(readyArg)
      readyArg(false);
      widgetReadyCallback = readyArg;
    }
    var widget = apres.widget(elem, PendingWidget);
    this.clock.tick(1);
    assert(!spy.called, 'widget ready fired prematurely');
    widgetReadyCallback();
    this.clock.tick(1);
    assert(spy.calledOnce, 'widget ready did not fire');
    widgetReadyCallback();
    this.clock.tick(1);
    assert(spy.calledOnce, 'widget ready fired more than once');
    widgetReadyCallback(false);
    widgetReadyCallback();
    this.clock.tick(1);
    assert(spy.calledOnce, 'widget ready fired more than once');
    apres.pubsub.unsubscribe(spy);
  });

  sinonTest('#widget ready callback no-op after constructor', function() {
    this.stub(apres, '$').returnsArg(0);
    var spy = this.spy();
    apres.pubsub.subscribe(apres.topic.widgetReady, spy);

    var elem = new MockDomElem;
    var widgetReadyCallback;
    var SyncWidget = function(elemArg, paramsArg, readyArg) {
      this.elem = elemArg;
      this.params = paramsArg;
      assert.isFunction(readyArg)
      widgetReadyCallback = readyArg;
    }

    var widget = apres.widget(elem, SyncWidget);
    this.clock.tick(1);
    assert(spy.calledOnce, 'widget ready not called');
    widgetReadyCallback();
    this.clock.tick(1);
    assert(spy.calledOnce, 'widget ready fired more than once');

    apres.pubsub.unsubscribe(spy);
  });

  sinonTest('#widget simple params', function() {
    this.stub(apres, '$').returnsArg(0);
    var ParamsWidget = function(elem, params) {
      this.params = params;
    }
    ParamsWidget.widgetParams = {
      strP: "String param with only descr",
      strP2: {type: 'string', descr: 'String param with type', default: 'yoyo'},
      intP: {type: 'int'},
      floatP: {type: 'float'},
      floatDefault: {type: 'float', default: 17},
      boolP: {type: 'bool'}
    }
    this.stub(apres, 'require', function(deps, cb) {cb(ParamsWidget)});
    var elem = new MockDomElem;
    elem.attr('data-widget-strP', 'Prts');
    elem.attr('data-widget-intP', '42');
    elem.attr('data-widget-boolP', 'YES');
    elem.attr('data-widget-extraP', 'huh?');
    apres.insertWidget(elem, 'ParamsWidget');
    var widget = apres.widget(elem);
    assert.deepEqual(widget.params, {
      strP: 'Prts',
      strP2: 'yoyo',
      intP: 42,
      boolP: true,
      floatDefault: 17
    });
  });

  suite('apres.initialize()');

  var emptyDocument = {
    getElementsByTagName: function() {return [];},
    getElementsByClassName: function() {return [];},
    location: {
      search: ''
    }
  };

  test('#empty doc', function() {
    apres.initialize(emptyDocument);
    assert.isUndefined(apres.controllerName);
    assert.isUndefined(apres.controller);
  });

});
