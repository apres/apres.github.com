if (!requirejs) var requirejs = require('./requirejs_config').config();

requirejs(['apres', 'chai'], function(apres, chai) {
  var expect = chai.expect, assert = chai.assert;

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

  test('#basic events', function() {
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

  test('#bindee default', function() {
    var elem = new MockElem;
    var events = {'foo': handler};
    apres.delegate(events, elem);
    assert.equal(elem.delegates.length, 1);
    assert.equal(elem.delegates[0].eventName, 'foo');
    assert.strictEqual(elem.delegates[0].method(), events);
  });

  test('#inner events bindee', function() {
    var elem = new MockElem;
    var controller = {
      events: {'bar': handler}
    };
    apres.delegate(controller, elem);
    assert.equal(elem.delegates.length, 1);
    assert.equal(elem.delegates[0].eventName, 'bar');
    assert.strictEqual(elem.delegates[0].method(), controller);
  });

  test('#inner events function', function() {
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

  test('#inner elem', function() {
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
  var Widget = function(elem, params) {
    this.elem = elem;
    this.params = params;
  }

  test('#get unknown widget', function() {
    assert.isUndefined(apres.widget(new Mock$Elem));
    assert.isUndefined(apres.widget(new MockDomElem));
  });

  test('#add widget $ elem', function() {
    var params = {foo: 'bar'};
    var elem = new Mock$Elem;
    var w = apres.widget(elem, Widget, params);
    assert.strictEqual(w, apres.widget(elem));
    assert.instanceOf(w, Widget);
    assert.strictEqual(w.elem, elem);
    assert.strictEqual(w.params, params);
  });

  test('#add widget DOM elem', function() {
    var params = {green: 'eggs'};
    var elem = new MockDomElem;
    var w = apres.widget(elem, Widget, params);
    assert.strictEqual(w, apres.widget(elem));
    assert.instanceOf(w, Widget);
    assert.strictEqual(w.elem, elem);
    assert.strictEqual(w.params, params);
  });

  test('#add widget delegates', function() {
    var params = {blue: 'eggs'};
    var elem = new MockDomElem;
    var EventedWidget = function(elemArg, paramsArg) {
      assert.strictEqual(elemArg, elem);
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
