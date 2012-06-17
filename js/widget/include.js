// Include widget by Casey Duncan
// Let's you include html content from other files
// including widget declarations
//
// Part of the Apres suite http://apres.github.com
// Apres is released under the MIT license

define(['apres'], function(apres) {

  var IncludeWidget = function(elem, params, widgetReady) {
    var srcUrl;
    this.$el = elem;
    this.escape = false;

    var include = function(text) {
      if (this.escape) {
        text = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;');
      }
      this.$el.html(text);
      apres.findWidgets(this.$el);
      widgetReady();
    }

    /**
     * Get or set the content source URL
     * If set to a new url, it will be fetched and
     * included into the widget element
     */
    this.src = function(url) {
      if (typeof url === 'undefined') {
        return srcUrl;
      } else if (!url) {
        srcUrl = null;
        this.elem.html('');
      } else if (url !== srcUrl) {
        srcUrl = url;
        apres.srcPromise(url, 'text').done(include.bind(this));
      }
    }

    if (params) {
      // this.action = params.action || 'insert';
      this.escape = params.escape || false;
      if (params.src) {
        widgetReady(false);
        params.src.done(include.bind(this));
      }
    }
  }
  IncludeWidget.widgetParams = {
    src: {
      type: 'textSrc', 
      descr:'Path to resource to be included',
    },
    /*
    action: {
      descr: 'How the source resource will be included '
           + 'in the widget element, one of: '
           + '"insert", "replace", "prepend", "append"',
      default: 'insert',
    },
    */
    escape: {
      type: 'bool', 
      descr:'If the source text should be html-escaped when included',
      default: false,
    },
  };

  return IncludeWidget;
});
