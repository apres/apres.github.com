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
    apres: 'apres-dev',
    jquery: 'http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min',
    underscore: 'underscore-1.3.3',
    require: 'require-1.0.8',
    pubsub: 'pubsub-1.2.0',
    store: 'store-1.3.3',
    showdown: 'showdown-0.1.0',
    CoffeeScript: 'coffeescript-1.3.3',
    querystring: 'querystring-0.5.0',
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

define(
  ['require', 'module', 'querystring', 'domReady'],
  function(require, module, querystring, domReady) {
    var apres = {};
    apres.VERSION = '0.0.0';

    // Find controller for this view
    // First look for a data-apres-controller attribute on the <html> tag
    // failing that, look for a module peer to the html page
    var doc = document || require.document; // Allow tests to inject document
    var htmlElem = doc.getElementsByTagName('html')[0];
    if (typeof(htmlElem) !== 'undefined') {
      apres.controllerName = htmlElem.getAttribute('data-apres-controller');
    } else {
      apres.controllerName = doc.location.pathname;
      if (apres.controllerName.slice(-1) === '/') {
        var cfg = module.config();
        apres.controllerName += (cfg && cfg.defaultDocument) || 'index.html';
      }
    }
    apres.queryParams = querystring.parse(doc.location.search);

    require([apres.controllerName], function(controller) {
        if (controller === null) {
          throw "Apres - Could not load controller " + controllerName;
        }
        apres.controller = controller;
        if (controller.ready) {
            domReady(function() {
              controller.ready(apres.queryParams);
            }
          );
        }
      }
    );

    return apres;
  }
);
