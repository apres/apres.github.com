// Include widget by Casey Duncan
// Lets you include html content from other files
// including widget declarations
//
// Part of the Apres suite http://apres.github.com
// Apres is released under the MIT license

define(['apres'], function(apres) {

  var IncludeWidget = function(elem, params, widgetReady) {
    var srcUrl, widget = this;
    this.$el = elem;
    this.escape = false;

    var include = function(text) {
      if (widget.escape) {
        text = String(text)
          .replace(/&(?!(\w+|\#\d+);)/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      }
      widget.$el.html(text);
      apres.findWidgets(widget.$el);
      widgetReady();
    }

    // Get or set the content source URL
    // If set to a new url, it will be fetched and
    // included into the widget element
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
      this.escape = params.escape || false;
      if (params.src) include(params.src);
    }
  }
  IncludeWidget.widgetParams = {
    src: {
      type: 'textSrc', 
      descr:'Path to resource to be included',
    },
    escape: {
      type: 'bool', 
      descr:'If the source text should be html-escaped when included',
      default: false,
    },
  };

  return IncludeWidget;
});
