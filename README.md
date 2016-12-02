# deprecate

[![Build Status](https://secure.travis-ci.org/brianc/node-deprecate.png?branch=master)](http://travis-ci.org/brianc/node-deprecate)

Mark a method as deprecated.  Write a message to a stream once for each location in an application the deprecated method is called.

## api

`var deprecate = require('deprecate');`

### deprecate()
<sup>
`deprecate([String message1 [, String message2 [,...]]], [Object options])`
</sup>

Call `deprecate` within a function you are deprecating.  It will spit out all the messages to the console the first time _and only the first time_ the method is called.

```js
1  │ var deprecate = require('deprecate');
2  │
3  │ var someDeprecatedFunction = function() {
4  │   deprecate('someDeprecatedFunction() is deprecated');
5  │ };
6  │
…  │ // …
30 │
31 │ someDeprecatedFunction();
```

_program output:_

<img width="373" src="https://cloud.githubusercontent.com/assets/1958812/20812831/f2a1cde0-b7c7-11e6-93e6-1613e028e719.png">

#### Options

**`location`**: a string in the format `${filepath}:${line}:${column}` indicating where the deprecated function was called from.  _TODO: `false` disables outputting the location and will only log the message once._

### deprecate.method()
<sup>
`deprecate.method(Object proto, String methodName, [String message1 [, String message2 [,...]]], [Object options])`
</sup>

Deprecates a method on an object:

```js
deprecate.method(console, 'log', 'You should not log.');
```

### deprecate.fn()
<sup>
`deprecate.fn(Function func, [String message1 [, String message2 [,...]]], [Object options])`
</sup>

Deprecates a function and returns it:

```js
console.log = deprecate.fn(console.log, 'You should not log.');
```

### deprecate.color

Set to `false` to disable color output.  Set to `true` to force color output.  Defaults to the value of `deprecate.stream.isTTY`.


### deprecate.colors

Controls the colors used when logging. Default value:
```js
{
  warning: '\x1b[31;1m', // red, bold
  message: false, // use system color
  location: '\u001b[90m' // gray
}
```

_How the default looks on a light background:_

<img width="344" src="https://cloud.githubusercontent.com/assets/1958812/20812832/f2a1edb6-b7c7-11e6-81f5-73319ae5f968.png">

_And on a dark background:_

<img width="373" src="https://cloud.githubusercontent.com/assets/1958812/20812831/f2a1cde0-b7c7-11e6-93e6-1613e028e719.png">

### deprecate.silence

When `true`, do nothing when the deprecate method is called.

### deprecate.stream

The to which output is written.  Defaults to `process.stderr`.

### deprecate.log(message)

The function used to log, by default this function writes to `deprecate.stream` and falls back to `console.warn`.

You can replace this with your own logging method.

## license

MIT
