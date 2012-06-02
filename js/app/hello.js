// Hello World Example Apres Controller

define(['jquery'], function($) {
  var controller = {};

  controller.ready = function() {
    document.title = 'Hello World!';
    $('body').prepend(
      '<p title="This was inserted by the hello.js controller">' +
      'Apres says: "Hello, World!"</p>'
    );
  }

  return controller;
});

