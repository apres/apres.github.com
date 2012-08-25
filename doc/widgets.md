# Widgets #

Apres widgets allow dynamic behavior to be attached to DOM elements on a page.
Widgets encapsulate dynamic logic and presentation in a reusable way. Widgets
can be attached directly to an element by adding some attributes to its html
tag:

``` html
<div class="widget" data-widget="widget/markdown"></div>
```

When Apres is loaded for a page, it will automatically scan for widgets after
the DOM is ready, and the page controller, if specified, is loaded.  Widget
elements must declare class `"widget"` as above. This ensures that Apres can
find all of the page elements with widgets as efficiently as possible.  Note
that is it fine for the widget element to declare other classes as well so
long as one of them is `"widget"`.

The second `data-widget` attribute declares the widget module. This is a
requirejs module path. This module is loaded on demand and used to construct
the widget instance. The instance is then attached to the DOM element.

Some widgets can accept additional parameters. The `markdown` widget used
above can accept a `src` parameter that allows you to specify an external
resource containing the markdown source text. Let's see what that looks 
like in the html:

``` html
<div class="widget" data-widget="widget/markdown" data-widget-src="/doc/rambling.md"></div>
```

All widget parameters are specified using `data-widget-` attributes. When
the widget is instantiated, the parameters are passed in by Apres. In this
case the text will be fetched from `/doc/rambling.md` and passed into the
widget.

When a widget is constructed it is passed in the DOM element, and any
additional parameters. The widget code is free to do whatever is appropriate
from there. In most cases a widget will manipulate the element it is attached
to. In the case of the markdown widget, it will render the source text into
html, then replace the content of the widget element with that generated
markup. This result is that the markdown is formatted and displayed in the
browser as expected.

## Adding Widgets From Scripts ##

Apres also provides an API for imperatively adding widgets to a page from
Javascript. This can be very useful for inserting widgets programmatically
in response to some user action after the page has loaded. This simple example
loads a markdown widget as above, but from Javascript:

``` javascript
apres.widget('#my-element', 'widget/markdown');
```

The first argument `#my-element` selects the DOM element for the widget. The
second argument is the requirejs module path, just like `data-widget` above.
As above, we can also pass in a source text URI:

``` javascript
apres.widget('#my-element', 'widget/markdown', {src: '/doc/rambling.md'});
```

Here we pass in the `src` parameter, similar to above. Parameters are passed
into the widget as an object hash. 

Note that `apres.widget()` is an async function, since Apres must load the
widget module before it can instantiate the widget. As a result, the function
doesn't return anything useful when instantiating a new widget. If we want
to get ahold of the widget object in our script, you need to pass a callback
to `apres.widget()`.

Continuing with our markdown example, suppose we wanted to supply the
markdown widget with some markdown source text directly from the script. As
it happens this cannot be done via a widget parameter, but the widget
instance has a `markdown()` function that we can use for this purpose.
We can call that from a callback after constructing the widget:

``` javascript
apres.widget('#my-element', 'widget/markdown', function(widget) {
  widget.markdown('# Frippertronics\n'
     + 'The romance of endless tape loops, and noodling guitars.');
});
```

## Accessing Existing Widgets on the Page ##

Most widget objects provide an api for manipulating them from a script.
However, we need to get the widget object first. This can be accomplished
by using `apres.widget()` passing it only the element selector:

``` javascript
var widget = apres.widget('#some-element');
```

If the element selected has a widget object installed, it is returned. From
there the script can manipulate the widget as it sees fit.

## Creating Custom Widgets ##

Widgets are a great way to encapsulate bits of application functionality.
Let's dive in and create the world's simplest hello world widget:

``` javascript
define(function() {
  return function(elem) {
    elem.html('Hello Widget World!');
  }
});
```

Create a directory called `widgets` in the root directory of your Apres app
(to create an app see the [quick start](quickstart.md)), and save this as a
file named `hello.js` in the widgets directory.

To use your new widget, add this tag to an apres-enabled page:

``` html
<div class="widget" data-widget="/widgets/hello.js"></div>
```

Reload the page and voilà! You've created a working widget!

It may not be exciting yet, but it is doing something, so let's examine the
code a little more closely. First line first:

``` javascript
define(function() {

});
```

The `define()` function is provided by requirejs to define modules.  All
widgets are defined in modules so that's why we need it here. Our widget has
no dependencies on other modules yet, so we can simply pass `define()` a
callback function where the module contents reside. The callback function will
be called when the module is loaded, what it returns is the module object.
That part comes next:

``` javascript
  return function(elem) {
    elem.html('Hello Widget World!');
  }
```

Our widget module returns a function, a constructor function to be precise.
When Apres loads a widget module, it expects it to return the constructor
function to use to create the widget instance. When Apres creates a widget for
an element, the constructor is called and the element is passed in as a jQuery
wrapper for convenience.

Our simple widget doesn't do too much, it just sets the content of the widget
element and it's done. It doesn't do anything at all with the widget instance,
so a plain empty object is returned to Apres.

### Interactive Custom Widget

Next let's do something more interactive. Let's create a `question` widget
that allows you to easily write a question with a list of multiple choice
answers. The widget will turn the answers into radio buttons, and keep
track of the selected answer. Here's what you could write in the html
for a question:

``` html
<p>How many conies in a brace?</p>
<div class="widget" data-widget="/widgets/question.js">
  Zero
  Two
  Seven
  Seventy-Two
</div>
```

So what we need to do it read the source text of the element, and create some
radio buttons. Here's an initial attempt in a widget:

``` javascript
define(function() {
  var qid = 0;
  return function(elem) {
    var questions = elem.html().split(/\n\s*/);
    var html = '';
    qid += 1
    for (var i = 1; i < questions.length; i++) {
      if (questions[i]) {
        html += '<label><input type="radio" name="q' + qid + '" value="' + i + '"/> '
             + questions[i] + '</label><br>';
      }
    }
    elem.html(html);
  }
});
```

The result is something like this:

[[Screenshot goes here]]

### Wiring Up Events

Although now we can click on the buttons they don't actually do anything yet.
We need to add some simple logic to record the answer selection. To that end,
Apres provides a mechanism for widgets to declaratively bind DOM events to
functions:

``` javascript
    this.events = {
      'change input[type="radio"]': function(evt) {
          this.answer = evt.target.value;
      }
    }
```

Widgets define their event bindings via an `events` property 
