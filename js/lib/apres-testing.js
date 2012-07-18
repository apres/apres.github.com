//# Testing Utility and Scaffold Module 
// for writing tests for Apres and Apres apps.
//
// **This module assumes mocha.js has been loaded globally**
//
// by Casey Duncan
// Part of the Apres suite http://apres.github.com
// Apres is released under the MIT license

define(['apres', 'sinon', 'chai', 'jquery'], function(apres, sinon, chai, jquery) {
  var assert = chai.assert;
  var testing = {};

  //## Sinon Test Case
  //
  // Sinon test wrapper automatically creates a sandbox that will be torn down
  // after the test. This should not be used for testing async callbacks, for
  // that use `asyncTest()` below.
  //
  // **name** A string name for the test case. Used in the report and for
  // grepping specific tests.
  //
  // **func** A function containing the test case code and assertions. Inside
  // this function `this` is bound to the sinon sandbox created for the test
  // case.
  //
  testing.test = function(name, func) {
    return test(name, sinon.test(func));
  }

  //## Async Sinon Test Case
  //
  // Sinon test wrapper for testing async code. Passes a `done()` function
  // that is called from the test's async callback after its assertions to
  // ensure that the callback has been invoked. If `done()` is not called
  // within 2 seconds, the test fails with a timeout.
  //
  // **name** A string name for the test case. Used in the report and for
  // grepping specific tests.
  //
  // **func** A function containing the test case code and assertions. This
  // function is passed the sinon sandbox for the test case, and the `done()`
  // function as its arguments. `done()` must be called within the 2 second
  // timeout for the test to pass.
  //
  testing.asyncTest = function(name, func) {
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

  //## Module Test Case
  //
  // Sinon test wrapper for testing a particular requirejs module. The
  // module is loaded and passed to the test case function.
  //
  // **name** test case name.
  //
  // **moduleName** requirejs module name to load and pass to the test case
  // function.
  //
  // **func** test case function called with two arguments. The sinon
  // sandbox, and the module loaded.
  //
  testing.moduleTest = function(name, moduleName, func) {
    var tfn = function(done) {
      var sandbox = sinon.sandbox.create();
      try {
        requirejs([moduleName], function(module) {
          if (module == null) assert.fail(moduleName + ' did not load');
          func(sandbox, module);
          done();
        });
      } finally {
        sandbox.verifyAndRestore();
      }
    }
    return test(name, tfn);
  }

  //## Deferred Promise
  //
  // Create a deferred promise object that delivers a specific data object
  // for testing.
  testing.Promise = function(data) {
    var p = $.Deferred();
    p.resolve(data);
    return p.promise();
  }

  //## Inject Text Resource
  //
  // Injects a stub into Apres so that the next resource loaded via
  // `apres.srcPromise()` will return the text provided. This is useful
  // for testing widgets that load resources asynchronously.
  //
  // **sandbox** sinon sandbox for creating the stub. This ensures
  // that the stub is automatically removed when the test completes.
  //
  // **text** The text of the injected resource to be returned.
  //
  // **expectedUrl** optional expected url of the text resource. If provided
  // this will be checked against the actual resource url that is loaded.
  //
  // Return the sinon stub in case the test case wishes to preform assertions
  // on it.
  //
  testing.injectSrc = function(sandbox, text, expectedUrl) {
    return sandbox.stub(apres, 'srcPromise', function(url, type) {
      if (expectedUrl != null) assert.strictEqual(url, expectedUrl);
      return testing.Promise(text);
    });
  }

  //## jQuery DOM Element Mocks
  //
  // Use these mocks for testing things that expect jQuery-style elements.

  //### Basic Element Mock
  //
  // Provides spy methods for simple uses.
  testing.BasicElem = function() {
    return {
      html: sinon.spy(),
      find: sinon.spy(),
      attr: sinon.spy(),
      addClass: sinon.spy(),
      removeClass: sinon.spy(),
      trigger: sinon.spy(),
    }
  }

  //### Mock Element with Attributes
  //
  // Provides attribute getter/setter
  testing.AttrElem = function(attrs) {
    var attrs = attrs || {};
    var elem = testing.BasicElem();
    elem.attr = elem.getAttribute = elem.setAttribute = function(name, value) {
      if (typeof value === 'undefined') {
        return attrs[name];
      } else {
        attrs[name] = value;
      }
    }
    return elem;
  }

  //## Basic Widget Test Cases
  //
  // Simple qunit test cases for widgets. Use these as initial tests for any
  // widget.
  
  var widgetName = function(path) {
    var parts = path.split('/');
    return parts[parts.length - 1];
  }

  //### Test Widget Module and Constructor
  //
  // Test that the widget can be loaded from the specified module name
  // and that the constructor successfully returns the expected instance type.
  //
  // **moduleName** widget requirejs module name string.
  //
  // **params** optional parameter object to pass to the widget constructor.
  //
  testing.testWidgetModule = function(moduleName, params) {
    return testing.asyncTest('#' + widgetName(moduleName) + ' module', 
      function(sandbox, done) {
        var elem = testing.BasicElem();
        requirejs([moduleName], function(Constructor) {
          assert.isFunction(Constructor, moduleName + ' did not return a constructor function');
          var widget = new Constructor(elem, params, sinon.spy());
          assert.instanceOf(widget, Constructor, 
            moduleName + ' constructor did not return expected instance type');
          done();
        });
      }
    );
  }

  //### Test Widget Element
  //
  // Assert that the element supplied to the widget constructor is exposed as
  // the attribute `$el` of the widget object.
  //
  // **moduleName** widget requirejs module name string.
  //
  // **params** optional parameter object to pass to the widget constructor.
  //
  testing.testWidgetElem = function(moduleName, params) {
    return testing.asyncTest('#' + widgetName(moduleName) + ' element', 
      function(sandbox, done) {
        var elem = testing.BasicElem();
        requirejs([moduleName], function(Constructor) {
          var widget = new Constructor(elem, params, sinon.spy());
          assert.strictEqual(widget.$el, elem);
          done();
        });
      }
    );
  }

  //### Test Widget Ready Callback
  //
  // Test that a widget that loads resources asynchronously calls the
  // `widgetReady()` callback appropriately
  //
  testing.testWidgetReadyCallback = function(moduleName, params) {
    return testing.asyncTest('#' + widgetName(moduleName) + ' widgetReady() callback', 
      function(sandbox, done) {
        var elem = testing.BasicElem();
        var ready = sinon.spy();
        requirejs([moduleName], function(Constructor) {
          var widget = new Constructor(elem, params, ready);
          assert(ready.withArgs(false).calledOnce, 'widgetReady(false) not called');
          assert(ready.calledTwice, 'widgetReady() not called');
          done();
        });
      }
    );
  }

  return testing;
});
