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

  suite('apres module');
  test('#version', function() {
    assert.equal(apres.VERSION, 'dev');
  });

  suite('apres.delegate');

  var MockElem = function() {
    this.delegates = [];
    this.delegate = function(selector, eventName, method) {
      this.delegates.push({selector: selector, eventName:eventName, method:method});
    }
    this.bind = function(eventName, method) {
      this.delegates.push({eventName:eventName, method:method});
    }
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
    apres.delegate(events, elem, bindee);
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

});
