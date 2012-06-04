// Markdown widget by Casey Duncan
// Part of the Apres suite http://apres.github.com
// Apres is released under the MIT license

define(
  ['require', 'jquery', 'showdown'],
  function(require, $, showdown) {

    var MarkdownWidget = function(elem, params) {
      var elem = $(elem);
      var srcUrl, markdownSrc;

      /**
       * Get or set the markdown source URL
       * If set to a new url, it will be fetched and
       * rendered into the widget element
       */
      this.src = function(url) {
        if (url === null) {
          return srcUrl;
        } else if (url !== srcUrl) {
          srcUrl = url;
          // Use the require text plugin to fetch to allow
          // apps to take advantage of requirejs pathing features
          require(['text!' + url], function(data) {
              markdownSrc = data;
              elem.html(showdown.makeHtml(markdownSrc));
            }
          );
        }
      }

      /**
       * Get or set the markdown source text
       * When set, it will be rendered into the widget element
       */
      this.markdown = function(srcText) {
        if (typeof srcText === 'undefined') {
          return markdown;
        } else if (srcText !== '') {
          elem.html(showdown.makeHtml(srcText));
        } else {
          elem.html('');
        }
        markdownSrc = srcText;
      }

      if (params && params.src) {
        this.src(params.src);
      } else {
        var srcElem;
        if (params && params.selector) {
          srcElem = $(params.selector);
        } else {
          // If no selector is specified, looks for a script
          // tag inside of the markdown type
          srcElem = elem.find('script[type="text/x-markdown"]');
        }
        var srcText = (srcElem || elem).html();
        srcText && this.markdown(srcText);
      }
    }
    MarkdownWidget.widgetParams = ['src', 'selector'];
    return MarkdownWidget;
  }
);
