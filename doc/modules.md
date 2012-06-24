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

