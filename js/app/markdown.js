// Example controller for markdown.html
// Shows event binding and insertion of
// widgets programmatically

define(
  ['apres', 'jquery'],
  function(apres, $) {
    var controller = {};

    controller.events = {
      'click button#add-markdown': function() {
        apres.widget('#included-markdown', 'widget/markdown', null, function(err, widget) {
          if (!err) {
            widget.src('/content/example.md');
            $('button#add-markdown').hide();
          } else {
            $('button#add-markdown')
              .replaceWith('<p>Error installing widget:' + err + '</p>');
          }
        });
      }
    }

    return controller;
  }
);
