// Syntax Highlighting widget by Casey Duncan
// Part of the Apres suite http://apres.github.com
// Apres is released under the MIT license

// Widget parameters:
//
// **src** The source URL of the source code to highlight
//
// **selector** jQuery selector of the element containing the raw source code
// in the page. Usually a <script type="text/plain"> element works well for
// this purpose. Note if neither @src or @selector is specified, it will
// attempt to find a <script> tag inside the widget element containing the
// source code to highlight.
//
// **language** Name of language of the source code being highlighted. 
// If omitted, it will guess based on source url, or heuristics.
//
// **tab** If specified, tabs are converted into this many spaces.
//
// **br** If true, then <br> tags are inserted for line breaks in the code.
// Useful if the code is not inserted into a <pre> tag container.
//

define(
  ['require', 'jquery', 'highlight'],
  function(require, $, highlight) {

    var HighlightWidget = function(elem, params) {
      var elem = $(elem);
      var srcUrl, code, language, inferredLang;

      this.useBr = false;

      var makeHtml = function() {
        var html;
        if (code) {
          if (language) {
            html = highlight.highlight(language, code).value;
          } else {
            var result = highlight.highlightAuto(code);
            this.languageDetected = result.language;
            html = result.value;
          }
          return highlight.fixMarkup(html, this.tabReplace, this.useBr);
        } else {
          return '';
        }
      }

      //## Get or Set Language Name
      // Get or set the source code language name If set to a new value with
      // source code loaded, it will be re-rendered immediately.
      this.language = function(newLang) {
        if (typeof newLang === 'undefined') {
          return language;
        } else if (newLang !== language) {
          language = newLang;
          inferredLang = undefined;
          code && elem.html(makeHtml());
        }
      }

      //## Get or Set Source URL
      // Get or set the source code URL If set to a new url, it will be
      // fetched and rendered into the widget element
      this.src = function(url) {
        if (typeof url === 'undefined') {
          return srcUrl;
        } else if (!url) {
          srcUrl = null;
          code = null;
          elem.html('');
        } else if (url !== srcUrl) {
          if (!language || language === inferredLang) {
            // Derive language from file extension
            var file = url.split(/[?#]/)[0];
            var suffix = file.slice(file.lastIndexOf('.'));
            language = inferredLang = {
              '.js': 'javascript',
              '.css': 'css',
              '.html': 'xml',
              '.xml': 'xml',
              '.md': 'markdown', '.markdown': 'markdown',
              '.json': 'json',
              '.coffee': 'coffeescript',
            }[suffix];
          }
          srcUrl = url;
          // Use the require text plugin to fetch to allow
          // apps to take advantage of requirejs pathing features
          require(['text!' + url], function(data) {
              code = data;
              elem.html(makeHtml());
            }
          );
        }
      }

      //## Get or Set Source Text
      // Get or set the source code text When set, 
      // it will be rendered into the widget element
      this.code = function(text) {
        if (typeof text === 'undefined') {
          return code;
        } else if (text !== '') {
          code = text;
          elem.html(makeHtml());
        } else {
          code = text;
          elem.html('');
        }
        srcUrl = null;
      }

      //## Process Widget Parameters
      if (params) {
        this.useBr = params.br || params.useBr;
        language = params.language;
        if (params.tab) {
          var tab = parseInt(params.tab);
          if (!isNaN(tab) && tab > -1) {
            this.tabReplace = '';
            while (tab-- > 0) {
              this.tabReplace += ' ';
            }
          } else {
            console && console.error('highlight widget: illegal integer value for param "tab"');
          }
        }
      }
      if (params && params.src) {
          this.src(params.src);
      } else {
        var srcElem;
        if (params && params.selector) {
          srcElem = $(params.selector);
        } else {
          // If no selector is specified, looks for a script
          // tag inside our element containing the source code
          srcElem = elem.find('script');
        }
        var text = (srcElem || elem).html();
        text && this.code(text);
      }
    }
    HighlightWidget.widgetParams = ['src', 'selector', 'language', 'tab', 'br'];
    return HighlightWidget;
  }
);
