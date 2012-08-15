// Handlebars template widget by Casey Duncan
// Template source can be derived from external files
// or included inline in <script> tags
//
// Part of the Apres suite http://apres.github.com
// Apres is released under the MIT license

define(['apres', 'handlebars', 'jquery'], function(apres, handlebars, $) {

  var HandlebarsWidget = function(elem, params, widgetReady) {
    var srcUrl, src, context;
    this.$el = elem;
    this.when = $.when;
    var template;

    var compile = function(srcText) {
      template = handlebars.compile(srcText);
    }

    // Render the template with the supplied context object
    // into the widget element

    var render = this.render = (function(context) {
      if (template) {
        var text = template(context);
        this.$el.html(text);
        apres.findWidgets(this.$el);
      } else {
        this.$el.html('');
      }
      widgetReady();
    }).bind(this);

    // Get or set the template source URL

    this.src = function(url) {
      if (typeof url === 'undefined') {
        return srcUrl;
      } else if (!url) {
        srcUrl = template = null;
      } else if (url !== srcUrl) {
        srcUrl = url;
        apres.srcPromise(url, 'text').done(compile);
      }
    }

    // Process widget parameters

    if (params) {
      src = params.src;
      context = params.context;
      if (!src) {
        if (params.selector) {
          var srcElem = params.selector;
        } else {
          var srcElem = elem.find('script[type="text/x-handlebars"]');
        }
        if (srcElem) src = srcElem.html();
      }
      if (src) {
        compile(src);
        if (context) this.render(context);
      }
    }
  }
  HandlebarsWidget.widgetParams = {
    src: {
      type: 'textSrc', 
      descr:'Path to template source resource',
    },
    selector: {
      type: 'selector',
      descr:'Selector for element containing inline template source',
    },
    context: {
      type: 'jsonSrc',
      descr:'Path to context json resource. Must be specified with @src, '
          + 'or @selector. When specified the template is rendered immediately.',
    },
  };

  return HandlebarsWidget;
});
