// **Apres** (DEVELOPMENT) 
// Copyright (c) 2012 Casey Duncan, all rights reserved
// Apres is distributed freely under the MIT license
// See http://apres.github.com/ for details

/* global requirejs, document */

//## Setup default Apres require config
// This sets up paths for convenient lookup of modules
// and aliases simple library names to particular library versions.
requirejs.config({
  enforceDefine: true, // Puts IE on its best behavior
  paths: {
    // Default paths to find demo and core widget modules
    demo: '../demo',
    widget: '../widget',
    // Core libs
    jquery: 'jquery', //'//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min',
    underscore: 'underscore-1.3.3',
    require: 'require-1.0.8',
    pubsub: 'pubsub-1.2.0',
    store: 'store-1.3.3',
    showdown: 'showdown-0.1.0',
    CoffeeScript: 'coffeescript-1.3.3',
    querystring: 'querystring-0.5.0',
    handlebars: 'handlebars-1.0.0.beta.6',
    jade: 'jade-0.26.1',
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

//## Define the _apres_ module
define('apres',
  ['require', 'module', 'querystring', 'jquery', 'pubsub'],
  function(require, module, querystring, $, pubsub) {
    var apres  = {};
    apres.VERSION = 'dev';
    apres.MODULE_URI = module.uri;

    // Unit test dependency injection points
    apres.$ = $;
    apres.pubsub = pubsub;
    apres.require = require;

    //### Error function
    // By default non-critical errors do not throw exceptions,
    // but are logged instead. This picks the best available logging function.
    var error = function(){};
    if (console) {
      error = console.error ? console.error.bind(console) : console.log.bind(console);
    }

    //### PubSub Event topics
    var topic = apres.topic = {
      all: 'apres',
      widget: 'apres.widget',
      replaceWidget: 'apres.widget.replace',
      controller: 'apres.controller',
      replaceController: 'apres.controller.replace'
    }

    var eventSplitter = /^(\S+)\s*(.*)$/;
    var guid = 0;

    //### Backbone-style event delegation
    // Sets up event delegation for document elements to application code.
    //
    // **delegate** is an object with an attribute events containing event
    // name/element selector pairs to handler functions. The events attribute
    // may also be a function that will be called to derive the mapping so
    // that it can be created dynamically. Example:
    //
    // ```
    // delegate.events = {
    //    'click button#ok': function(event) {...},
    //    'change #entry-form input': 'validate'
    // }
    // ```
    //
    // If the handler function is specified as a string, it is assumed to be a
    // method name of delegate.
    //
    // **elem** is the element queried to find the events to bind to.
    // If not specified it is assumed to be `delegate.$el`.
    //
    apres.delegate = function(delegate, elem) {
      if (!delegate._apresGuid) delegate._apresGuid = guid++;
      if (!elem) {
        var elem = delegate.$el;
      } else {
        elem = apres.$(elem);
      }
      var events = delegate.events;
      if (typeof events === 'function') events = events();
      if (events) {
        for (var key in events) {
          var method = events[key];
          if (typeof method !== 'function') method = delegate[method];
          if (typeof method !== 'function') error('No delegate method named "' + events[key] + '"');
          var match = key.match(eventSplitter);
          var eventName = match[1], selector = match[2];
          if (selector) {
            elem.on(eventName + '.apres.delegate' + delegate._apresGuid, selector, method.bind(delegate));
          } else {
            elem.on(eventName + '.apres.delegate' + delegate._apresGuid, method.bind(delegate));
          }
        }
      }
      return this;
    }

    // Remove event bindings of the delegate to elem
    // This method does nothing if **delegate** is not bound to **elem**.
    //
    // **delegate** Object with event bindings to **elem**.
    //
    // **elem** DOM element **delegate** is bound to.
    //
    apres.undelegate = function(delegate, elem) {
      if (delegate._apresGuid) {
        if (!elem) {
          var elem = delegate.$el;
        } else {
          elem = apres.$(elem);
        }
        elem.off('.apres.delegate' + delegate._apresGuid);
      }
      return this;
    }

    //### Deferred resource loading
    // Create a *jQuery* deferred promise object to load and access a named
    // resource, optionally using a *requirejs* plugin. The resource is
    // loaded asynchronously and resolves the promise once loaded.
    //
    // **name** Resource name, a *requirejs* module name which may be an
    // absolute path, URL, or a simple name. The latter is processed through 
    // *requirejs* pathing rules.
    //
    // **plugin** Optional *requirejs* plugin to process the resource.
    // If no plugin is specified, then the resource is assumed to be
    // Javascript. Common plugins include "text", "json", and "mdown".
    //
    apres.srcPromise = function(name, plugin) {
      if (plugin) name = plugin + '!' + name;
      var deferred = apres.$.Deferred();
      apres.require([name],
        function(res) {deferred.resolve(res)},
        function(err) {deferred.reject(err)}
      );
      return deferred.promise();
    }

    // Helper function for illegal parameter value errors
    var illegalValue = function(type, name, value) {
      error('Apres - Illegal ' + type + ' value "' + value + '" for widget param "' + name + '"');
    }
    //### Widget Parameters
    // Type converters for widget parameters passed via tag attributes
    var widgetParamConvs = {
      'string': null,
      'bool': function(name, value) {
        var lc = value && value.toLowerCase();
        if (lc === 'true' || lc === 'yes' || lc === '1' || lc === true) return true;
        if (lc === 'false' || lc === 'no' || lc === '0' || lc === false) return false;
        illegalValue('boolean', name, value);
      },
      'int': function(name, value) {
        var n = parseInt(value);
        if (n === NaN) illegalValue('integer', name, value);
        return n;
      },
      'float': function(name, value) {
        var n = parseFloat(value);
        if (n === NaN) illegalValue('float', name, value);
        return n;
      },
      'selector': function(name, value) {
        return apres.$(value);
      },
      'widget': function(name, value) {
        var deferred = apres.$.Deferred(),
            elem = apres.$(value);
        var resolveWidget = function() {
          var id = elem.attr(widgetIdAttrName);
          if (id) {
            deferred.resolve(widgets[id]);
            return true;
          }
        }
        if (!resolveWidget(elem)) elem.one('widgetReady', resolveWidget);
        return deferred.promise();
      },
      // "src" types return promise objects that asynchronously provide their
      // results once the resources are loaded, or immediately if they are cached
      'scriptSrc': function(name, value) {
        return apres.srcPromise(value);
      },
      'textSrc': function(name, value) {
        return apres.srcPromise(value, 'text');
      },
      'jsonSrc': function(name, value) {
        return apres.srcPromise(value, 'json');
      },
      'json': function(name, value) {
        return apres.$.parseJSON(value);
      }
    }
    // Convert parameters from string values into types designated in *paramMap*.
    //
    // **params** An object containing parameter name/value pairs.
    //
    // **paramMap** The parameter definition map. The keys of *paramMap*
    // designate the expected parameter names. The value may either be a
    // doc string, which infers that the type is "string" with no default,
    // or an object that can specify the *type*, *default*, and *descr*
    // string for the parameter. *type* selects a type converter
    // (see `widgetParamConvs` above) to convert the value. Example:
    //
    // ```
    // paramMap = {
    //  number: {type: 'int', default: 0, descr: 'An integer param'},
    //  whyYes: {type: 'bool', descr: 'True or false, yes or no, 1 or 0'},
    //  src: {type: 'textSrc', 
    //    descr: 'Some text from a resource, preloaded for the widget'},
    //  data: {type: 'jsonSrc', deferred: true, 
    //    descr: 'external JSON data returned via a deferred promise object'},
    // }
    // ```
    // Note this function does not resolve deferred param values regardless
    // of the `deferred` paramMap flag. This is left to the caller.
    //
    apres.convertParams = function(params, paramMap) {
      var converted = {};
      for (var name in paramMap) {
        var info = paramMap[name];
        var value = params[name] || info.default;
        if (typeof value !== 'undefined') {
          if (info && info.type) {
            var convert = widgetParamConvs[info.type];
            converted[name] = convert ? convert(name, value) : value;
            if (typeof convert === 'undefined') {
              error('Apres - Unknown widget param type: ' + info.type);
            }
          } else {
            converted[name] = value;
          }
        }
      }
      return converted;
    }

    //### Extract parameters from a DOM element
    //
    // **elem** The DOM element containing parameter attributes.
    //
    // **paramMap** The parameter definition map. And object that defines
    // the *type* and *default* for each parameter, and can provide a *doc*
    // string. See `convertParams` above for more details.
    //
    // **prefix** Parameter attribute name prefix. defaults to `data-widget-`.
    // Use of a `data-` prefix is recommended for HTML5 compatibility.
    //
    apres.getParamsFromElem = function(elem, paramMap, prefix) {
      var paramPrefix = prefix || "data-widget-";
      var params = {};
      for (var paramName in paramMap) {
        params[paramName] = elem.attr(paramPrefix + paramName);
      }
      params = apres.convertParams(params, paramMap);
      return params;
    }

    // Internal widget data structures and functions
    var widgetIdAttrName = 'data-apres-pvt-widget-id';
    var widgets = {};
    var widgetPending = {};
    var setWidget = function(elem, WidgetFactory, SkinFactory, params, callback) {
      var oldId = elem.attr(widgetIdAttrName),
          oldWidget = widgets[oldId],
          promises = [];
      if (oldWidget) {
        apres.undelegate(oldWidget, elem);
        delete widgets[oldId];
        elem.attr(widgetIdAttrName, null);
      }
      if (WidgetFactory) {
        var id = guid++;
        var registerWidget = function(widget) {
          var eventElem = elem;
          if (SkinFactory) eventElem = setSkin(elem, SkinFactory, widget);
          widget.events && apres.delegate(widget, eventElem);
          elem.trigger('widgetReady', widget);
          if (oldWidget) {
            apres.pubsub.publishSync(topic.replaceWidget, 
              {elem: elem, oldWidget: oldWidget, newWidget: widget});
          }
        }
        var widgetReady = function(isReady) {
          if (isReady === false && typeof widgetPending[id] === 'undefined') {
            widgetPending[id] = true;
          } else if (widgetPending[id]) {
            widgetPending[id] = false;
            registerWidget(widgetPending[id]);
          }
        }
        if (WidgetFactory.widgetParams) {
          params = $.extend(params,
            apres.getParamsFromElem(elem, WidgetFactory.widgetParams));
          // Resolve any deferred parameter values
          $.each(WidgetFactory.widgetParams, function(name, info) {
            var value = params[name];
            if (value && value.promise && value.always && !info.deferred) {
              promises.push(value);
              value.always(function(resolved) {
                params[name] = resolved;
              });
            }
          });
        }
        // Create the widget once deferred params are resolved
        $.when.apply($, promises).always(function() {
          var widget = widgets[id] = new WidgetFactory(elem, params, widgetReady);
          elem.attr(widgetIdAttrName, id);
          if (!widgetPending[id]) registerWidget(widget);
          if (callback) callback(null, widget);
        });
      }
    }
    // Install a skin for a widget
    var setSkin = function(elem, SkinFactory, widget) {
      var skin = new SkinFactory(elem, widget);
      if (skin.layout) skin.layout();
      // Attach skin event handlers
      var skinElem = skin.elem || elem;
      if (skin.events) apres.delegate(skin, skinElem);
      return skinElem;
    }

    //### Manipulate Widgets
    // Get or install a widget object for an element
    //
    // **elem** DOM element where the widget is installed.
    //
    // **WidgetFactory** a constructor function for the widget, or a module name
    // for the widget constructor.
    //
    // **SkinFactory** an optional constructor function for the widget's skin,
    // or a module name for the skin constructor. Note if both `WidgetFactory`
    // and `SkinFactory` are specified, they must be of the same type. If 
    // no skin is desired, but a callback is needed you should pass `null` for 
    // this argument to prevent ambiguity.
    //
    // **params** an optional parameter object passed to the WidgetFactory.
    // if not provided, the parameters will be derived from the element's
    // `data-widget-*` attributes. To explicitly specify no parameters,
    // pass an empty object.
    //
    // **callback** an optional callback function with the signature
    // `callback(err, widget)`. this function will be called when the widget
    // is installed, or an error occurs. 
    //
    apres.widget = function(elem, WidgetFactory, SkinFactory, params, callback) {
      var id, widget, modules;
      elem = apres.$(elem);
      // `apres.widget(elem)` *(getter)*
      if (typeof WidgetFactory === 'undefined') {
        id = elem.attr(widgetIdAttrName);
        return typeof id !== 'undefined' ? widgets[id] : undefined;
      }
      // Shuffle optional arguments
      if (typeof SkinFactory !== 'function' && typeof SkinFactory !== 'string' && SkinFactory !== null) {
        callback = params;
        params = SkinFactory;
        SkinFactory = undefined;
      }
      if (typeof callback === 'undefined' && typeof params === 'function') {
        callback = params;
        params = undefined;
      }
      // String factory names are imported async 
      if (typeof WidgetFactory === 'string') {
        if (typeof SkinFactory === 'string' && SkinFactory.charAt(0) !== '~') {
          modules = [WidgetFactory, SkinFactory];
        } else {
          modules = [WidgetFactory];
        }
        apres.require(modules, 
          function(widgetCons, skinCons) {
            if (typeof widgetCons !== 'function') {
              var msg = 'Apres - widget module "' + WidgetFactory + '" did not return a factory function';
              error(msg);
              if (callback) callback(Error(msg));
            }
            if (!skinCons) {
              if (typeof SkinFactory === 'string' && SkinFactory.charAt(0) === '~') {
                // SkinFactory with a leading ~ are loaded from WidgetFactory
                skinCons = widgetCons.skins[SkinFactory.slice(1)];
              } else if (!SkinFactory && widgetCons.skins) {
                skinCons = widgetCons.skins.default;
              }
            } 
            if (SkinFactory && typeof skinCons !== 'function') {
              var msg = 'Apres - skin "' + SkinFactory + '" is not a factory function';
              error(msg);
              if (callback) callback(Error(msg));
            }
            try {
              setWidget(elem, widgetCons, skinCons, params, callback);
            } catch (err) {
              error('Error installing widget ' + WidgetFactory + ': ' + err);
              if (callback) {callback(err)} else {throw err}
            }
          },
          callback
        );
      } else {
        try {
          widget = setWidget(elem, WidgetFactory, SkinFactory, params, callback);
        } catch (err) {
          if (callback) {callback(err)} else {throw err}
          error('Error installing widget ' + WidgetFactory + ': ' + err);
        }
      }
    }

    var doc;
    var scanning = false;
    var scans;
    // limit re-entrant calls to findWidgets to avoid infinite loops
    var maxScans = 1000; 
    var elemQueue = [];

    //### Find Widgets on the Page
    // Scan the document element for widgets and initialize them when found.
    // The function is re-entrant, so if a widget modifies the DOM at any
    // time, including during its own initialization, it can call this method
    // to include any new widgets declared in the document. 
    //
    // `elem` is the DOM element to be scanned. If omitted, the entire document
    // is scanned.
    //
    apres.findWidgets = function(elem) {
      if (typeof elem == 'undefined') {
        if (!doc) throw new Error('document not defined, did you call apres.initialize()?');
        var elem = doc.documentElement;
      } else if (elem.get) {
        elem = elem.get(0);
      }
      elemQueue.push(elem);
      if (!scanning) {
        var widgetElems, i, widgetElem, widgetName, widgetFactory, skinFactory, callback;
        scanning = true;
        scans = 0;
        while (scanning && (elem = elemQueue[0])) {
          // Rather than simply popping, we remove all matching
          // elements in the queue to avoid duplicate scans
          elemQueue = elemQueue.filter(function(queueElem) {
            queueElem !== elem
          });
          if (!elem.getElementsByClassName) elem = elem.get(0);
          widgetElems = elem.getElementsByClassName('widget');
          for (i = 0; (widgetElem = widgetElems[i]); i++) {
            widgetFactory = widgetElem.getAttribute('data-widget');
            if (widgetFactory) {
              skinFactory = widgetElem.getAttribute('data-skin');
              apres.widget(widgetElem, widgetFactory, skinFactory);
            }
          }
        }
        scanning = false;
      } else if (++scans > maxScans) {
        scanning = false;
        error('Too many calls to apres.findWidgets(), widgets may be infinitely nested');
      }
    }

    var controller;
    var setController = function(newController) {
      if (newController !== controller) {
        if (controller) apres.undelegate(controller, doc.documentElement);
        apres.pubsub.publishSync(topic.replaceController, 
          {oldController: controller, newController: newController});
        controller = newController || undefined;
        apres.$(doc).ready(function() {
          if (controller) {
            apres.delegate(controller, doc.documentElement);
            apres.findWidgets();
            if (typeof controller.ready === 'function') controller.ready(apres.queryParams);
          } else {
            apres.findWidgets();
          }
        });
      }
    }

    var cssRes = {};
    //### Add a Style Sheet to the Document
    // Adds a CSS `<link>` element to the `<head>` of the document 
    //
    // **href** the URL of the style sheet. A given link href will only be
    // added once to a document, so this can be called multiple times for the
    // same style sheet without issue.
    apres.linkStyleSheet = function(href) {
      if (!cssRes[href]) {
        var head = doc.getElementsByTagName('html')[0];
        if (head) {
          var link = doc.createElement('link');
          link.setAttribute('rel', 'stylesheet');
          link.setAttribute('type', 'text/css');
          link.setAttribute('href', href);
          head.appendChild(link);
          cssRes[href] = true;
        } else {
          error('Unable to load stylesheet ' + href +' no <head> element in page');
        }
      }
    }

    //### Apply a Skin to an Element
    // A skin wraps an element with additional markup to decorate it, or
    // add ui elements.
    //
    // **elem** the document element to wrap with the skin.
    //
    // **SkinFactory** a constructor function for the skin, or a module name
    // for the skin constructor. The skin constructor returns an object
    // with content properties. Each property is optional, and may either be
    // a static value or a function:
    //
    // *css* A url string for a style sheet used by the skin, or an array of
    // style sheet urls.
    //
    // *html* The skin HTML to wrap around `elem`. If this contains a single
    // inner-most child element, That element will be used as the wrapper.
    // Otherwise the wrapper element can be designated using the
    // `skin-wrapper` class.
    //
    // *events* A mapping of event handlers. See `apres.delegate()` for
    // details.
    //
    // **context** an optional object passed to any content property functions
    // when the skin is applied.


    //### Controller Manipulation
    // Get or set the controller for the view When setting a new controller,
    // it's `ready()` method will be called when the DOM is ready, or
    // immediately if it is already. Then any event mappings it declares will
    // be bound.  Event mappings for the previous controller, if any, will be
    // unbound first. If the controller being set is the same as the current
    // view controller, this is a no-op.
    //
    // **newController** a controller object, or the name of a module that
    // returns a controller object.
    //
    // **callback** is an optional callback function with the signature
    // `callback(err, controller)`. When @newController is a module name, this
    // function will be called when the controller is installed, or an error
    // occurs. 
    //
    apres.controller = function(newController, callback) {
      // `apres.controller()` (Getter)
      if (typeof newController === 'undefined') {
        return controller;
      // `apres.controller(newController, [callback])` (Setter)
      } else if (typeof newController === 'string' && newController) {
        apres.controllerName = newController;
        require([newController], 
          function(controller) {
            try {
              setController(controller);
            } catch (err) {
              if (callback) {callback(err)} else {throw err}
            }
            if (callback) callback(null, controller);
          },
          callback
        );
      } else {
        apres.controllerName = undefined;
        setController(newController);
      }
    }

    //### Initialization
    // Initialize Apres with a document object. This is called automatically
    // when Apres is loaded into an HTML page, so it is generally not
    // necessary for applications to call this method directly.
    apres.initialize = function(document) {
      var controllerName;
      doc = document;
      apres.queryParams = querystring.parse(doc.location.search.slice(1));
      if (doc.documentElement) {
        controllerName = doc.documentElement.getAttribute('data-apres-controller');
      }
      apres.controller(controllerName || null);
    }
    if (typeof document !== 'undefined') {
      // Bootstrap the current document
      apres.initialize(document);
    }
    return apres;
  }
);

//## Browser Compatibility Shims

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

