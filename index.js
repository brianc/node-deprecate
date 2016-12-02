var env = typeof process !== 'undefined' && process.env.NODE_ENV;
var isWindows = typeof process !== 'undefined' && 'win32' === process.platform;
var isDevelopment = !env || env === 'dev' || env === 'development';
var logger = typeof console !== 'undefined' && console.warn && console;
var cwd = typeof process !== 'undefined' && process.cwd() + '/' || '';
var linebreak = isWindows ? '\r\n' : '\n';
var newline = /(\r\n|\r|\n)/g;
var slice = [].slice;
var hits = {};

deprecate = isDevelopment ? deprecate : noop;
deprecate.method = isDevelopment ? method : noop;
deprecate.fn = isDevelopment ? fn : noopReturn;
deprecate.log = log;
deprecate.stream = typeof process !== 'undefined' && process.stderr;
deprecate.silence = false;
deprecate.color = deprecate.stream && deprecate.stream.isTTY;
deprecate.colors = { warning:'\x1b[31;1m', message:false, location:'\u001b[90m' };

if(typeof module !== 'undefined' && module.exports) {
  module.exports = deprecate;
} else if(typeof window !== 'undefined') {
  window.deprecate = deprecate;
}

function deprecate() {
  var options;
  var location;
  var getCallToDeprecate;
  var args = arguments;

  if(deprecate.silence) return;

  if(typeof args[args.length-1] === 'object') {
    options = args[args.length-1];
    args = slice.call(args, 0, -1);
  } else {
    options = {};
  }

  if(options.location === false) {
    // When the user explictly sets location to false,
    // We will get the location of the call to deprecate()
    // is called, instead of the location of the call to the
    // deprecated function.
    getCallToDeprecate = true;
  }

  location = options.location || getLocation(getCallToDeprecate);

  if(hits[location || deprecate.caller]) return;
  else hits[location || deprecate.caller] = true;

  var output = format('WARNING!!', deprecate.colors.warning);

  for(var i = 0; i < args.length; i++) {
    output += linebreak + format(args[i], deprecate.colors.message);
  }

  if(options.location !== false && location) {
    output += linebreak + format('  at '+location.replace(cwd, ''), deprecate.colors.location);
  }

  deprecate.log(linebreak + output + linebreak);
};

function method(object, methodName) {
    var originalMethod = object[methodName];
    var args = slice.call(arguments, 2);

    object[methodName] = function() {
        deprecate.apply(null, args);
        return originalMethod.apply(this, arguments);
    };
}

function fn(original) {
  var args = slice.call(arguments, 1);

  return function() {
    deprecate.apply(null, args);
    return original.apply(this, arguments);
  }
}

function log(message, color) {
  var formatted = format(message, color);
  if(deprecate.stream) {
    deprecate.stream.write(formatted+linebreak);
  } else if(logger) {
    logger.warn(formatted);
  }
}

function format(message, color) {
  return color && deprecate.color ? color + message + '\x1b[0m' : message;
}

function getLocation(getCallToDeprecate) {
  var stack;
  var frame;
  var location = '';
  var index = getCallToDeprecate ? 3 : 4;

  /*
    0: In getRawStack(), the call to new Error()
    1: In getLocation(), the call to getRawStack()
    2: In deprecate(), the call to getLocation()
    3: In the deprecated function, the call to deprecate()
    4: The call to the deprecated function (THIS IS THE DEFAULT)
  */

  try {
    stack = getRawStack();
    frame = stack[index] || stack[3];
    location = frame.getFileName()+':'+frame.getLineNumber()+':'+frame.getColumnNumber();
  } catch(e) {}

  return location;
}

function getRawStack() {
  var stack;
  var restore = patch(Error, 'prepareStackTrace', returnStack);
  stack = new Error().stack;
  restore();
  return stack;
}

function patch(object, method, replacement) {
  var original = object[method];
  object[method] = replacement;
  return function restore() {
    object[method] = original;
  }
}

function returnStack(_, stack) {
  return stack;
}

function noop(){};
function noopReturn(r) { return r; };
