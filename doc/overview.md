# Apres Overview #

Apres is designed to make client-side web development more reasonable and less
frustrating. Apres is a framework, and suite of tools written in Javascript
designed to make your life easier. To introduce Apres, we'll go over a few key
concepts:

- Modules
- Views
- Controllers 
- Widgets 

## Modules ##

A module is the unit of code used by Apres. Since Javascript in the browser
does not include native support for modules, Apres uses [requirejs][1], which
is an excellent implementation of the AMD Javascript module standard.

If you are familiar with other Javascript environments, such as node.js, you
may be wondering why Apres uses a different module system than the CommonJS
API employed by node. The reason is that AMD modules are expressly designed
for completely asynchronous enviroments, such as a web browser. Although
node.js is touted as an async environment, it's module system uses a
synchronous blocking model. This makes the CommonJS/node module system
unsuitable for the browser, and Apres.*

When developing, modules are typically each created in separate files. When
running your app, modules are loaded on demand. Modules can readily depend
on each other to allow you to organize your app into components as you see
fit. Apres has conventions for modules that define components such as
controllers, widgets, and skins. Library modules can follow any api convention
desired.

Apres comes bundled with many useful libraries, and components for you to use.
It is also easy for you to add additional libraries and components for your app
via modules. The section on [modules](modules.md) provides additional details.

* *Note there are projects that attempt to make CommonJS modules work in the
browser, but they require an additional build system, which is incompatible with
Apres' "code then reload" development philosophy*

[1]: http://requirejs.org/

## Views ##

An Apres view is simply an HTML page. Apres itself has no opinion whether your
app is contained in a single page, or many different pages. It is possible to
create single page apps in Apres, but it is generally better to divide more
complex apps into several different page views for improved modularity.
Ultimately this is up to the app developer, however, and Apres requires no
particular URL structure for specifying views. Apres is also agnostic about
the server used to deliver its views. Any web server that can deliver an HTML
page in response to a URL can serve an Apres app.

An Apres view is a bit more than a vanilla static HTML page, however. Apres
utilizes HTML5's `data-` attributes to designate where in the view
components, such as a controller, widgets, or skins should be employed. When
the HTML view is loaded into the browser, Apres is activated and it scans the
page DOM for component declarations. These declarations cause the view, and
the app, to come to life.

To activate Apres, for a given page, turning it into an Apres view, you must
include a single `<script>` tag to your markup. The `<script>` tag actually
loads requirejs first, then includes Apres as the main module to load and run.
If you are serving the Apres modules along with your view, you
could use something like this:

``` html
<script data-main="apres/js/lib/apres-dev.js" src="apres/js/lib/require-1.0.8.js"></script>
```

Although that's all you need to turn an HTML page into an Apres view, it
doesn't do anything special yet because the view doesn't use any components.
Next, we'll see how to do that.

## Controllers ##

Controllers are a simple type of Apres component that can be plugged into a
view. A controller is useful when you want to execute some code for the entire
page when it is initially loaded. Controllers can also bind DOM event handlers
to the view to respond to events happening anywhere in the view. Controllers
typically contain logic that is specific to a single view in a particular app,
although it is certainly possible for multiple views to use the same
controller.

A controller is defined in a Javascript module. To add a controller to a view,
add a `data-apres-controller` attribute to the outermost html element of the
view page, typically the `<html>` element. The value of attribute is the
module path, or name. Here is the code for a simple view that uses a
controller:

``` html
<html data-apres-controller="demo/hello">
<head>
  <script data-main="apres/js/lib/apres-dev.js" src="apres/js/lib/require-1.0.8.js"></script>
</head>
<body>
</body>
</html>
```
The `demo/hello` controller module will be loaded by Apres as soon as
it runs. The controller itself is just an object that defines an api for
use by the view. If the controller object defines a `ready()` method, this
will be called as soon the page DOM is ready.

## Widgets ##

Widgets are another type of component that can be plugged into a view. Unlike
controllers, however, widgets can be attached to any DOM element in the page.
Widgets can attach logic to an element, or affect its presentation. Like
controllers, widgets are loaded from a module, and can be declared directly
in the view html:

``` html
  <div class="widget" data-widget="widget/include" data-widget-src="/some/content.html"></div>
```

This widget will load content from another document, and insert it into
the `<div>` element that the widget is attached to.

Widgets are considerably more flexible than controllers in that you can
attach them to any element, and pass them parameters from html. They also
often expose an API for access from scripts.

A downside to widgets is that you cannot control the order that they are
initialized. Controllers are always initialized first, giving them the
opportunity to initialise, and alter the page as needed before any widgets
are loaded.

Visit the [widget documentation](widgets.md) for details about their inner
workings, and how to create them for your own application.

## Further Reading

* [Quick Start](quickstart.md)

* [Apres Widgets](widgets.md)

* [Apres modules](modules.md)

