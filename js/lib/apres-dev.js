// Apres (DEVELOPMENT) Copyright (c) 2012 Casey Duncan, all rights reserved
// Apres is distributed freely under the MIT license
// See http://apres.github.com/ for details

/* global require, document */

// Setup default Apres require config
require.config({
  paths: {
    // Application modules are accessed as: app/mymodule
    // which maps to the site relative path: /js/app/mymodule.js
    // This supports loading libraries from
    // CDN while loading app code from the app server host
    app: '/js/app',
    // Core libs
    // apres: 'apres-dev',
    jquery: 'http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min',
    underscore: 'underscore-1.3.3',
    require: 'require-1.0.8',
    pubsub: 'pubsub-1.2.0',
    store: 'store-1.3.3',
    showdown: 'showdown-0.1.0',
    CoffeeScript: 'coffeescript-1.3.3',
    querystring: 'querystring-0.5.0',
    handlebars: 'handlebars-1.0.0.beta.6',
    // Requirejs plugins
    text: 'require-plugins/text-1.0.8',
    cs: 'require-plugins/cs-0.4.0',
    domReady: 'require-plugins/domReady-1.0.0',
    async: 'require-plugins/async-0.1.1',
    depend: 'require-plugins/depend-0.1.0',
    font: 'require-plugins/font-0.2.0',
    goog: 'require-plugins/goog-0.2.0',
    image: 'require-plugins/image-0.2.1',
    json: 'require-plugins/json-0.2.1',
    noext: 'require-plugins/noext-0.3.1',
    mdown: 'require-plugins/mdown-0.1.1',
    propertyParser: 'require-plugins/propertyParser-0.1.0',
    component: 'require-plugins/component-0.0.0'
  }
});

define('apres',
  ['require', 'module', 'querystring', 'domReady'],
  function(require, module, querystring, domReady) {
    var apres  = {};
    apres.VERSION = '0.0.0';

    // Find controller for this view
    // First look for a data-apres-controller attribute on the <html> tag
    // failing that, look for a module peer to the html page
    var doc = document || require.document; // Allow tests to inject document
    var htmlElem = doc.getElementsByTagName('html')[0];
    if (typeof htmlElem !== 'undefined') {
      apres.controllerName = htmlElem.getAttribute('data-apres-controller');
    } else {
      apres.controllerName = doc.location.pathname;
      if (apres.controllerName.slice(-1) === '/') {
        var cfg = module.config();
        apres.controllerName += (cfg && cfg.defaultDocument) || 'index.html';
      }
    }
    apres.queryParams = querystring.parse(doc.location.search);
    var widgets = {};
    var widgetIdAttrName = 'data-apres-pvt-widget-id';

    // Get or install a widget object for an element
    apres.widget = function(elem, widgetFactory, params) {
      if (widgetFactory === null) {
        var widgetId;
        if (elem.attr) {
          widgetId = elem.attr(widgetIdAttrName);
        } else {
          widgetId = elem.getAttribute(widgetIdAttrName);
        }
        if (widgetId !== null) {
          return widgets[widgetId];
        }
      } else {
        var id;
        do {
          id = Math.random().toString().slice(2);
        } while (widgets[id] !== null);
        var widget = widgets[id] = widgetFactory(elem, params);
        if (elem.attr) {
          elem.attr(widgetIdAttrName, id);
        } else {
          elem.setAttribute(widgetIdAttrName, id);
        }
        return widget;
      }
    }

    var insertWidget = function(id, name, elem) {
      require([name], function(widgetFactory) {
          if (typeof widgetFactory === 'function') {
            id = id.toString();
            widgets[id] = widgetFactory(elem);
            elem.setAttribute(widgetIdAttrName, id); 
          } else {
            console && console.error('Apres - widget module ' + name + ' did not return a function');
          }
        }
      );
    }

    require([apres.controllerName], function(controller) {
        apres.controller = controller;
        domReady(function() {
            controller.ready && controller.ready(apres.queryParams);

            var widgets = doc.getElementsByClassName('widget');
            var i, widgetElem;
            for (i = 0; (widgetElem = widgets[i]); i++) {
              var widgetName = widgetElem.getAttribute('data-widget');
              widgetName && insertWidget(i, widgetName, widgetElem);
            }
          }
        );
      }
    );

    return apres;
  }
);
