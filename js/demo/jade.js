// Example controller for jade.html
// Shows event binding and widget
// manipulation from scripts

define(
  ['apres', 'jquery'],
  function(apres, $) {
    var controller = {};

    controller.events = {
      'click button#render-blanks': function() {
        var template = apres.widget('#blanks-template');
        template.render({
          noun: $('#blanks-form input[name=noun]').val(),
          verb: $('#blanks-form input[name=verb]').val(),
          adjective: $('#blanks-form input[name=adjective]').val(),
          interjection: $('#blanks-form input[name=interjection]').val(),
          animal: $('#blanks-form select[name=animal]').val(),
        });
      }
    }

    return controller;
  }
);
