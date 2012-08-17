// Simple example widget that injects source links
// for the page, controller, and widgets

define(
  ['require', 'apres', 'jquery', 'handlebars'],
  function(require, apres, $, handlebars) {
    // Compile a template to generate html for the widget to insert
    var template = handlebars.compile(
      '<ul style="padding: 1em 3em; list-style: disc">' +
      '<li><a href="{{viewsourceUrl}}?url={{documentUrl}}">view page source</a></li>' +
      '{{#if controllerUrl}}<li><a href="{{viewsourceUrl}}?url={{controllerUrl}}">view controller source</a></li>{{/if}}' +
      '{{#each widgets}}<li><a href="{{../viewsourceUrl}}?url={{url}}">{{name}} widget source</a></li>{{/each}}' +
      '</ul>'
    );

    // A widget is just a function that accepts a DOM element
    // The widget function can manipulate the element provided
    // In this case we render a template into it
    return function(elem) {
      var uri = apres.MODULE_URI,
          docUrl = document.location.pathname;
      if (docUrl.substr(-1) === '/') docUrl += 'index.html';

      // Setup the context data for rendering the template for this page
      var context = {
        viewsourceUrl: uri.slice(0, uri.lastIndexOf('/js/lib/')) + '/demo/viewsource.html',
        documentUrl: docUrl,
        widgets: []
      };
      if (apres.controllerName) {
        context.controllerUrl = apres.controllerName + '.js';
      }
      // Find the widgets in the page to populate the widgets array
      var seen = {};
      $.each($('.widget'), function(i, elem) {
          var name = elem.getAttribute('data-widget');
          if (name && !seen[name]) {
            context.widgets.push({name: name, url: name + '.js'});
            seen[name] = true;
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
