// Hello World Example Apres Controller

define(['jquery'], function($) {
  var controller = {};

  controller.ready = function() {
    document.title = 'Hello World!';
    $('body').append('<p>Apres says: "Hello, World!"</p>');
  }

  return controller;
});

