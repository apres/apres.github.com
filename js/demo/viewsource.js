// View source controller with syntax highlighting

define(['jquery', 'widget/highlight'], function($, HighlightWidget) {
  var controller = {};

  controller.ready = function(params) {
    if (params.url) {
      document.title = 'Source Code of ' + params.url;
      $('#heading').html(document.title);
      var highlighter = new HighlightWidget('#source-code');
      if (params.lang) {
        highlighter.language(params.lang);
      }
      highlighter.src(params.url);
    } else {
      $('#source-code').html('No Source Url Specified');
    }
  }

  return controller;
});

