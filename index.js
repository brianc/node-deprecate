var env = typeof process !== 'undefined' && process.env.NODE_ENV;
var isWindows = typeof process !== 'undefined' && 'win32' === process.platform;
var isDevelopment = !env || env === 'dev' || env === 'development';
var logger = typeof console !== 'undefined' && console.warn && console;
var cwd = typeof process !== 'undefined' && process.cwd() + '/' || '';
var linebreak = isWindows ? '\r\n' : '\n';
var newline = /(\r\n|\r|\n)/g;
var slice = [].slice;
var noop = function(){};
var noopReturn = function(r){ return r; };
var hits = {};

var deprecate = module.exports = !isDevelopment ? noop : function() {
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

deprecate.method = !isDevelopment ? noop : function(object, methodName) {
    var originalMethod = object[methodName];
    var args = slice.call(arguments, 2);

    object[methodName] = function() {
        deprecate.apply(null, args);
        return originalMethod.apply(this, arguments);
    };
}

deprecate.function = !isDevelopment ? noopReturn : function(fn) {
  var args = slice.call(arguments, 1);

  return function() {
    deprecate.apply(null, args);
    return fn.apply(this, arguments);
  }
}

deprecate.log = function(message, color) {
  var formatted = format(message, color);
  if(deprecate.stream) {
    deprecate.stream.write(formatted+linebreak);
  } else if(logger) {
    logger.warn(formatted);
  }
}

deprecate.stream = typeof process !== 'undefined' && process.stderr;
deprecate.silence = false;
deprecate.color = deprecate.stream && deprecate.stream.isTTY;
deprecate.colors = { warning:'\x1b[31;1m', message:false, location:'\u001b[90m' };

function format(message, color) {
  return color && deprecate.color ? color + message + '\x1b[0m' : message;
}

function getLocation() {
    var location = '';
    var stackIndex = 3;

    try {
        // Save original Error.prepareStackTrace
        var origPrepareStackTrace = Error.prepareStackTrace;

        // Override with function that just returns `stack`
        Error.prepareStackTrace = function (_, stack) {
            return stack;
        };

        // Evaluate `Error.stack`, which calls our new `Error.prepareStackTrace`
        var frame = new Error().stack[stackIndex];

        // Restore original `Error.prepareStackTrace`
        Error.prepareStackTrace = origPrepareStackTrace;

        location = frame.getFileName()+':'+frame.getLineNumber()+':'+frame.getColumnNumber();
    } catch(e) {}

    return location;
}
