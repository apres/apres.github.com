// Apres (DEVELOPMENT) Copyright (c) 2012 Casey Duncan, all rights reserved
// Apres is distributed freely under the MIT license
// See http://apres.github.com/ for details

/* global requirejs, document */

// Setup default Apres require config
requirejs.config({
  paths: {
    // Default paths to find core app and core widget modules
    app: '../app',
    widget: '../widget',
    // Core libs
    jquery: '//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min',
    underscore: 'underscore-1.3.3',
    require: 'require-1.0.8',
    pubsub: 'pubsub-1.2.0',
    store: 'store-1.3.3',
    showdown: 'showdown-0.1.0',
    CoffeeScript: 'coffeescript-1.3.3',
    querystring: 'querystring-0.5.0',
    handlebars: 'handlebars-1.0.0.beta.6',
    highlight: 'highlight-7.0',
    chai: 'chai-1.0.4',
    sinon: 'sinon-1.3.4',
    bootstrap: 'bootstrap-2.0.4',
    // Requirejs plugins
    text: 'require-plugins/text-1.0.8',
    cs: 'require-plugins/cs-0.4.0',
    domReady: 'require-plugins/domReady-1.0.0',
    async: 'require-plugins/async-0.1.1',
    depend: 'require-plugins/depend-0.1.0',
    font: 'require-plugins/font-0.2.0',
    google: 'require-plugins/goog-0.2.0',
    image: 'require-plugins/image-0.2.1',
    json: 'require-plugins/json-0.2.1',
    noext: 'require-plugins/noext-0.3.1',
    markdown: 'require-plugins/mdown-0.1.1',
    propertyParser: 'require-plugins/propertyParser-0.1.0',
    component: 'require-plugins/component-0.0.0',
  }
});

