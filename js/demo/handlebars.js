// Example controller for handlebars.html
// Shows event binding and widget
// manipulation from scripts

define(
  ['apres', 'jquery'],
  function(apres, $) {
    var controller = {};

    controller.events = {
      'click button#render-fav-color': function() {
        var template = apres.widget('#fav-color-template');
        template.render({
          name: $('#fav-color-form input[name=name]').val(),
          color: $('#fav-color-form select[name=color]').val(),
        });
      }
    }

    return controller;
  }
);
