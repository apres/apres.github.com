# Modules #

The goal of Apres is to enable the creation of complex apps from simple
components. Central to that are [AMD][1] Javascript modules provided by
[requirejs][2]. The use of AMD modules provides several key benefits: 

- Each module get its own namespace, therefore pollution and conflicts in the
  global namespace are avoided. You can even load multiple versions of the
  same module at the same time without conflict.

- Modules can easily depend on other modules, allowing them to reliably build
  on each other. This also allows Apres to be the root module for the entire
  application, and all of the needed code can be loaded from single uniform
  script include in your web pages.

- Modules can be developed in individual files, then optimized later by
  combining and minifying them into a few files.

- Modules can be used for other resources such as template sources, 
  static content, and JSON data. They can be loaded as dependancies just
  like Javascript code modules.

Of course, with any tool there are some considerations that are important
to understand:

- AMD modules are defined via the `define()` function provided by requirejs.
  Therefore to be a bon-a-fide AMD module, it must conform to this interface.
  Many popular libraries, such as jQuery, already do.

- Non-AMD modules can be adapted by adding a `define()` wrapper, or using
  a shim loader provided by requirejs. Apres uses these techniques for
  included 3rd-party libraries that are not AMD modules.

- Non-code resources are subject to cross-origin browser restrictions.

[1]: https://github.com/amdjs/amdjs-api/wiki/AMD
[2]: http://requirejs.org/

## Included Modules ##

Apres integrates several 3rd-party modules for you to use in your
applications. Each version of Apres is packaged with specific versions of each
included module. When you specify a module dependency using an unversioned
name, the version loaded will depend upon the Apres package.  However, you can
also specify a versioned name to load a specific version.

Modules are loaded relative to the apres module, unless specified using an
absolute path or URL. If you like you can load apres directly from the
http://apres.github.com site, and it will load other included dependencies
from there as well. Also, you are free to host the entire Apres package on
your own server.

Below are the modules currently included with Apres, with more being added
regularly.

- [require][2] -- requirejs [AMD][1] module loader
- [jquery][3] -- Needs no introduction
- [underscore][4] -- underscore.js Functional programming library
- [handlebars][5] -- Semantic templating library
- [jade][6] -- Template engine
- [pubsub][7] -- PubSubJS Publish/Subscribe Event System
- [store][8] -- Cross-browser local storage without flash or cookies
- [querystring][9] -- Query-string parser
- [showdown][10] -- Markdown to HTML converter
- [chai][11] -- Test assertion library
- [sinon][12] -- Spies, stubs and mocks for JS testing
- [highlight][13] -- Multi-language syntax highlighter

  [3]: http://jquery.com/
  [4]: http://underscorejs.org/
  [5]: http://handlebarsjs.com/
  [6]: http://jade-lang.com/
  [7]: https://github.com/mroderick/PubSubJS
  [8]: https://github.com/marcuswestin/store.js
  [9]: https://github.com/visionmedia/node-querystring
  [10]: https://github.com/coreyti/showdown
  [11]: http://chaijs.com/
  [12]: http://sinonjs.org/
  [13]: http://softwaremaniacs.org/soft/highlight/en/

## Defining Application Modules ##

All application code in Apres is defined in AMD modules. In general there are
three different types of modules an application defines: controller modules,
widgets, and libraries. The structure of controller, and widget modules must
conform to what Apres expects, whereas library modules can be structured any
way desired. In general, loading a module yields a single object that is
manipulated in your app, either directly by the app, or via Apres. The module
object can be a function, an object with attributes, or even just a static
string.

Below is an example module that provides a single function to escape or
"sanitize" html tags in user defined content:
    
    define(function() {
      return function(text) {
        return String(text)
          .replace(/&(?!(\w+|\#\d+);)/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      }
    });

`define()` is the global function provided by requirejs used to register
modules. Above is the simplest usage of `define()` where the module has no
other dependencies. The anonymous function provided to `define` will be called
once when the module is loaded. It is expected to return the module object, in
this case a single function. Let's assume this module is stored in a file at
`/js/app/sanitize.js`. To use sanitize from another application module, we can
declare it as a dependency in that module's `define()` call:
    
    define(['/js/app/sanitize.js', 'apres'], function(sanitize, apres) {
      // Called once sanitize.js, and apres are loaded
    });

Most modules will have one or more dependencies, so the above is probably the
most common usage of `define()`. Here the first argument is an array of module
names. A module name can be an absolute path, a fully qualified URL to a
script, or a simple name. Simple names are processed through requirejs'
pathing system to become file paths. Apres configures requirejs so that
built-in libraries (see above), widgets, and controllers can be loaded using
simple names.  For these simple names, you omit the file extension as with the
`apres` module above.

When the module is loaded, requirejs will process the dependencies in the
first argument and load them asynchronously. If those modules have
dependencies, they will also be loaded. Once a module is loaded once, it will
be provided immediately to any other modules that depend on it. The anonymous
function passed as the second argument to `define()` will be called once the
dependencies are loaded and ready. It is passed the dependent module objects
as its arguments, matching the order of the module name array. These arguments
are used inside the module definition to access the dependencies.

These two constructs are all you really need to know to create modules that
work with Apres. However, requirejs provides other facilities, such as a
CommonJS-style `define()` api, and the `require()` function for loading
modules on-demand inside your modules. See the
[requirejs api documentation](http://requirejs.org/docs/api.html) for full
details.



