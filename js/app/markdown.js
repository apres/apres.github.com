// Example controller for markdown.html
// Shows event binding and insertion of
// widgets programmatically

define(
  ['apres', 'jquery', 'widget/markdown'],
  function(apres, $, MarkdownWidget) {
    var controller = {};
    controller.ready = function() {
        apres.delegate(controller, $('html'));
    }

    controller.events = {
      'click button#add-markdown': function() {
          var widget = new MarkdownWidget('#included-markdown');
          widget.src('/content/example.md');
          $('button#add-markdown').hide();
      }
    }

    return controller;
  }
);