define('apres',
  ['require', 'module', 'querystring', 'jquery', 'pubsub'],
  function(require, module, querystring, $, pubsub) {
    var apres  = {};
    apres.VERSION = 'dev';

    // Unit test dependency injection points
    apres.$ = $;
    apres.pubsub = pubsub;

    // PubSub Event topics
    var topic = apres.topic = {
      all: 'apres',
      widget: 'apres.widget',
      widgetReady: 'apres.widget.widgetReady'
    }

    var eventSplitter = /^(\S+)\s*(.*)$/;

    // Backbone-style event delegation
    // Sets up event delegation for document elements to application code.
    //
    // @events is an object that maps event name/element selector pairs to
    // handler functions. @events may also be an object with an `events`
    // attribute containing this mapping. This is common with controllers and
    // widgets. The @events value may also be a function that will be called
    // to derive the mapping so that it can be created dynamically. Example:
    //
    // {
    //    'click button#ok': function(event) {...},
    //    'change #entry-form input': 'validate'
    // }
    //
    // If the handler function is specified as a string, it is assumed to be a
    // method name of the containing object. Note @events is the only required
    // argument.
    //
    // @elem is the root DOM element queried to find the elements to bind to.
    // If not specified it is assumed to be `events.elem`.
    //
    // @bindee is the object to bind the handler functions to, making it the
    // value of `this` inside the handlers. If omitted, it is assumed to be
    // @events.
    apres.delegate = function(events, elem, bindee) {
      if (!bindee) var bindee = events;
      if (!elem) {
        var elem = bindee.elem;
      } else {
        elem = apres.$(elem);
      }
      if (events.events) events = events.events;
      if (typeof events === 'function') events = events();
      if (events) {
        for (var key in events) {
          var method = events[key];
          if (typeof method !== 'function') method = bindee[method];
          if (typeof method !== 'function') throw new Error('No method named "' + events[key] + '"');
          var match = key.match(eventSplitter);
          var eventName = match[1], selector = match[2];
          method = method.bind(bindee);
          if (selector) {
            elem.delegate(selector, eventName, method);
          } else {
            elem.bind(eventName, method);
          }
        }
      }
      return this;
    }

    var widgetIdAttrName = 'data-apres-pvt-widget-id';
    var widgetId = 0;
    var widgets = {};
    var pendingWidgets = {};

    var widgetsArePending = function() {
      for (var id in pendingWidgets) {
        return true;
      }
      return false;
    }

    // Get or install a widget object for an element
    apres.widget = function(elem, WidgetFactory, params) {
      var id, widget;
      elem = apres.$(elem);
      if (typeof WidgetFactory === 'undefined') {
        id = elem.attr(widgetIdAttrName);
        if (typeof id !== 'undefined') {
          return widgets[id];
        }
      } else {
        id = widgetId++;
        var registerWidget = function() {
          widget.events && apres.delegate(widget, elem);
          apres.pubsub.publish(topic.widgetReady, {widget: widget, elem: elem});
        }
        var widgetReady = function(isReady) {
          if (isReady === false && typeof pendingWidgets[id] === 'undefined') {
            pendingWidgets[id] = true;
          } else if (pendingWidgets[id]) {
            pendingWidgets[id] = false;
            registerWidget();
          }
        }
        var widget = widgets[id] = new WidgetFactory(elem, params, widgetReady);
        if (!pendingWidgets[id]) registerWidget();
        elem.attr(widgetIdAttrName, id);
        return widget;
      }
    }

    var doc;

    var insertWidget = function(elem, name) {
      if (!name || elem.getAttribute(widgetIdAttrName)) return;
      require([name], function(WidgetFactory) {
          var i, params, paramName;
          if (typeof WidgetFactory === 'function') {
            if (WidgetFactory.widgetParams) {
              params = {};
              for (i = 0; (paramName = WidgetFactory.widgetParams[i]); i++) {
                params[paramName] = elem.getAttribute('data-widget-' + paramName);
              }
            }
            apres.widget(elem, WidgetFactory, params);
          } else {
            console && console.error('Apres - widget module ' + name + ' did not return a function');
          }
        }
      );
    }

    var scanning = false;
    var scans;
    // limit re-entrant calls to findWidgets to avoid infinite loops
    var maxScans = 1000; 
    var elemQueue = [];

    // Scan the document element for widgets and initialize them when found.
    // The function is re-entrant, so if a widget modifies the DOM at any
    // time, including during its own initialization, it can call this method
    // to include any new widgets declared in the document. 
    //
    // @elem is the DOM element to be scanned. If omitted, the entire document
    // is scanned.
    apres.findWidgets = function(elem) {
      if (typeof elem == 'undefined') {
        if (!doc) throw new Error('document not defined, did you call apres.initialize()?');
        var elem = doc.documentElement;
      }
      elemQueue.push(elem);
      if (!scanning) {
        var widgetElems, i, widgetElem, widgetName;
        scanning = true;
        scans = 0;
        while (scanning && (elem = elemQueue[0])) {
          // Rather than simply popping, we remove all matching
          // elements in the queue to avoid duplicate scans
          elemQueue = elemQueue.filter(function(queueElem) {
            queueElem !== elem
          });
          elem.getElementsByClassName || (elem = elem.get(0));
          widgetElems = elem.getElementsByClassName('widget');
          for (i = 0; (widgetElem = widgetElems[i]); i++) {
            insertWidget(widgetElem, widgetElem.getAttribute('data-widget'));
          }
        }
        scanning = false;
      } else if (++scans > maxScans) {
        scanning = false;
        throw new Error('Too many calls to apres.findWidgets(), widgets may be infinitely nested');
      }
    }

    apres.initialize = function(document) {
      doc = document;
      // Find controller for this view
      // First look for a data-apres-controller attribute on the <html> tag
      // failing that, look for a module peer to the html page
      if (doc.documentElement) {
        apres.controllerName = doc.documentElement.getAttribute('data-apres-controller');
      }
      apres.queryParams = querystring.parse(document.location.search.slice(1));

      var initView = function(controller) {
        apres.controller = controller;
        apres.$(doc).ready(function() {
          if (controller) {
            if (typeof controller.ready === 'function') controller.ready(apres.queryParams);
            apres.delegate(controller, doc.documentElement);
          }
          apres.findWidgets();
        });
      }
      if (apres.controllerName) {
        require([apres.controllerName], initView);
      } else {
        initView();
      }
    }
    if (typeof document !== 'undefined') {
      // Bootstrap the current document
      apres.initialize(document);
    }
    return apres;
  }
);

// bind shim for js < 1.8.5 from
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }
    var aArgs = Array.prototype.slice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP ? this : oThis,
            aArgs.concat(Array.prototype.slice.call(arguments)));
      };
    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
    return fBound;
  };
}

// Object.create shim for js < 1.8.5 from
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/create
if (!Object.create) {
    Object.create = function (o) {
        if (arguments.length > 1) {
            throw new Error('Object.create implementation only accepts the first parameter.');
        }
        function F() {}
        F.prototype = o;
        return new F();
    };
}

