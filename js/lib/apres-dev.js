// Apres (DEVELOPMENT) Copyright (c) 2012 Casey Duncan, all rights reserved
// Apres is distributed freely under the MIT license
// See http://apres.github.com/ for details

/* global require, document */

// Setup default Apres require config
requirejs.config({
  paths: {
    // Application modules are accessed as: app/mymodule
    // which maps to the site relative path: js/app/mymodule.js
    // This supports loading libraries from
    // CDN while loading app code from the app server host
    app: '../app',
    // Core widgets map from widget/foo to js/widget/foo
    widget: '../widget',
    // Core libs
    // apres: 'apres-dev',
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
    component: 'require-plugins/component-0.0.0'
  }
});

define('apres',
  ['require', 'module', 'querystring', 'domReady'],
  function(require, module, querystring, domReady) {
    var apres  = {};
    apres.VERSION = 'dev';

    // Backbone-style event delegation
    var eventSplitter = /^(\S+)\s*(.*)$/;
    apres.delegate = function(events, elem, bindee) {
      bindee || (bindee = events);
      elem || (elem = bindee.elem);
      events.events && (events = events.events);
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
    }

    var widgetIdAttrName = 'data-apres-pvt-widget-id';
    var widgets = {};

    // Get or install a widget object for an element
    apres.widget = function(elem, WidgetFactory, params) {
      var id;
      if (typeof WidgetFactory === 'undefined') {
        id = elem.attr ? elem.attr(widgetIdAttrName) : elem.getAttribute(widgetIdAttrName);
        if (id !== null) {
          return widgets[id];
        }
      } else {
        do {
          id = Math.random().toString().slice(2);
        } while (widgets[id] !== null);
        var widget = widgets[id] = new WidgetFactory(elem, params);
        if (elem.attr) {
          elem.attr(widgetIdAttrName, id);
        } else {
          elem.setAttribute(widgetIdAttrName, id);
        }
        apres.delegate(widget, elem);
        return widget;
      }
    }

    apres.initialize = function(document) {
      // Find controller for this view
      // First look for a data-apres-controller attribute on the <html> tag
      // failing that, look for a module peer to the html page
      var htmlElem = document.getElementsByTagName('html')[0];
      if (typeof htmlElem !== 'undefined') {
        apres.controllerName = htmlElem.getAttribute('data-apres-controller');
      }
      apres.queryParams = querystring.parse(document.location.search.slice(1));
      widgets = {};

      var insertWidget = function(id, name, elem) {
        require([name], function(WidgetFactory) {
            var i, params, paramName;
            if (typeof WidgetFactory === 'function') {
              id = id.toString();
              if (WidgetFactory.widgetParams) {
                params = {};
                for (i = 0; (paramName = WidgetFactory.widgetParams[i]); i++) {
                  params[paramName] = elem.getAttribute('data-widget-' + paramName);
                }
              }
              widgets[id] = new WidgetFactory(elem, params);
              elem.setAttribute(widgetIdAttrName, id); 
            } else {
              console && console.error('Apres - widget module ' + name + ' did not return a function');
            }
          }
        );
      }
      var initView = function(controller) {
        apres.controller = controller;
        domReady(function() {
            controller && controller.ready && controller.ready(apres.queryParams);

            var widgets = document.getElementsByClassName('widget');
            var i, widgetElem;
            for (i = 0; (widgetElem = widgets[i]); i++) {
              var widgetName = widgetElem.getAttribute('data-widget');
              widgetName && insertWidget(i, widgetName, widgetElem);
            }
          }
        );
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

