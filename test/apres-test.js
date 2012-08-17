requirejs(['apres', 'chai', 'sinon', 'apres-testing'], function(apres, chai, sinon, testing) {
  var expect = chai.expect, assert = chai.assert;

  // Sinon test wrapper automatically creates a sandbox
  // that will be torn down after the test
  var sinonTest = function(name, func) {
    return test(name, sinon.test(func));
  }
  // Helper assertions for string prefix compare
  assert.startsWith = function(x, y, msg) {
    assert.equal(x.substring(0, y.length), y, 
      msg || '"' + x + '" does not start with "' + y + '"');
  }

  suite('apres module');
  test('#VERSION', function() {
    assert.equal(apres.VERSION, 'dev');
  });

  test('#MODULE_URI', function() {
    assert.strictEqual(typeof apres.MODULE_URI, 'string');
    assert(apres.MODULE_URI, 'MODULE_URI was empty');
  });

  suite('apres.delegate()');

  var MockElem = function(attrs) {
    this.delegates = [];
    this.trigger = sinon.spy();
    this.attrs = attrs || {};
  }
  MockElem.prototype.attr = function(k, v) {
    if (v === undefined) {
      return this.attrs[k];
    } else {
      this.attrs[k] = v;
    }
  }
  MockElem.prototype.on = function(eventName, selector, method) {
    if (method !== undefined) {
      this.delegates.push({selector: selector, eventName:eventName, method:method});
    } else {
      this.delegates.push({eventName:eventName, method:selector});
    }
  }
  var handler = function() {return this};

  sinonTest('#delegate basic events', function() {
    this.stub(apres, '$').returnsArg(0);

    var elem = new MockElem;
    var delegate = {
      events: {
        'click #clicker': handler,
        'foo tag.baz div': handler,
        'load': handler,
      }
    };
    assert.equal(elem.delegates.length, 0);
    assert.notStrictEqual(handler(), delegate);
    assert.strictEqual(apres.delegate(delegate, elem), apres);
    assert.equal(elem.delegates.length, 3);
    assert.startsWith(elem.delegates[0].eventName, 'click');
    assert.equal(elem.delegates[0].selector, '#clicker');
    assert.strictEqual(elem.delegates[0].method(), delegate);
    assert.startsWith(elem.delegates[1].eventName, 'foo');
    assert.equal(elem.delegates[1].selector, 'tag.baz div');
    assert.strictEqual(elem.delegates[1].method(), delegate);
    assert.startsWith(elem.delegates[2].eventName, 'load');
    assert.ok(!elem.delegates[2].selector);
    assert.strictEqual(elem.delegates[2].method(), delegate);
  });

  sinonTest('#delegate inner $el', function() {
    this.stub(apres, '$').returnsArg(0);

    var delegate = {
      events: {'foo': handler},
      $el: new MockElem,
    };
    apres.delegate(delegate);
    assert.equal(delegate.$el.delegates.length, 1);
    assert.startsWith(delegate.$el.delegates[0].eventName, 'foo');
    assert.strictEqual(delegate.$el.delegates[0].method(), delegate);
  });

  sinonTest('#events function', function() {
    this.stub(apres, '$').returnsArg(0);

    var elem = new MockElem;
    var delegate = {
      events: function() {
        return {
          'jekyll': handler,
          'hyde': handler
        };
      }
    };
    apres.delegate(delegate, elem);
    assert.equal(elem.delegates.length, 2);
    assert.startsWith(elem.delegates[0].eventName, 'jekyll');
    assert.strictEqual(elem.delegates[0].method(), delegate);
    assert.startsWith(elem.delegates[1].eventName, 'hyde');
    assert.strictEqual(elem.delegates[1].method(), delegate);
  });

  sinonTest('#delegate string handlers', function() {
    this.stub(apres, '$').returnsArg(0);

    var elem = new MockElem;
    var delegate = {
      fooHandler: function() {return this},
      barHandler: function() {return this},
      events: {
        'baz #spam': 'fooHandler',
        'bar #hello': 'barHandler',
      }
    };
    apres.delegate(delegate, elem);
    assert.equal(elem.delegates.length, 2);
    assert.startsWith(elem.delegates[0].eventName, 'baz');
    assert.equal(elem.delegates[0].method(), delegate);
    assert.startsWith(elem.delegates[1].eventName, 'bar');
    assert.equal(elem.delegates[1].method(), delegate);
  });

  suite('apres.linkStyleSheet()');

  sinonTest('#one css', function() {
    assert.equal($('link[href="test/style/one.css"]').length, 0)
    apres.linkStyleSheet('test/style/one.css');
    assert.equal($('link[href="test/style/one.css"]').length, 1)
  });

  sinonTest('#css inserted once', function() {
    assert.equal($('link[href="test/style/once.css"]').length, 0)
    apres.linkStyleSheet('test/style/once.css');
    assert.equal($('link[href="test/style/once.css"]').length, 1)
    apres.linkStyleSheet('test/style/once.css');
    assert.equal($('link[href="test/style/once.css"]').length, 1)
    apres.linkStyleSheet('test/style/once.css');
    assert.equal($('link[href="test/style/once.css"]').length, 1)
  });

  sinonTest('#multi css', function() {
    assert.equal($('link[href="test/style/arr1.css"]').length, 0)
    assert.equal($('link[href="test/style/arr2.css"]').length, 0)
    apres.linkStyleSheet('test/style/arr1.css');
    apres.linkStyleSheet('test/style/arr2.css');
    assert.equal($('link[href="test/style/arr1.css"]').length, 1)
    assert.equal($('link[href="test/style/arr2.css"]').length, 1)
  });

  suite('apres.widget()');

  var MockDomElem = function(attrs) {
    this.delegates = [];
    this.attrs = attrs || {};
    this.trigger = sinon.spy();
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
    assert.isUndefined(apres.widget(new MockElem));
    assert.isUndefined(apres.widget(new MockDomElem));
  });

  sinonTest('#add widget $ elem', function() {
    this.stub(apres, '$').returnsArg(0);

    var params = {foo: 'bar'};
    var elem = new MockElem;
    var callback = sinon.spy(function(err, w) {
      assert.isNull(err, 'err not null');
      assert.strictEqual(w, apres.widget(elem));
      assert.instanceOf(w, Widget);
      assert.strictEqual(w.elem, elem);
      assert.strictEqual(w.params, params);
    });
    apres.widget(elem, Widget, params, callback);
    assert.equal(callback.callCount, 1);
  });

  sinonTest('#add widget DOM elem', function() {
    var params = {green: 'eggs'};
    var elem = new MockDomElem;
    var callback = sinon.spy(function(err, w) {
      assert.isNull(err, 'err not null');
      assert.strictEqual(w, apres.widget(elem));
      assert.instanceOf(w, Widget);
      assert.deepEqual(w.elem, apres.$(elem));
      assert.strictEqual(w.params, params);
    });
    apres.widget(elem, Widget, params, callback);
    assert.equal(callback.callCount, 1);
  });

  sinonTest('#add widget no params', function() {
    var elem = new MockDomElem;
    var callback = sinon.spy(function(err, w) {
      assert.isNull(err, 'err not null');
      assert.strictEqual(w, apres.widget(elem));
      assert.instanceOf(w, Widget);
      assert.deepEqual(w.elem, apres.$(elem));
    });
    apres.widget(elem, Widget, null, callback);
    assert.equal(callback.callCount, 1);
  });

  sinonTest('#widget delegated', function() {
    this.stub(apres, '$').returnsArg(0);

    var params = {blue: 'eggs'};
    var elem = new MockDomElem;
    var EventedWidget = function(elemArg, paramsArg) {
      assert.deepEqual(elemArg, elem);
      this.elem = elemArg;
      assert.strictEqual(paramsArg, params);
      this.params = paramsArg;
      this.events = {
        'blur #glasses': handler
      }
    }
    assert.equal(elem.delegates.length, 0);
    var callback = sinon.spy(function(err, widget) {
      assert.isNull(err, 'err not null');
      assert.instanceOf(widget, EventedWidget);
      assert.equal(elem.delegates.length, 1);
      assert.startsWith(elem.delegates[0].eventName, 'blur');
      assert.equal(elem.delegates[0].selector, '#glasses');
      assert.strictEqual(elem.delegates[0].method(), widget);
    });
    var widget = apres.widget(elem, EventedWidget, params, callback);
    assert.equal(callback.callCount, 1, 'callback not called');
  });

  sinonTest('#widget ready event', function() {
    this.stub(apres, '$').returnsArg(0);

    var elem = new MockDomElem;
    assert(!elem.trigger.called, 'widget ready fired prematurely');
    var widget;
    apres.widget(elem, Widget, function(err, w) {widget = w});
    this.clock.tick(1);
    assert(elem.trigger.calledOnce, 'widget ready did not fire');
    assert.strictEqual(elem.trigger.args[0][1], widget);
  });

  sinonTest('#widget ready event pending widget', function() {
    this.stub(apres, '$').returnsArg(0);

    var elem = new MockDomElem;
    var widgetReadyCallback;
    var PendingWidget = function(elemArg, paramsArg, readyArg) {
      this.elem = elemArg;
      this.params = paramsArg;
      assert.isFunction(readyArg)
      readyArg(false);
      widgetReadyCallback = readyArg;
    }
    var widget;
    apres.widget(elem, PendingWidget, function(err, w) {widget = w});
    this.clock.tick(1);
    assert(!elem.trigger.called, 'widget ready fired prematurely');
    widgetReadyCallback();
    this.clock.tick(1);
    assert(elem.trigger.calledOnce, 'widget ready did not fire');
    assert.strictEqual(elem.trigger.args[0][1], widget);
  });

  sinonTest('#widget ready callback is one-shot', function() {
    this.stub(apres, '$').returnsArg(0);
    var elem = new MockDomElem;
    var widgetReadyCallback;
    var PendingWidget = function(elemArg, paramsArg, readyArg) {
      this.elem = elemArg;
      this.params = paramsArg;
      assert.isFunction(readyArg)
      readyArg(false);
      widgetReadyCallback = readyArg;
    }
    apres.widget(elem, PendingWidget);
    var widget = apres.widget(elem, PendingWidget);
    this.clock.tick(1);
    assert(!elem.trigger.called, 'widget ready fired prematurely');
    widgetReadyCallback();
    this.clock.tick(1);
    assert(elem.trigger.calledOnce, 'widget ready did not fire');
    widgetReadyCallback();
    this.clock.tick(1);
    assert(elem.trigger.calledOnce, 'widget ready fired more than once');
    widgetReadyCallback(false);
    widgetReadyCallback();
    this.clock.tick(1);
    assert(elem.trigger.calledOnce, 'widget ready fired more than once');
  });

  sinonTest('#widget ready callback no-op after constructor', function() {
    this.stub(apres, '$').returnsArg(0);
    var elem = new MockDomElem;
    var widgetReadyCallback;
    var SyncWidget = function(elemArg, paramsArg, readyArg) {
      this.elem = elemArg;
      this.params = paramsArg;
      assert.isFunction(readyArg)
      widgetReadyCallback = readyArg;
    }

    apres.widget(elem, SyncWidget);
    this.clock.tick(1);
    assert(elem.trigger.calledOnce, 'widget ready not called');
    widgetReadyCallback();
    this.clock.tick(1);
    assert(elem.trigger.calledOnce, 'widget ready fired more than once');
  });

  sinonTest('#widget by module name', function() {
    this.stub(apres, '$').returnsArg(0);
    var MyWidget = function(elem, params) {
      this.params = params;
    }
    this.stub(apres, 'require', function(deps, cb) {cb(MyWidget)});
    var callback = sinon.spy(function(err, widget) {
      assert.instanceOf(widget, MyWidget);
    });
    var widget;
    apres.widget(new MockDomElem, 'MyWidget', null, callback);
    assert.equal(callback.callCount, 1);
  });

  sinonTest('#widget simple widget params', function() {
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
    apres.widget(elem, 'ParamsWidget');
    var widget = apres.widget(elem);
    assert.deepEqual(widget.params, {
      strP: 'Prts',
      strP2: 'yoyo',
      intP: 42,
      boolP: true,
      floatDefault: 17
    });
  });

  for (paramType in {'scriptSrc':1, 'textSrc':1, 'jsonSrc':1}) {
    sinonTest('#widget ' + paramType + ' param', function() {
      var xyz = "this.is.a.xyz()";
      this.stub(apres, 'require', function(deps, cb) {
        assert.ok(deps[0].indexOf('path/to/src') !== -1, 'path not found');
        cb(xyz)
      });
      var paramMap = {
        xyz: {type: paramType}
      };
      var params = apres.convertParams({xyz: 'path/to/src'}, paramMap);
      assert.isFunction(params.xyz.done);
      var callback = sinon.spy(function(text) {
        assert.equal(text, xyz);
      });
      var errback = sinon.spy();
      params.xyz.done(callback);
      params.xyz.fail(errback);
      assert.equal(callback.callCount, 1);
      assert.equal(errback.callCount, 0);
    });

    sinonTest('#widget ' + paramType + ' param error', function() {
      this.stub(apres, 'require', function(deps, cb, eb) {eb();});
      var paramMap = {
        xyz: {type: paramType}
      };
      var params = apres.convertParams({xyz: 'path/to/src'}, paramMap);
      assert.isFunction(params.xyz.done);
      var callback = sinon.spy();
      var errback = sinon.spy();
      params.xyz.done(callback);
      params.xyz.fail(errback);
      assert.equal(callback.callCount, 0);
      assert.equal(errback.callCount, 1);
    });
  }

  sinonTest('#widget json param', function() {
    var xyz = '{"foo":123}';
    this.stub(apres, 'require', function(deps, cb) {
      assert.ok(deps[0].indexOf('path/to/src') !== -1, 'path not found');
      cb(xyz)
    });
    var paramMap = {
      xyz: {type: 'json'}
    };
    var params = apres.convertParams({xyz: xyz}, paramMap);
    assert.equal(params.xyz.foo, 123);
  });

  testing.asyncTest('#widget type param widget ready before', function(sandbox, done) {
    var targetElem = $('<div></div>');
    var TargetWidget = function(){};
    apres.widget(targetElem, TargetWidget, null, function(err, target) {
      var params = apres.convertParams(
        {target: targetElem}, {target: {type: 'widget'}});
      params.target.done(function(target) {
        assert.instanceOf(target, TargetWidget);
        done();
      });
    });
  });

  testing.asyncTest('#widget type param widget ready after', function(sandbox, done) {
    sandbox.stub(apres, '$').returnsArg(0);
    var targetElem = new MockElem;
    targetElem.one = function(eventName, cb) {
      targetElem.trigger = function(triggeredEventName) {
        assert.strictEqual(triggeredEventName, eventName);
        cb();
      }
    }
    var TargetWidget = function(){};
    var params = apres.convertParams(
      {target: targetElem}, {target: {type: 'widget'}});
    params.target.done(function(target) {
      assert.instanceOf(target, TargetWidget);
      done();
    });
    apres.widget(targetElem, TargetWidget);
  });

  sinonTest('#widget widget param precedence', function() {
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
    apres.widget(elem, 'ParamsWidget', {strP:"ZZZ", extra:"foo"});
    var widget = apres.widget(elem);
    assert.deepEqual(widget.params, {
      strP: 'Prts',
      strP2: 'yoyo',
      intP: 42,
      boolP: true,
      floatDefault: 17,
      extra: "foo"
    });
  });

  sinonTest('#widget skin', function() {
    this.stub(apres, '$').returnsArg(0);
    var Widget = function() {};
    var Skin = sinon.spy();
    var elem = new MockDomElem;
    apres.widget(elem, Widget, Skin);
    assert(Skin.calledWithNew(), 'Skin constructor not called');
    assert.strictEqual(Skin.args[0][0], elem,
      'Skin constructor not passed elem');
    assert.instanceOf(Skin.args[0][1], Widget,
      'Skin constructor not passed widget');
  });

  sinonTest('#widget skin layout', function() {
    var Widget = sinon.spy();
    var layoutFunc = sinon.spy();
    var Skin = function() {
      this.layout = layoutFunc;
    }
    var elem = new MockDomElem;
    assert.equal(layoutFunc.callCount, 0);
    apres.widget(elem, Widget, Skin);
    assert.equal(layoutFunc.callCount, 1);
  });

  sinonTest('#widget skin elem', function() {
    var delegate = this.stub(apres, 'delegate');
    var Widget = function() {
      this.events = {};
    }
    var elem = $('<div></div>')
    var skinElem = elem.wrap('<div class="skin-wrapper"></div>');
    var Skin = function() {
      this.elem = skinElem;
    }
    assert.equal(delegate.callCount, 0);
    apres.widget(elem, Widget, Skin);
    assert.equal(delegate.callCount, 1);
    assert.strictEqual(delegate.args[0][1], skinElem);
  });

  sinonTest('#widget skin events', function() {
    var delegate = this.stub(apres, 'delegate');
    var Widget = sinon.spy();
    var elem = $('<div></div>')
    var Skin = function() {
      this.events = {};
    }
    assert.equal(delegate.callCount, 0);
    apres.widget(elem, Widget, Skin);
    assert.equal(delegate.callCount, 1);
    assert.instanceOf(delegate.args[0][0], Skin);
    assert.deepEqual(delegate.args[0][1].get(0), elem.get(0));
  });

  sinonTest('#widget skin events and elem', function() {
    var delegate = this.stub(apres, 'delegate');
    var Widget = sinon.spy();
    var elem = $('<div></div>')
    var skinElem = elem.wrap('<div class="skin-wrapper"></div>');
    var Skin = function() {
      this.events = {};
      this.elem = skinElem;
    }
    assert.equal(delegate.callCount, 0);
    apres.widget(elem, Widget, Skin);
    assert.equal(delegate.callCount, 1);
    assert.instanceOf(delegate.args[0][0], Skin);
    assert.deepEqual(delegate.args[0][1].get(0), skinElem.get(0));
  });

  testing.asyncTest('#widget by name', function(sandbox, done) {
    var Widget = function() {
      done();
    }
    define('#apres-test-widget-by-name', function() {return Widget});
    apres.widget(new MockDomElem, '#apres-test-widget-by-name');
  });

  testing.asyncTest('#widget default skin', function(sandbox, done) {
    var Widget = sinon.spy();
    define('#apres-test-widget-default-skin', function() {return Widget});
    Widget.skins = {
      default: function() {
        done();
      }
    }
    apres.widget(new MockDomElem, '#apres-test-widget-default-skin');
  });

  suite('apres.srcPromise()');

  sinonTest('#success', function() {
    var xyz = "this.is.a.xyz()";
    this.stub(apres, 'require', function(deps, cb) {
      assert.ok(deps[0].indexOf('path/to/src') !== -1, 'path not found');
      cb(xyz)
    });
    var promise = apres.srcPromise('path/to/src');
    assert.isFunction(promise.done);
    var callback = sinon.spy(function(text) {
      assert.equal(text, xyz);
    });
    var errback = sinon.spy();
    promise.done(callback);
    promise.fail(errback);
    assert.equal(callback.callCount, 1);
    assert.equal(errback.callCount, 0);
  });

  sinonTest('#success with plugin', function() {
    var xyz = "this.is.a.xyz()";
    this.stub(apres, 'require', function(deps, cb) {
      assert.ok(deps[0].indexOf('plugin!path/to/src') !== -1, 'path not found');
      cb(xyz)
    });
    var promise = apres.srcPromise('path/to/src', 'plugin');
    assert.isFunction(promise.done);
    var callback = sinon.spy(function(text) {
      assert.equal(text, xyz);
    });
    var errback = sinon.spy();
    promise.done(callback);
    promise.fail(errback);
    assert.equal(callback.callCount, 1);
    assert.equal(errback.callCount, 0);
  });

  sinonTest('#error', function() {
    this.stub(apres, 'require', function(deps, cb, eb) {eb()});
    var promise = apres.srcPromise('gonna/error/out');
    assert.isFunction(promise.done);
    var callback = sinon.spy();
    var errback = sinon.spy();
    promise.done(callback);
    promise.fail(errback);
    assert.equal(callback.callCount, 0);
    assert.equal(errback.callCount, 1);
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
    assert.isUndefined(apres.controller());
  });

  suite('apres.getParamsFromElem()');
  sinonTest('# custom params', function() {
    this.stub(apres, '$').returnsArg(0);
    var paramsMap = {
      strP: "String param with only descr",
      strP2: {type: 'string', descr: 'String param with type', default: 'yoyo'},
      intP: {type: 'int'},
      floatP: {type: 'float'},
      floatDefault: {type: 'float', default: 17},
      boolP: {type: 'bool'}
    }
    var elem = new MockDomElem;
    elem.attr('data-controller-strP', 'Prts');
    elem.attr('data-controller-intP', '42');
    elem.attr('data-controller-boolP', 'YES');
    elem.attr('data-controller-extraP', 'huh?');
    var r = apres.getParamsFromElem(elem, paramsMap, 'data-controller-');
    assert.deepEqual(r, {
      strP: 'Prts',
      strP2: 'yoyo',
      intP: 42,
      boolP: true,
      floatDefault: 17
    });
  });

});
