# Widget Parameters

Parameters can be passed to widget constructors declaratively via html, or
directly from javascript. Declarative parameters are provided on the widget
element via `data-widget-` attributes.  Apres provides a mechanism for widgets
to declare the parameters they accept, and supply additional configuration for
each parameter.

## Parameter Declaration

Widgets must declare the parameters that they accept. When parameters are
specified in html, only attributes matching declared parameters names will be
passed to the widget. Other extraneous parameter attributes will be ignored.

Parameters are declared via a `widgetParams` property on the widget
constructor. The value of `widgetParams` is an object that maps
parameter names to parameter description objects. Each description
object can contain any of the following properties, all of which are
optional:

**type** -- The name of a type converter to use on parameters passed via html
attributes.  These type converters are provided by Apres to convert attribute
string values to the type required by the widget. If omitted, the type is
assumed to be `string`, and no conversion is performed. The type converters
available are detailed in the next section.

**default** -- A default value for the parameter supplied if the parameter
is not supplied via an html attribute. Note this value is passed directly
to the widget constructor and is not subject to type conversion. If no
default is specified, omitted parameters will be undefined.

**deferred** -- Some parameter type converters perform asynchronous
operations, such as loading external resources. By default all parameter
values are resolved (i.e., loaded) before the widget constructor is called.
This automatic parameter resolution is provided to simplify widget code. If
desired, automatic resolution can be disabled for a given async parameter by
declaring it `deferred: true`. Deferred parameters are supplied immediately to
the widget constructor as a [jQuery deferred promise object][1]. The widget
code can then register its own callbacks and error handlers as it sees fit to
handle the parameter resolution. Note that only asynchronous parameter types
support `deferred`. It is ignored for other parameter types (details below).

**descr** -- A description of the parameter. Can be used to generate
documentation.

[1]: http://api.jquery.com/promise/

## Parameter Type Converters

The following parameter type converters are supplied by Apres for widget
parameters. Async parameter types support the `deferred` property:

**type:** string **async:** no
This is the default type if none is specified. It performs no actual
conversion to the attribute value.

**type:** int **async:** no
Converts the value to an integer.

**type:** float **async:** no
Converts the value to a Javascript float.

**type:** bool **async:** no
Converts the value to `true` or `false`. The case-insensitive attribute values
`"1"`, `"true"`, and `"yes"` convert to `true`. `"0"`, `"false", and
`"no"` convert to `false`.

**type:** selector **async:** no
Use the value as an element selector. Passes the result of `$(value)` to
the widget.

**type:** widget **async:** yes
As with *selector* the value is an element selector, but here the element is
assumed to have a widget attached to it. The selected element's widget is
provided when it is ready. This is useful for widgets to reference each
other.

**type:** scriptSrc **async:** yes
The value is interpreted as a script URI. The script is loaded as a module
with requirejs and the resulting object is supplied as the parameter value.

**type:** textSrc **async:** yes
The value is interpreted as a URI to a text resource. The text resource is
loaded and its contents are supplied as the parameter value. Note this
URI is subject to the browser's cross-origin rules.

**type:** jsonSrc **async:** yes
Similar to *textSrc* except the resource is processed as json. The resulting
object is supplied as the parameter value.

**type:** json **async:** no
The value is parsed as a JSON string. The resulting object is supplied as the
parameter value.

