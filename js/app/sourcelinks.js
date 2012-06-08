// Simple example widget that injects source links
// for the page, controller, and widgets

define(
  ['require', 'apres', 'jquery', 'handlebars'],
  function(require, apres, $, handlebars) {
    // Compile a template to generate html for the widget to insert
    var template = handlebars.compile(
      '<ul>' +
      '<li><a href="viewsource.html?url={{documentUrl}}">view page source</a></li>' +
      '<li><a href="viewsource.html?url={{controllerUrl}}">view controller source</a></li>' +
      '{{#each widgets}}<li><a href="viewsource.html?url={{url}}">{{name}} widget source</a></li>{{/each}}' +
      '</ul>'
    );

    // A widget is just a function that accepts a DOM element
    // The widget function can manipulate the element provided
    // In this case we render a template into it
    return function(elem) {
      // Setup the context data for rendering the template for this page
      var context = {
        documentUrl: document.location.pathname,
        controllerUrl: require.toUrl(apres.controllerName),
        widgets: []
      };
      // Find the widgets in the page to populate the widgets array
      $.each($('.widget'), function(i, elem) {
          var name = elem.getAttribute('data-widget');
          if (name) {
            context.widgets.push({name: name, url: require.toUrl(name)});
          }
        }
      );
      $(elem).attr('title', 'This is the app/sourcelinks widget');
      // Render the template into our element
      $(elem).html(template(context));

      // A widget function can return an object, which can be
      // accessed later from apres, but in this case we don't need to
    }
  }
);
