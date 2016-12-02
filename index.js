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
  var args = arguments;

  if(typeof args[args.length-1] === 'object') {
    options = args[args.length-1];
    args = slice.call(args, 0, -1);
  } else {
    options = {};
  }

  location = (options.location || getLocation()).replace(cwd, '');

  if(deprecate.silence) return;
  if(hits[location || deprecate.caller]) return;

  hits[location || deprecate.caller] = true;

  deprecate.log('');
  deprecate.log('WARNING!!', deprecate.colors.warning);

  for(var i = 0; i < args.length; i++) {
    deprecate.log(args[i], deprecate.colors.message);
  }

  if(location) {
    deprecate.log('  at '+location, deprecate.colors.location);
  }

  deprecate.log(linebreak);
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

function getLocation() {
    var frame;
    var location = '';
    var stackIndexOfDeprecatedFunctionCall = 4;

    /*
      0: getRawStack: call to new Error()
      1: getLocation: call to getRawStack()
      2: deprecate: call to getLocation()
      3: "the deprecated function": call to deprecate()
      4: "the function that called the deprecated function": call to the deprecated function
    */

    try {
      frame = getRawStack()[stackIndexOfDeprecatedFunctionCall];
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
