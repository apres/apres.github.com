// Hello World Example Apres Controller

define(['jquery'], function($) {
  // A controller is a simple object that exposes some methods
  // It is the base API for the view being served
  var controller = {};

  // The ready() method will be called by apres when the
  // page DOM is fully loaded, like $(document).ready() in jQuery
  // Apres will also pass in any query parameters from the url
  // but we do not need them for this simple example
  controller.ready = function() {
    document.title = 'Hello World!';
    $('body').prepend(
      '<p title="This was inserted by the hello.js controller">' +
      'Apres says: "Hello, World!"</p>'
    );
  }

  // The controller object we return is accessible as
  // apres.controller by other scripts and widgets in the view
  return controller;
});

