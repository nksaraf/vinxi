var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../../node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/homedir.js
var require_homedir = __commonJS({
  "../../node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/homedir.js"(exports, module2) {
    "use strict";
    var os = require("os");
    module2.exports = os.homedir || function homedir() {
      var home = process.env.HOME;
      var user = process.env.LOGNAME || process.env.USER || process.env.LNAME || process.env.USERNAME;
      if (process.platform === "win32") {
        return process.env.USERPROFILE || process.env.HOMEDRIVE + process.env.HOMEPATH || home || null;
      }
      if (process.platform === "darwin") {
        return home || (user ? "/Users/" + user : null);
      }
      if (process.platform === "linux") {
        return home || (process.getuid() === 0 ? "/root" : user ? "/home/" + user : null);
      }
      return home || null;
    };
  }
});

// ../../node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/caller.js
var require_caller = __commonJS({
  "../../node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/caller.js"(exports, module2) {
    module2.exports = function() {
      var origPrepareStackTrace = Error.prepareStackTrace;
      Error.prepareStackTrace = function(_, stack2) {
        return stack2;
      };
      var stack = new Error().stack;
      Error.prepareStackTrace = origPrepareStackTrace;
      return stack[2].getFileName();
    };
  }
});

// ../../node_modules/.pnpm/path-parse@1.0.7/node_modules/path-parse/index.js
var require_path_parse = __commonJS({
  "../../node_modules/.pnpm/path-parse@1.0.7/node_modules/path-parse/index.js"(exports, module2) {
    "use strict";
    var isWindows = process.platform === "win32";
    var splitWindowsRe = /^(((?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?[\\\/]?)(?:[^\\\/]*[\\\/])*)((\.{1,2}|[^\\\/]+?|)(\.[^.\/\\]*|))[\\\/]*$/;
    var win32 = {};
    function win32SplitPath(filename) {
      return splitWindowsRe.exec(filename).slice(1);
    }
    win32.parse = function(pathString) {
      if (typeof pathString !== "string") {
        throw new TypeError(
          "Parameter 'pathString' must be a string, not " + typeof pathString
        );
      }
      var allParts = win32SplitPath(pathString);
      if (!allParts || allParts.length !== 5) {
        throw new TypeError("Invalid path '" + pathString + "'");
      }
      return {
        root: allParts[1],
        dir: allParts[0] === allParts[1] ? allParts[0] : allParts[0].slice(0, -1),
        base: allParts[2],
        ext: allParts[4],
        name: allParts[3]
      };
    };
    var splitPathRe = /^((\/?)(?:[^\/]*\/)*)((\.{1,2}|[^\/]+?|)(\.[^.\/]*|))[\/]*$/;
    var posix = {};
    function posixSplitPath(filename) {
      return splitPathRe.exec(filename).slice(1);
    }
    posix.parse = function(pathString) {
      if (typeof pathString !== "string") {
        throw new TypeError(
          "Parameter 'pathString' must be a string, not " + typeof pathString
        );
      }
      var allParts = posixSplitPath(pathString);
      if (!allParts || allParts.length !== 5) {
        throw new TypeError("Invalid path '" + pathString + "'");
      }
      return {
        root: allParts[1],
        dir: allParts[0].slice(0, -1),
        base: allParts[2],
        ext: allParts[4],
        name: allParts[3]
      };
    };
    if (isWindows)
      module2.exports = win32.parse;
    else
      module2.exports = posix.parse;
    module2.exports.posix = posix.parse;
    module2.exports.win32 = win32.parse;
  }
});

// ../../node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/node-modules-paths.js
var require_node_modules_paths = __commonJS({
  "../../node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/node-modules-paths.js"(exports, module2) {
    var path = require("path");
    var parse = path.parse || require_path_parse();
    var getNodeModulesDirs = function getNodeModulesDirs2(absoluteStart, modules) {
      var prefix = "/";
      if (/^([A-Za-z]:)/.test(absoluteStart)) {
        prefix = "";
      } else if (/^\\\\/.test(absoluteStart)) {
        prefix = "\\\\";
      }
      var paths = [absoluteStart];
      var parsed = parse(absoluteStart);
      while (parsed.dir !== paths[paths.length - 1]) {
        paths.push(parsed.dir);
        parsed = parse(parsed.dir);
      }
      return paths.reduce(function(dirs, aPath) {
        return dirs.concat(modules.map(function(moduleDir) {
          return path.resolve(prefix, aPath, moduleDir);
        }));
      }, []);
    };
    module2.exports = function nodeModulesPaths(start, opts, request) {
      var modules = opts && opts.moduleDirectory ? [].concat(opts.moduleDirectory) : ["node_modules"];
      if (opts && typeof opts.paths === "function") {
        return opts.paths(
          request,
          start,
          function() {
            return getNodeModulesDirs(start, modules);
          },
          opts
        );
      }
      var dirs = getNodeModulesDirs(start, modules);
      return opts && opts.paths ? dirs.concat(opts.paths) : dirs;
    };
  }
});

// ../../node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/normalize-options.js
var require_normalize_options = __commonJS({
  "../../node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/normalize-options.js"(exports, module2) {
    module2.exports = function(x, opts) {
      return opts || {};
    };
  }
});

// ../../node_modules/.pnpm/function-bind@1.1.2/node_modules/function-bind/implementation.js
var require_implementation = __commonJS({
  "../../node_modules/.pnpm/function-bind@1.1.2/node_modules/function-bind/implementation.js"(exports, module2) {
    "use strict";
    var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ";
    var toStr = Object.prototype.toString;
    var max = Math.max;
    var funcType = "[object Function]";
    var concatty = function concatty2(a, b) {
      var arr = [];
      for (var i = 0; i < a.length; i += 1) {
        arr[i] = a[i];
      }
      for (var j = 0; j < b.length; j += 1) {
        arr[j + a.length] = b[j];
      }
      return arr;
    };
    var slicy = function slicy2(arrLike, offset) {
      var arr = [];
      for (var i = offset || 0, j = 0; i < arrLike.length; i += 1, j += 1) {
        arr[j] = arrLike[i];
      }
      return arr;
    };
    var joiny = function(arr, joiner) {
      var str = "";
      for (var i = 0; i < arr.length; i += 1) {
        str += arr[i];
        if (i + 1 < arr.length) {
          str += joiner;
        }
      }
      return str;
    };
    module2.exports = function bind(that) {
      var target = this;
      if (typeof target !== "function" || toStr.apply(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
      }
      var args = slicy(arguments, 1);
      var bound;
      var binder = function() {
        if (this instanceof bound) {
          var result = target.apply(
            this,
            concatty(args, arguments)
          );
          if (Object(result) === result) {
            return result;
          }
          return this;
        }
        return target.apply(
          that,
          concatty(args, arguments)
        );
      };
      var boundLength = max(0, target.length - args.length);
      var boundArgs = [];
      for (var i = 0; i < boundLength; i++) {
        boundArgs[i] = "$" + i;
      }
      bound = Function("binder", "return function (" + joiny(boundArgs, ",") + "){ return binder.apply(this,arguments); }")(binder);
      if (target.prototype) {
        var Empty = function Empty2() {
        };
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
      }
      return bound;
    };
  }
});

// ../../node_modules/.pnpm/function-bind@1.1.2/node_modules/function-bind/index.js
var require_function_bind = __commonJS({
  "../../node_modules/.pnpm/function-bind@1.1.2/node_modules/function-bind/index.js"(exports, module2) {
    "use strict";
    var implementation = require_implementation();
    module2.exports = Function.prototype.bind || implementation;
  }
});

// ../../node_modules/.pnpm/hasown@2.0.0/node_modules/hasown/index.js
var require_hasown = __commonJS({
  "../../node_modules/.pnpm/hasown@2.0.0/node_modules/hasown/index.js"(exports, module2) {
    "use strict";
    var call = Function.prototype.call;
    var $hasOwn = Object.prototype.hasOwnProperty;
    var bind = require_function_bind();
    module2.exports = bind.call(call, $hasOwn);
  }
});

// ../../node_modules/.pnpm/is-core-module@2.13.1/node_modules/is-core-module/core.json
var require_core = __commonJS({
  "../../node_modules/.pnpm/is-core-module@2.13.1/node_modules/is-core-module/core.json"(exports, module2) {
    module2.exports = {
      assert: true,
      "node:assert": [">= 14.18 && < 15", ">= 16"],
      "assert/strict": ">= 15",
      "node:assert/strict": ">= 16",
      async_hooks: ">= 8",
      "node:async_hooks": [">= 14.18 && < 15", ">= 16"],
      buffer_ieee754: ">= 0.5 && < 0.9.7",
      buffer: true,
      "node:buffer": [">= 14.18 && < 15", ">= 16"],
      child_process: true,
      "node:child_process": [">= 14.18 && < 15", ">= 16"],
      cluster: ">= 0.5",
      "node:cluster": [">= 14.18 && < 15", ">= 16"],
      console: true,
      "node:console": [">= 14.18 && < 15", ">= 16"],
      constants: true,
      "node:constants": [">= 14.18 && < 15", ">= 16"],
      crypto: true,
      "node:crypto": [">= 14.18 && < 15", ">= 16"],
      _debug_agent: ">= 1 && < 8",
      _debugger: "< 8",
      dgram: true,
      "node:dgram": [">= 14.18 && < 15", ">= 16"],
      diagnostics_channel: [">= 14.17 && < 15", ">= 15.1"],
      "node:diagnostics_channel": [">= 14.18 && < 15", ">= 16"],
      dns: true,
      "node:dns": [">= 14.18 && < 15", ">= 16"],
      "dns/promises": ">= 15",
      "node:dns/promises": ">= 16",
      domain: ">= 0.7.12",
      "node:domain": [">= 14.18 && < 15", ">= 16"],
      events: true,
      "node:events": [">= 14.18 && < 15", ">= 16"],
      freelist: "< 6",
      fs: true,
      "node:fs": [">= 14.18 && < 15", ">= 16"],
      "fs/promises": [">= 10 && < 10.1", ">= 14"],
      "node:fs/promises": [">= 14.18 && < 15", ">= 16"],
      _http_agent: ">= 0.11.1",
      "node:_http_agent": [">= 14.18 && < 15", ">= 16"],
      _http_client: ">= 0.11.1",
      "node:_http_client": [">= 14.18 && < 15", ">= 16"],
      _http_common: ">= 0.11.1",
      "node:_http_common": [">= 14.18 && < 15", ">= 16"],
      _http_incoming: ">= 0.11.1",
      "node:_http_incoming": [">= 14.18 && < 15", ">= 16"],
      _http_outgoing: ">= 0.11.1",
      "node:_http_outgoing": [">= 14.18 && < 15", ">= 16"],
      _http_server: ">= 0.11.1",
      "node:_http_server": [">= 14.18 && < 15", ">= 16"],
      http: true,
      "node:http": [">= 14.18 && < 15", ">= 16"],
      http2: ">= 8.8",
      "node:http2": [">= 14.18 && < 15", ">= 16"],
      https: true,
      "node:https": [">= 14.18 && < 15", ">= 16"],
      inspector: ">= 8",
      "node:inspector": [">= 14.18 && < 15", ">= 16"],
      "inspector/promises": [">= 19"],
      "node:inspector/promises": [">= 19"],
      _linklist: "< 8",
      module: true,
      "node:module": [">= 14.18 && < 15", ">= 16"],
      net: true,
      "node:net": [">= 14.18 && < 15", ">= 16"],
      "node-inspect/lib/_inspect": ">= 7.6 && < 12",
      "node-inspect/lib/internal/inspect_client": ">= 7.6 && < 12",
      "node-inspect/lib/internal/inspect_repl": ">= 7.6 && < 12",
      os: true,
      "node:os": [">= 14.18 && < 15", ">= 16"],
      path: true,
      "node:path": [">= 14.18 && < 15", ">= 16"],
      "path/posix": ">= 15.3",
      "node:path/posix": ">= 16",
      "path/win32": ">= 15.3",
      "node:path/win32": ">= 16",
      perf_hooks: ">= 8.5",
      "node:perf_hooks": [">= 14.18 && < 15", ">= 16"],
      process: ">= 1",
      "node:process": [">= 14.18 && < 15", ">= 16"],
      punycode: ">= 0.5",
      "node:punycode": [">= 14.18 && < 15", ">= 16"],
      querystring: true,
      "node:querystring": [">= 14.18 && < 15", ">= 16"],
      readline: true,
      "node:readline": [">= 14.18 && < 15", ">= 16"],
      "readline/promises": ">= 17",
      "node:readline/promises": ">= 17",
      repl: true,
      "node:repl": [">= 14.18 && < 15", ">= 16"],
      smalloc: ">= 0.11.5 && < 3",
      _stream_duplex: ">= 0.9.4",
      "node:_stream_duplex": [">= 14.18 && < 15", ">= 16"],
      _stream_transform: ">= 0.9.4",
      "node:_stream_transform": [">= 14.18 && < 15", ">= 16"],
      _stream_wrap: ">= 1.4.1",
      "node:_stream_wrap": [">= 14.18 && < 15", ">= 16"],
      _stream_passthrough: ">= 0.9.4",
      "node:_stream_passthrough": [">= 14.18 && < 15", ">= 16"],
      _stream_readable: ">= 0.9.4",
      "node:_stream_readable": [">= 14.18 && < 15", ">= 16"],
      _stream_writable: ">= 0.9.4",
      "node:_stream_writable": [">= 14.18 && < 15", ">= 16"],
      stream: true,
      "node:stream": [">= 14.18 && < 15", ">= 16"],
      "stream/consumers": ">= 16.7",
      "node:stream/consumers": ">= 16.7",
      "stream/promises": ">= 15",
      "node:stream/promises": ">= 16",
      "stream/web": ">= 16.5",
      "node:stream/web": ">= 16.5",
      string_decoder: true,
      "node:string_decoder": [">= 14.18 && < 15", ">= 16"],
      sys: [">= 0.4 && < 0.7", ">= 0.8"],
      "node:sys": [">= 14.18 && < 15", ">= 16"],
      "test/reporters": ">= 19.9 && < 20.2",
      "node:test/reporters": [">= 18.17 && < 19", ">= 19.9", ">= 20"],
      "node:test": [">= 16.17 && < 17", ">= 18"],
      timers: true,
      "node:timers": [">= 14.18 && < 15", ">= 16"],
      "timers/promises": ">= 15",
      "node:timers/promises": ">= 16",
      _tls_common: ">= 0.11.13",
      "node:_tls_common": [">= 14.18 && < 15", ">= 16"],
      _tls_legacy: ">= 0.11.3 && < 10",
      _tls_wrap: ">= 0.11.3",
      "node:_tls_wrap": [">= 14.18 && < 15", ">= 16"],
      tls: true,
      "node:tls": [">= 14.18 && < 15", ">= 16"],
      trace_events: ">= 10",
      "node:trace_events": [">= 14.18 && < 15", ">= 16"],
      tty: true,
      "node:tty": [">= 14.18 && < 15", ">= 16"],
      url: true,
      "node:url": [">= 14.18 && < 15", ">= 16"],
      util: true,
      "node:util": [">= 14.18 && < 15", ">= 16"],
      "util/types": ">= 15.3",
      "node:util/types": ">= 16",
      "v8/tools/arguments": ">= 10 && < 12",
      "v8/tools/codemap": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      "v8/tools/consarray": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      "v8/tools/csvparser": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      "v8/tools/logreader": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      "v8/tools/profile_view": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      "v8/tools/splaytree": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      v8: ">= 1",
      "node:v8": [">= 14.18 && < 15", ">= 16"],
      vm: true,
      "node:vm": [">= 14.18 && < 15", ">= 16"],
      wasi: [">= 13.4 && < 13.5", ">= 18.17 && < 19", ">= 20"],
      "node:wasi": [">= 18.17 && < 19", ">= 20"],
      worker_threads: ">= 11.7",
      "node:worker_threads": [">= 14.18 && < 15", ">= 16"],
      zlib: ">= 0.5",
      "node:zlib": [">= 14.18 && < 15", ">= 16"]
    };
  }
});

// ../../node_modules/.pnpm/is-core-module@2.13.1/node_modules/is-core-module/index.js
var require_is_core_module = __commonJS({
  "../../node_modules/.pnpm/is-core-module@2.13.1/node_modules/is-core-module/index.js"(exports, module2) {
    "use strict";
    var hasOwn = require_hasown();
    function specifierIncluded(current, specifier) {
      var nodeParts = current.split(".");
      var parts = specifier.split(" ");
      var op = parts.length > 1 ? parts[0] : "=";
      var versionParts = (parts.length > 1 ? parts[1] : parts[0]).split(".");
      for (var i = 0; i < 3; ++i) {
        var cur = parseInt(nodeParts[i] || 0, 10);
        var ver = parseInt(versionParts[i] || 0, 10);
        if (cur === ver) {
          continue;
        }
        if (op === "<") {
          return cur < ver;
        }
        if (op === ">=") {
          return cur >= ver;
        }
        return false;
      }
      return op === ">=";
    }
    function matchesRange(current, range) {
      var specifiers = range.split(/ ?&& ?/);
      if (specifiers.length === 0) {
        return false;
      }
      for (var i = 0; i < specifiers.length; ++i) {
        if (!specifierIncluded(current, specifiers[i])) {
          return false;
        }
      }
      return true;
    }
    function versionIncluded(nodeVersion, specifierValue) {
      if (typeof specifierValue === "boolean") {
        return specifierValue;
      }
      var current = typeof nodeVersion === "undefined" ? process.versions && process.versions.node : nodeVersion;
      if (typeof current !== "string") {
        throw new TypeError(typeof nodeVersion === "undefined" ? "Unable to determine current node version" : "If provided, a valid node version is required");
      }
      if (specifierValue && typeof specifierValue === "object") {
        for (var i = 0; i < specifierValue.length; ++i) {
          if (matchesRange(current, specifierValue[i])) {
            return true;
          }
        }
        return false;
      }
      return matchesRange(current, specifierValue);
    }
    var data = require_core();
    module2.exports = function isCore(x, nodeVersion) {
      return hasOwn(data, x) && versionIncluded(nodeVersion, data[x]);
    };
  }
});

// ../../node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/async.js
var require_async = __commonJS({
  "../../node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/async.js"(exports, module2) {
    var fs2 = require("fs");
    var getHomedir = require_homedir();
    var path = require("path");
    var caller = require_caller();
    var nodeModulesPaths = require_node_modules_paths();
    var normalizeOptions = require_normalize_options();
    var isCore = require_is_core_module();
    var realpathFS = process.platform !== "win32" && fs2.realpath && typeof fs2.realpath.native === "function" ? fs2.realpath.native : fs2.realpath;
    var homedir = getHomedir();
    var defaultPaths = function() {
      return [
        path.join(homedir, ".node_modules"),
        path.join(homedir, ".node_libraries")
      ];
    };
    var defaultIsFile = function isFile(file, cb) {
      fs2.stat(file, function(err, stat) {
        if (!err) {
          return cb(null, stat.isFile() || stat.isFIFO());
        }
        if (err.code === "ENOENT" || err.code === "ENOTDIR")
          return cb(null, false);
        return cb(err);
      });
    };
    var defaultIsDir = function isDirectory(dir, cb) {
      fs2.stat(dir, function(err, stat) {
        if (!err) {
          return cb(null, stat.isDirectory());
        }
        if (err.code === "ENOENT" || err.code === "ENOTDIR")
          return cb(null, false);
        return cb(err);
      });
    };
    var defaultRealpath = function realpath(x, cb) {
      realpathFS(x, function(realpathErr, realPath) {
        if (realpathErr && realpathErr.code !== "ENOENT")
          cb(realpathErr);
        else
          cb(null, realpathErr ? x : realPath);
      });
    };
    var maybeRealpath = function maybeRealpath2(realpath, x, opts, cb) {
      if (opts && opts.preserveSymlinks === false) {
        realpath(x, cb);
      } else {
        cb(null, x);
      }
    };
    var defaultReadPackage = function defaultReadPackage2(readFile, pkgfile, cb) {
      readFile(pkgfile, function(readFileErr, body) {
        if (readFileErr)
          cb(readFileErr);
        else {
          try {
            var pkg = JSON.parse(body);
            cb(null, pkg);
          } catch (jsonErr) {
            cb(null);
          }
        }
      });
    };
    var getPackageCandidates = function getPackageCandidates2(x, start, opts) {
      var dirs = nodeModulesPaths(start, opts, x);
      for (var i = 0; i < dirs.length; i++) {
        dirs[i] = path.join(dirs[i], x);
      }
      return dirs;
    };
    module2.exports = function resolve2(x, options, callback) {
      var cb = callback;
      var opts = options;
      if (typeof options === "function") {
        cb = opts;
        opts = {};
      }
      if (typeof x !== "string") {
        var err = new TypeError("Path must be a string.");
        return process.nextTick(function() {
          cb(err);
        });
      }
      opts = normalizeOptions(x, opts);
      var isFile = opts.isFile || defaultIsFile;
      var isDirectory = opts.isDirectory || defaultIsDir;
      var readFile = opts.readFile || fs2.readFile;
      var realpath = opts.realpath || defaultRealpath;
      var readPackage = opts.readPackage || defaultReadPackage;
      if (opts.readFile && opts.readPackage) {
        var conflictErr = new TypeError("`readFile` and `readPackage` are mutually exclusive.");
        return process.nextTick(function() {
          cb(conflictErr);
        });
      }
      var packageIterator = opts.packageIterator;
      var extensions = opts.extensions || [".js"];
      var includeCoreModules = opts.includeCoreModules !== false;
      var basedir = opts.basedir || path.dirname(caller());
      var parent = opts.filename || basedir;
      opts.paths = opts.paths || defaultPaths();
      var absoluteStart = path.resolve(basedir);
      maybeRealpath(
        realpath,
        absoluteStart,
        opts,
        function(err2, realStart) {
          if (err2)
            cb(err2);
          else
            init(realStart);
        }
      );
      var res;
      function init(basedir2) {
        if (/^(?:\.\.?(?:\/|$)|\/|([A-Za-z]:)?[/\\])/.test(x)) {
          res = path.resolve(basedir2, x);
          if (x === "." || x === ".." || x.slice(-1) === "/")
            res += "/";
          if (/\/$/.test(x) && res === basedir2) {
            loadAsDirectory(res, opts.package, onfile);
          } else
            loadAsFile(res, opts.package, onfile);
        } else if (includeCoreModules && isCore(x)) {
          return cb(null, x);
        } else
          loadNodeModules(x, basedir2, function(err2, n, pkg) {
            if (err2)
              cb(err2);
            else if (n) {
              return maybeRealpath(realpath, n, opts, function(err3, realN) {
                if (err3) {
                  cb(err3);
                } else {
                  cb(null, realN, pkg);
                }
              });
            } else {
              var moduleError = new Error("Cannot find module '" + x + "' from '" + parent + "'");
              moduleError.code = "MODULE_NOT_FOUND";
              cb(moduleError);
            }
          });
      }
      function onfile(err2, m, pkg) {
        if (err2)
          cb(err2);
        else if (m)
          cb(null, m, pkg);
        else
          loadAsDirectory(res, function(err3, d, pkg2) {
            if (err3)
              cb(err3);
            else if (d) {
              maybeRealpath(realpath, d, opts, function(err4, realD) {
                if (err4) {
                  cb(err4);
                } else {
                  cb(null, realD, pkg2);
                }
              });
            } else {
              var moduleError = new Error("Cannot find module '" + x + "' from '" + parent + "'");
              moduleError.code = "MODULE_NOT_FOUND";
              cb(moduleError);
            }
          });
      }
      function loadAsFile(x2, thePackage, callback2) {
        var loadAsFilePackage = thePackage;
        var cb2 = callback2;
        if (typeof loadAsFilePackage === "function") {
          cb2 = loadAsFilePackage;
          loadAsFilePackage = void 0;
        }
        var exts = [""].concat(extensions);
        load(exts, x2, loadAsFilePackage);
        function load(exts2, x3, loadPackage) {
          if (exts2.length === 0)
            return cb2(null, void 0, loadPackage);
          var file = x3 + exts2[0];
          var pkg = loadPackage;
          if (pkg)
            onpkg(null, pkg);
          else
            loadpkg(path.dirname(file), onpkg);
          function onpkg(err2, pkg_, dir) {
            pkg = pkg_;
            if (err2)
              return cb2(err2);
            if (dir && pkg && opts.pathFilter) {
              var rfile = path.relative(dir, file);
              var rel = rfile.slice(0, rfile.length - exts2[0].length);
              var r = opts.pathFilter(pkg, x3, rel);
              if (r)
                return load(
                  [""].concat(extensions.slice()),
                  path.resolve(dir, r),
                  pkg
                );
            }
            isFile(file, onex);
          }
          function onex(err2, ex) {
            if (err2)
              return cb2(err2);
            if (ex)
              return cb2(null, file, pkg);
            load(exts2.slice(1), x3, pkg);
          }
        }
      }
      function loadpkg(dir, cb2) {
        if (dir === "" || dir === "/")
          return cb2(null);
        if (process.platform === "win32" && /^\w:[/\\]*$/.test(dir)) {
          return cb2(null);
        }
        if (/[/\\]node_modules[/\\]*$/.test(dir))
          return cb2(null);
        maybeRealpath(realpath, dir, opts, function(unwrapErr, pkgdir) {
          if (unwrapErr)
            return loadpkg(path.dirname(dir), cb2);
          var pkgfile = path.join(pkgdir, "package.json");
          isFile(pkgfile, function(err2, ex) {
            if (!ex)
              return loadpkg(path.dirname(dir), cb2);
            readPackage(readFile, pkgfile, function(err3, pkgParam) {
              if (err3)
                cb2(err3);
              var pkg = pkgParam;
              if (pkg && opts.packageFilter) {
                pkg = opts.packageFilter(pkg, pkgfile);
              }
              cb2(null, pkg, dir);
            });
          });
        });
      }
      function loadAsDirectory(x2, loadAsDirectoryPackage, callback2) {
        var cb2 = callback2;
        var fpkg = loadAsDirectoryPackage;
        if (typeof fpkg === "function") {
          cb2 = fpkg;
          fpkg = opts.package;
        }
        maybeRealpath(realpath, x2, opts, function(unwrapErr, pkgdir) {
          if (unwrapErr)
            return cb2(unwrapErr);
          var pkgfile = path.join(pkgdir, "package.json");
          isFile(pkgfile, function(err2, ex) {
            if (err2)
              return cb2(err2);
            if (!ex)
              return loadAsFile(path.join(x2, "index"), fpkg, cb2);
            readPackage(readFile, pkgfile, function(err3, pkgParam) {
              if (err3)
                return cb2(err3);
              var pkg = pkgParam;
              if (pkg && opts.packageFilter) {
                pkg = opts.packageFilter(pkg, pkgfile);
              }
              if (pkg && pkg.main) {
                if (typeof pkg.main !== "string") {
                  var mainError = new TypeError("package \u201C" + pkg.name + "\u201D `main` must be a string");
                  mainError.code = "INVALID_PACKAGE_MAIN";
                  return cb2(mainError);
                }
                if (pkg.main === "." || pkg.main === "./") {
                  pkg.main = "index";
                }
                loadAsFile(path.resolve(x2, pkg.main), pkg, function(err4, m, pkg2) {
                  if (err4)
                    return cb2(err4);
                  if (m)
                    return cb2(null, m, pkg2);
                  if (!pkg2)
                    return loadAsFile(path.join(x2, "index"), pkg2, cb2);
                  var dir = path.resolve(x2, pkg2.main);
                  loadAsDirectory(dir, pkg2, function(err5, n, pkg3) {
                    if (err5)
                      return cb2(err5);
                    if (n)
                      return cb2(null, n, pkg3);
                    loadAsFile(path.join(x2, "index"), pkg3, cb2);
                  });
                });
                return;
              }
              loadAsFile(path.join(x2, "/index"), pkg, cb2);
            });
          });
        });
      }
      function processDirs(cb2, dirs) {
        if (dirs.length === 0)
          return cb2(null, void 0);
        var dir = dirs[0];
        isDirectory(path.dirname(dir), isdir);
        function isdir(err2, isdir2) {
          if (err2)
            return cb2(err2);
          if (!isdir2)
            return processDirs(cb2, dirs.slice(1));
          loadAsFile(dir, opts.package, onfile2);
        }
        function onfile2(err2, m, pkg) {
          if (err2)
            return cb2(err2);
          if (m)
            return cb2(null, m, pkg);
          loadAsDirectory(dir, opts.package, ondir);
        }
        function ondir(err2, n, pkg) {
          if (err2)
            return cb2(err2);
          if (n)
            return cb2(null, n, pkg);
          processDirs(cb2, dirs.slice(1));
        }
      }
      function loadNodeModules(x2, start, cb2) {
        var thunk = function() {
          return getPackageCandidates(x2, start, opts);
        };
        processDirs(
          cb2,
          packageIterator ? packageIterator(x2, start, thunk, opts) : thunk()
        );
      }
    };
  }
});

// ../../node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/core.json
var require_core2 = __commonJS({
  "../../node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/core.json"(exports, module2) {
    module2.exports = {
      assert: true,
      "node:assert": [">= 14.18 && < 15", ">= 16"],
      "assert/strict": ">= 15",
      "node:assert/strict": ">= 16",
      async_hooks: ">= 8",
      "node:async_hooks": [">= 14.18 && < 15", ">= 16"],
      buffer_ieee754: ">= 0.5 && < 0.9.7",
      buffer: true,
      "node:buffer": [">= 14.18 && < 15", ">= 16"],
      child_process: true,
      "node:child_process": [">= 14.18 && < 15", ">= 16"],
      cluster: ">= 0.5",
      "node:cluster": [">= 14.18 && < 15", ">= 16"],
      console: true,
      "node:console": [">= 14.18 && < 15", ">= 16"],
      constants: true,
      "node:constants": [">= 14.18 && < 15", ">= 16"],
      crypto: true,
      "node:crypto": [">= 14.18 && < 15", ">= 16"],
      _debug_agent: ">= 1 && < 8",
      _debugger: "< 8",
      dgram: true,
      "node:dgram": [">= 14.18 && < 15", ">= 16"],
      diagnostics_channel: [">= 14.17 && < 15", ">= 15.1"],
      "node:diagnostics_channel": [">= 14.18 && < 15", ">= 16"],
      dns: true,
      "node:dns": [">= 14.18 && < 15", ">= 16"],
      "dns/promises": ">= 15",
      "node:dns/promises": ">= 16",
      domain: ">= 0.7.12",
      "node:domain": [">= 14.18 && < 15", ">= 16"],
      events: true,
      "node:events": [">= 14.18 && < 15", ">= 16"],
      freelist: "< 6",
      fs: true,
      "node:fs": [">= 14.18 && < 15", ">= 16"],
      "fs/promises": [">= 10 && < 10.1", ">= 14"],
      "node:fs/promises": [">= 14.18 && < 15", ">= 16"],
      _http_agent: ">= 0.11.1",
      "node:_http_agent": [">= 14.18 && < 15", ">= 16"],
      _http_client: ">= 0.11.1",
      "node:_http_client": [">= 14.18 && < 15", ">= 16"],
      _http_common: ">= 0.11.1",
      "node:_http_common": [">= 14.18 && < 15", ">= 16"],
      _http_incoming: ">= 0.11.1",
      "node:_http_incoming": [">= 14.18 && < 15", ">= 16"],
      _http_outgoing: ">= 0.11.1",
      "node:_http_outgoing": [">= 14.18 && < 15", ">= 16"],
      _http_server: ">= 0.11.1",
      "node:_http_server": [">= 14.18 && < 15", ">= 16"],
      http: true,
      "node:http": [">= 14.18 && < 15", ">= 16"],
      http2: ">= 8.8",
      "node:http2": [">= 14.18 && < 15", ">= 16"],
      https: true,
      "node:https": [">= 14.18 && < 15", ">= 16"],
      inspector: ">= 8",
      "node:inspector": [">= 14.18 && < 15", ">= 16"],
      "inspector/promises": [">= 19"],
      "node:inspector/promises": [">= 19"],
      _linklist: "< 8",
      module: true,
      "node:module": [">= 14.18 && < 15", ">= 16"],
      net: true,
      "node:net": [">= 14.18 && < 15", ">= 16"],
      "node-inspect/lib/_inspect": ">= 7.6 && < 12",
      "node-inspect/lib/internal/inspect_client": ">= 7.6 && < 12",
      "node-inspect/lib/internal/inspect_repl": ">= 7.6 && < 12",
      os: true,
      "node:os": [">= 14.18 && < 15", ">= 16"],
      path: true,
      "node:path": [">= 14.18 && < 15", ">= 16"],
      "path/posix": ">= 15.3",
      "node:path/posix": ">= 16",
      "path/win32": ">= 15.3",
      "node:path/win32": ">= 16",
      perf_hooks: ">= 8.5",
      "node:perf_hooks": [">= 14.18 && < 15", ">= 16"],
      process: ">= 1",
      "node:process": [">= 14.18 && < 15", ">= 16"],
      punycode: ">= 0.5",
      "node:punycode": [">= 14.18 && < 15", ">= 16"],
      querystring: true,
      "node:querystring": [">= 14.18 && < 15", ">= 16"],
      readline: true,
      "node:readline": [">= 14.18 && < 15", ">= 16"],
      "readline/promises": ">= 17",
      "node:readline/promises": ">= 17",
      repl: true,
      "node:repl": [">= 14.18 && < 15", ">= 16"],
      smalloc: ">= 0.11.5 && < 3",
      _stream_duplex: ">= 0.9.4",
      "node:_stream_duplex": [">= 14.18 && < 15", ">= 16"],
      _stream_transform: ">= 0.9.4",
      "node:_stream_transform": [">= 14.18 && < 15", ">= 16"],
      _stream_wrap: ">= 1.4.1",
      "node:_stream_wrap": [">= 14.18 && < 15", ">= 16"],
      _stream_passthrough: ">= 0.9.4",
      "node:_stream_passthrough": [">= 14.18 && < 15", ">= 16"],
      _stream_readable: ">= 0.9.4",
      "node:_stream_readable": [">= 14.18 && < 15", ">= 16"],
      _stream_writable: ">= 0.9.4",
      "node:_stream_writable": [">= 14.18 && < 15", ">= 16"],
      stream: true,
      "node:stream": [">= 14.18 && < 15", ">= 16"],
      "stream/consumers": ">= 16.7",
      "node:stream/consumers": ">= 16.7",
      "stream/promises": ">= 15",
      "node:stream/promises": ">= 16",
      "stream/web": ">= 16.5",
      "node:stream/web": ">= 16.5",
      string_decoder: true,
      "node:string_decoder": [">= 14.18 && < 15", ">= 16"],
      sys: [">= 0.4 && < 0.7", ">= 0.8"],
      "node:sys": [">= 14.18 && < 15", ">= 16"],
      "test/reporters": ">= 19.9 && < 20.2",
      "node:test/reporters": [">= 18.17 && < 19", ">= 19.9", ">= 20"],
      "node:test": [">= 16.17 && < 17", ">= 18"],
      timers: true,
      "node:timers": [">= 14.18 && < 15", ">= 16"],
      "timers/promises": ">= 15",
      "node:timers/promises": ">= 16",
      _tls_common: ">= 0.11.13",
      "node:_tls_common": [">= 14.18 && < 15", ">= 16"],
      _tls_legacy: ">= 0.11.3 && < 10",
      _tls_wrap: ">= 0.11.3",
      "node:_tls_wrap": [">= 14.18 && < 15", ">= 16"],
      tls: true,
      "node:tls": [">= 14.18 && < 15", ">= 16"],
      trace_events: ">= 10",
      "node:trace_events": [">= 14.18 && < 15", ">= 16"],
      tty: true,
      "node:tty": [">= 14.18 && < 15", ">= 16"],
      url: true,
      "node:url": [">= 14.18 && < 15", ">= 16"],
      util: true,
      "node:util": [">= 14.18 && < 15", ">= 16"],
      "util/types": ">= 15.3",
      "node:util/types": ">= 16",
      "v8/tools/arguments": ">= 10 && < 12",
      "v8/tools/codemap": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      "v8/tools/consarray": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      "v8/tools/csvparser": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      "v8/tools/logreader": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      "v8/tools/profile_view": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      "v8/tools/splaytree": [">= 4.4 && < 5", ">= 5.2 && < 12"],
      v8: ">= 1",
      "node:v8": [">= 14.18 && < 15", ">= 16"],
      vm: true,
      "node:vm": [">= 14.18 && < 15", ">= 16"],
      wasi: [">= 13.4 && < 13.5", ">= 18.17 && < 19", ">= 20"],
      "node:wasi": [">= 18.17 && < 19", ">= 20"],
      worker_threads: ">= 11.7",
      "node:worker_threads": [">= 14.18 && < 15", ">= 16"],
      zlib: ">= 0.5",
      "node:zlib": [">= 14.18 && < 15", ">= 16"]
    };
  }
});

// ../../node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/core.js
var require_core3 = __commonJS({
  "../../node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/core.js"(exports, module2) {
    "use strict";
    var isCoreModule = require_is_core_module();
    var data = require_core2();
    var core = {};
    for (mod in data) {
      if (Object.prototype.hasOwnProperty.call(data, mod)) {
        core[mod] = isCoreModule(mod);
      }
    }
    var mod;
    module2.exports = core;
  }
});

// ../../node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/is-core.js
var require_is_core = __commonJS({
  "../../node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/is-core.js"(exports, module2) {
    var isCoreModule = require_is_core_module();
    module2.exports = function isCore(x) {
      return isCoreModule(x);
    };
  }
});

// ../../node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/sync.js
var require_sync = __commonJS({
  "../../node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/lib/sync.js"(exports, module2) {
    var isCore = require_is_core_module();
    var fs2 = require("fs");
    var path = require("path");
    var getHomedir = require_homedir();
    var caller = require_caller();
    var nodeModulesPaths = require_node_modules_paths();
    var normalizeOptions = require_normalize_options();
    var realpathFS = process.platform !== "win32" && fs2.realpathSync && typeof fs2.realpathSync.native === "function" ? fs2.realpathSync.native : fs2.realpathSync;
    var homedir = getHomedir();
    var defaultPaths = function() {
      return [
        path.join(homedir, ".node_modules"),
        path.join(homedir, ".node_libraries")
      ];
    };
    var defaultIsFile = function isFile(file) {
      try {
        var stat = fs2.statSync(file, { throwIfNoEntry: false });
      } catch (e) {
        if (e && (e.code === "ENOENT" || e.code === "ENOTDIR"))
          return false;
        throw e;
      }
      return !!stat && (stat.isFile() || stat.isFIFO());
    };
    var defaultIsDir = function isDirectory(dir) {
      try {
        var stat = fs2.statSync(dir, { throwIfNoEntry: false });
      } catch (e) {
        if (e && (e.code === "ENOENT" || e.code === "ENOTDIR"))
          return false;
        throw e;
      }
      return !!stat && stat.isDirectory();
    };
    var defaultRealpathSync = function realpathSync(x) {
      try {
        return realpathFS(x);
      } catch (realpathErr) {
        if (realpathErr.code !== "ENOENT") {
          throw realpathErr;
        }
      }
      return x;
    };
    var maybeRealpathSync = function maybeRealpathSync2(realpathSync, x, opts) {
      if (opts && opts.preserveSymlinks === false) {
        return realpathSync(x);
      }
      return x;
    };
    var defaultReadPackageSync = function defaultReadPackageSync2(readFileSync, pkgfile) {
      var body = readFileSync(pkgfile);
      try {
        var pkg = JSON.parse(body);
        return pkg;
      } catch (jsonErr) {
      }
    };
    var getPackageCandidates = function getPackageCandidates2(x, start, opts) {
      var dirs = nodeModulesPaths(start, opts, x);
      for (var i = 0; i < dirs.length; i++) {
        dirs[i] = path.join(dirs[i], x);
      }
      return dirs;
    };
    module2.exports = function resolveSync(x, options) {
      if (typeof x !== "string") {
        throw new TypeError("Path must be a string.");
      }
      var opts = normalizeOptions(x, options);
      var isFile = opts.isFile || defaultIsFile;
      var readFileSync = opts.readFileSync || fs2.readFileSync;
      var isDirectory = opts.isDirectory || defaultIsDir;
      var realpathSync = opts.realpathSync || defaultRealpathSync;
      var readPackageSync = opts.readPackageSync || defaultReadPackageSync;
      if (opts.readFileSync && opts.readPackageSync) {
        throw new TypeError("`readFileSync` and `readPackageSync` are mutually exclusive.");
      }
      var packageIterator = opts.packageIterator;
      var extensions = opts.extensions || [".js"];
      var includeCoreModules = opts.includeCoreModules !== false;
      var basedir = opts.basedir || path.dirname(caller());
      var parent = opts.filename || basedir;
      opts.paths = opts.paths || defaultPaths();
      var absoluteStart = maybeRealpathSync(realpathSync, path.resolve(basedir), opts);
      if (/^(?:\.\.?(?:\/|$)|\/|([A-Za-z]:)?[/\\])/.test(x)) {
        var res = path.resolve(absoluteStart, x);
        if (x === "." || x === ".." || x.slice(-1) === "/")
          res += "/";
        var m = loadAsFileSync(res) || loadAsDirectorySync(res);
        if (m)
          return maybeRealpathSync(realpathSync, m, opts);
      } else if (includeCoreModules && isCore(x)) {
        return x;
      } else {
        var n = loadNodeModulesSync(x, absoluteStart);
        if (n)
          return maybeRealpathSync(realpathSync, n, opts);
      }
      var err = new Error("Cannot find module '" + x + "' from '" + parent + "'");
      err.code = "MODULE_NOT_FOUND";
      throw err;
      function loadAsFileSync(x2) {
        var pkg = loadpkg(path.dirname(x2));
        if (pkg && pkg.dir && pkg.pkg && opts.pathFilter) {
          var rfile = path.relative(pkg.dir, x2);
          var r = opts.pathFilter(pkg.pkg, x2, rfile);
          if (r) {
            x2 = path.resolve(pkg.dir, r);
          }
        }
        if (isFile(x2)) {
          return x2;
        }
        for (var i = 0; i < extensions.length; i++) {
          var file = x2 + extensions[i];
          if (isFile(file)) {
            return file;
          }
        }
      }
      function loadpkg(dir) {
        if (dir === "" || dir === "/")
          return;
        if (process.platform === "win32" && /^\w:[/\\]*$/.test(dir)) {
          return;
        }
        if (/[/\\]node_modules[/\\]*$/.test(dir))
          return;
        var pkgfile = path.join(maybeRealpathSync(realpathSync, dir, opts), "package.json");
        if (!isFile(pkgfile)) {
          return loadpkg(path.dirname(dir));
        }
        var pkg = readPackageSync(readFileSync, pkgfile);
        if (pkg && opts.packageFilter) {
          pkg = opts.packageFilter(
            pkg,
            /*pkgfile,*/
            dir
          );
        }
        return { pkg, dir };
      }
      function loadAsDirectorySync(x2) {
        var pkgfile = path.join(maybeRealpathSync(realpathSync, x2, opts), "/package.json");
        if (isFile(pkgfile)) {
          try {
            var pkg = readPackageSync(readFileSync, pkgfile);
          } catch (e) {
          }
          if (pkg && opts.packageFilter) {
            pkg = opts.packageFilter(
              pkg,
              /*pkgfile,*/
              x2
            );
          }
          if (pkg && pkg.main) {
            if (typeof pkg.main !== "string") {
              var mainError = new TypeError("package \u201C" + pkg.name + "\u201D `main` must be a string");
              mainError.code = "INVALID_PACKAGE_MAIN";
              throw mainError;
            }
            if (pkg.main === "." || pkg.main === "./") {
              pkg.main = "index";
            }
            try {
              var m2 = loadAsFileSync(path.resolve(x2, pkg.main));
              if (m2)
                return m2;
              var n2 = loadAsDirectorySync(path.resolve(x2, pkg.main));
              if (n2)
                return n2;
            } catch (e) {
            }
          }
        }
        return loadAsFileSync(path.join(x2, "/index"));
      }
      function loadNodeModulesSync(x2, start) {
        var thunk = function() {
          return getPackageCandidates(x2, start, opts);
        };
        var dirs = packageIterator ? packageIterator(x2, start, thunk, opts) : thunk();
        for (var i = 0; i < dirs.length; i++) {
          var dir = dirs[i];
          if (isDirectory(path.dirname(dir))) {
            var m2 = loadAsFileSync(dir);
            if (m2)
              return m2;
            var n2 = loadAsDirectorySync(dir);
            if (n2)
              return n2;
          }
        }
      }
    };
  }
});

// ../../node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/index.js
var require_resolve = __commonJS({
  "../../node_modules/.pnpm/resolve@1.22.8/node_modules/resolve/index.js"(exports, module2) {
    var async = require_async();
    async.core = require_core3();
    async.isCore = require_is_core();
    async.sync = require_sync();
    module2.exports = async;
  }
});

// ../../node_modules/.pnpm/@alloc+quick-lru@5.2.0/node_modules/@alloc/quick-lru/index.js
var require_quick_lru = __commonJS({
  "../../node_modules/.pnpm/@alloc+quick-lru@5.2.0/node_modules/@alloc/quick-lru/index.js"(exports, module2) {
    "use strict";
    var QuickLRU = class {
      constructor(options = {}) {
        if (!(options.maxSize && options.maxSize > 0)) {
          throw new TypeError("`maxSize` must be a number greater than 0");
        }
        if (typeof options.maxAge === "number" && options.maxAge === 0) {
          throw new TypeError("`maxAge` must be a number greater than 0");
        }
        this.maxSize = options.maxSize;
        this.maxAge = options.maxAge || Infinity;
        this.onEviction = options.onEviction;
        this.cache = /* @__PURE__ */ new Map();
        this.oldCache = /* @__PURE__ */ new Map();
        this._size = 0;
      }
      _emitEvictions(cache) {
        if (typeof this.onEviction !== "function") {
          return;
        }
        for (const [key, item] of cache) {
          this.onEviction(key, item.value);
        }
      }
      _deleteIfExpired(key, item) {
        if (typeof item.expiry === "number" && item.expiry <= Date.now()) {
          if (typeof this.onEviction === "function") {
            this.onEviction(key, item.value);
          }
          return this.delete(key);
        }
        return false;
      }
      _getOrDeleteIfExpired(key, item) {
        const deleted = this._deleteIfExpired(key, item);
        if (deleted === false) {
          return item.value;
        }
      }
      _getItemValue(key, item) {
        return item.expiry ? this._getOrDeleteIfExpired(key, item) : item.value;
      }
      _peek(key, cache) {
        const item = cache.get(key);
        return this._getItemValue(key, item);
      }
      _set(key, value) {
        this.cache.set(key, value);
        this._size++;
        if (this._size >= this.maxSize) {
          this._size = 0;
          this._emitEvictions(this.oldCache);
          this.oldCache = this.cache;
          this.cache = /* @__PURE__ */ new Map();
        }
      }
      _moveToRecent(key, item) {
        this.oldCache.delete(key);
        this._set(key, item);
      }
      *_entriesAscending() {
        for (const item of this.oldCache) {
          const [key, value] = item;
          if (!this.cache.has(key)) {
            const deleted = this._deleteIfExpired(key, value);
            if (deleted === false) {
              yield item;
            }
          }
        }
        for (const item of this.cache) {
          const [key, value] = item;
          const deleted = this._deleteIfExpired(key, value);
          if (deleted === false) {
            yield item;
          }
        }
      }
      get(key) {
        if (this.cache.has(key)) {
          const item = this.cache.get(key);
          return this._getItemValue(key, item);
        }
        if (this.oldCache.has(key)) {
          const item = this.oldCache.get(key);
          if (this._deleteIfExpired(key, item) === false) {
            this._moveToRecent(key, item);
            return item.value;
          }
        }
      }
      set(key, value, { maxAge = this.maxAge === Infinity ? void 0 : Date.now() + this.maxAge } = {}) {
        if (this.cache.has(key)) {
          this.cache.set(key, {
            value,
            maxAge
          });
        } else {
          this._set(key, { value, expiry: maxAge });
        }
      }
      has(key) {
        if (this.cache.has(key)) {
          return !this._deleteIfExpired(key, this.cache.get(key));
        }
        if (this.oldCache.has(key)) {
          return !this._deleteIfExpired(key, this.oldCache.get(key));
        }
        return false;
      }
      peek(key) {
        if (this.cache.has(key)) {
          return this._peek(key, this.cache);
        }
        if (this.oldCache.has(key)) {
          return this._peek(key, this.oldCache);
        }
      }
      delete(key) {
        const deleted = this.cache.delete(key);
        if (deleted) {
          this._size--;
        }
        return this.oldCache.delete(key) || deleted;
      }
      clear() {
        this.cache.clear();
        this.oldCache.clear();
        this._size = 0;
      }
      resize(newSize) {
        if (!(newSize && newSize > 0)) {
          throw new TypeError("`maxSize` must be a number greater than 0");
        }
        const items = [...this._entriesAscending()];
        const removeCount = items.length - newSize;
        if (removeCount < 0) {
          this.cache = new Map(items);
          this.oldCache = /* @__PURE__ */ new Map();
          this._size = items.length;
        } else {
          if (removeCount > 0) {
            this._emitEvictions(items.slice(0, removeCount));
          }
          this.oldCache = new Map(items.slice(removeCount));
          this.cache = /* @__PURE__ */ new Map();
          this._size = 0;
        }
        this.maxSize = newSize;
      }
      *keys() {
        for (const [key] of this) {
          yield key;
        }
      }
      *values() {
        for (const [, value] of this) {
          yield value;
        }
      }
      *[Symbol.iterator]() {
        for (const item of this.cache) {
          const [key, value] = item;
          const deleted = this._deleteIfExpired(key, value);
          if (deleted === false) {
            yield [key, value.value];
          }
        }
        for (const item of this.oldCache) {
          const [key, value] = item;
          if (!this.cache.has(key)) {
            const deleted = this._deleteIfExpired(key, value);
            if (deleted === false) {
              yield [key, value.value];
            }
          }
        }
      }
      *entriesDescending() {
        let items = [...this.cache];
        for (let i = items.length - 1; i >= 0; --i) {
          const item = items[i];
          const [key, value] = item;
          const deleted = this._deleteIfExpired(key, value);
          if (deleted === false) {
            yield [key, value.value];
          }
        }
        items = [...this.oldCache];
        for (let i = items.length - 1; i >= 0; --i) {
          const item = items[i];
          const [key, value] = item;
          if (!this.cache.has(key)) {
            const deleted = this._deleteIfExpired(key, value);
            if (deleted === false) {
              yield [key, value.value];
            }
          }
        }
      }
      *entriesAscending() {
        for (const [key, value] of this._entriesAscending()) {
          yield [key, value.value];
        }
      }
      get size() {
        if (!this._size) {
          return this.oldCache.size;
        }
        let oldCacheSize = 0;
        for (const key of this.oldCache.keys()) {
          if (!this.cache.has(key)) {
            oldCacheSize++;
          }
        }
        return Math.min(this._size + oldCacheSize, this.maxSize);
      }
    };
    module2.exports = QuickLRU;
  }
});

// ../../node_modules/.pnpm/is-buffer@2.0.5/node_modules/is-buffer/index.js
var require_is_buffer = __commonJS({
  "../../node_modules/.pnpm/is-buffer@2.0.5/node_modules/is-buffer/index.js"(exports, module2) {
    module2.exports = function isBuffer(obj) {
      return obj != null && obj.constructor != null && typeof obj.constructor.isBuffer === "function" && obj.constructor.isBuffer(obj);
    };
  }
});

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => viteMdx
});
module.exports = __toCommonJS(src_exports);

// src/common.ts
function mergeArrays(a = [], b = []) {
  return a.concat(b).filter(Boolean);
}

// src/transform.ts
var import_esbuild = require("esbuild");

// src/imports.ts
var import_resolve = __toESM(require_resolve(), 1);
var importCache = {};
function resolveMdxImport(cwd) {
  return resolveImport("@mdx-js/mdx", cwd) || require.resolve("@mdx-js/mdx");
}
function requireFrom(name, cwd) {
  return require(resolveImport(name, cwd, true));
}
function resolveImport(name, cwd, throwOnMissing) {
  const cacheKey = cwd + "\0" + name;
  if (!importCache[cacheKey]) {
    try {
      importCache[cacheKey] = import_resolve.default.sync(name, { basedir: cwd });
    } catch (e) {
      if (throwOnMissing) {
        throw new Error(`[vite-plugin-mdx] "${name}" must be installed`);
      }
    }
  }
  return importCache[cacheKey];
}
function assertImportExists(name, cwd) {
  return resolveImport(name, cwd, true) && name;
}
function inferNamedImports(root) {
  return resolveImport("preact", root) ? { preact: ["h"], "@mdx-js/preact": ["mdx"] } : { react: "React" };
}

// src/transform.ts
function createTransformer(root, namedImports = inferNamedImports(root)) {
  const imports = Object.entries(namedImports).map(
    ([packageName, imported]) => {
      assertImportExists(packageName, root);
      return Array.isArray(imported) ? `import { ${imported.join(", ")} } from '${packageName}'` : `import ${imported} from '${packageName}'`;
    }
  );
  return async function transform2(code_mdx, mdxOptions) {
    const mdx = await import("@mdx-js/mdx");
    let code_jsx = await mdx.compile(code_mdx, mdxOptions);
    let code = !mdxOptions.jsx ? await jsxToES2019(code_jsx.toString()) : code_jsx.toString();
    return imports.concat("", code).join("\n");
  };
}
async function jsxToES2019(code_jsx) {
  let { code: code_es2019 } = await (0, import_esbuild.transform)(code_jsx, {
    loader: "jsx",
    jsxFactory: "mdx",
    target: "es2019"
  });
  code_es2019 = code_es2019.replace(
    "export default function MDXContent",
    "export default MDXContent; function MDXContent"
  );
  return code_es2019;
}

// src/viteMdxTransclusion/index.ts
var import_quick_lru = __toESM(require_quick_lru(), 1);
var import_fs = __toESM(require("fs"), 1);
var import_path = require("path");
var import_vite = require("vite");

// src/viteMdxTransclusion/ImportMap.ts
var ImportMap = class {
  constructor() {
    /** Track importers by their imports */
    this.importers = /* @__PURE__ */ new Map();
    /** Track imports by their importers */
    this.imports = /* @__PURE__ */ new Map();
  }
  addImport(id, importer) {
    let imports = this.imports.get(importer);
    if (!imports)
      this.imports.set(importer, imports = /* @__PURE__ */ new Set());
    imports.add(id);
    let importers = this.importers.get(id);
    if (!importers)
      this.importers.set(id, importers = /* @__PURE__ */ new Set());
    importers.add(importer);
  }
  deleteImporter(importer) {
    if (this.imports.delete(importer))
      this.importers.forEach((importers, id) => {
        importers.delete(importer);
        if (!importers.size) {
          this.importers.delete(id);
        }
      });
  }
};

// src/viteMdxTransclusion/createMdxAstCompiler.ts
function createMdxAstCompiler(cwd, remarkPlugins) {
  const mdxRoot = resolveMdxImport(cwd);
  const unified = requireFrom("unified", mdxRoot);
  const remarkParse = requireFrom("remark-parse", mdxRoot);
  const remarkMdx = requireFrom("remark-mdx", mdxRoot);
  const squeeze = requireFrom("remark-squeeze-paragraphs", mdxRoot);
  return unified().use(remarkParse).use(remarkMdx).use(squeeze).use(remarkPlugins).freeze();
}

// src/viteMdxTransclusion/remarkTransclusion.ts
var importRE = /^import ['"](.+)['"]\s*$/;
var mdxRE = /\.mdx?$/;
function remarkTransclusion({
  resolve: resolve2,
  readFile,
  getCompiler,
  importMap,
  astCache
}) {
  return () => async (ast, file) => {
    if (!isRootNode(ast))
      return;
    const importer = file.path;
    importMap?.deleteImporter(importer);
    const imports = findMdxImports(ast);
    if (imports.length) {
      const splices = await Promise.all(
        imports.map(
          async ({ id, index: index2 }) => {
            const importedPath = await resolve2(id, importer);
            if (!importedPath) {
              return [index2, 1, []];
            }
            importMap?.addImport(importedPath, importer);
            let ast2 = astCache?.get(importedPath);
            if (!ast2) {
              const importedFile = {
                path: importedPath,
                contents: await readFile(importedPath)
              };
              const compiler = getCompiler(importedPath);
              const parsedFile = compiler.parse(importedFile);
              const compiledFile = await compiler.run(parsedFile, importedFile);
              ast2 = compiledFile.children;
              astCache?.set(importedPath, ast2);
            }
            return [index2, 1, ast2];
          }
        )
      );
      let { children } = ast;
      for (const [index2, deleteCount, inserted] of splices.reverse())
        children = children.slice(0, index2).concat(inserted, children.slice(index2 + deleteCount));
      ast.children = children;
    }
  };
}
function findMdxImports(ast) {
  const imports = [];
  ast.children.forEach((node, index2) => {
    if (node.type === "mdxjsEsm" || node.type === "import") {
      const id = importRE.exec(node.value)?.[1];
      if (id && mdxRE.test(id)) {
        imports.push({ id, node, index: index2 });
      }
    }
  });
  return imports;
}
function isRootNode(node) {
  return node.type === "root";
}

// src/viteMdxTransclusion/index.ts
function viteMdxTransclusion(globalMdxOptions, getMdxOptions) {
  let importMap;
  let astCache;
  let resolvedConfig;
  let watcher;
  const plugin = {
    name: "mdx:transclusion",
    configResolved(config) {
      resolvedConfig = config;
    },
    configureServer(server) {
      watcher = server.watcher;
      importMap = new ImportMap();
      astCache = new import_quick_lru.default({
        maxAge: 30 * 6e4,
        // 30 minutes
        maxSize: 100
      });
      watcher.on("all", (event, filePath) => {
        if (/\.mdx?$/.test(filePath)) {
          if (event === "unlink") {
            importMap.deleteImporter(filePath);
          }
          const importers = importMap.importers.get(filePath);
          if (importers) {
            astCache.delete(filePath);
            importers.forEach((importer) => {
              watcher.emit("change", importer);
            });
          }
        }
      });
    },
    buildStart() {
      if (!resolvedConfig)
        throw new Error(
          "vite-plugin-mdx: configResolved hook should be called before calling buildStart hook"
        );
      const { root, logger } = resolvedConfig;
      globalMdxOptions.remarkPlugins.push(
        remarkTransclusion({
          astCache,
          importMap,
          resolve: async (id, importer) => {
            const resolved = await this.resolve(id, importer);
            if (resolved) {
              id = (0, import_vite.normalizePath)(resolved.id);
              if (watcher && (0, import_path.isAbsolute)(id) && !id.startsWith(root + "/")) {
                watcher.add(id);
              }
              return id;
            }
            logger.warn(`Failed to resolve "${id}" imported by "${importer}"`);
          },
          readFile: (filePath) => import_fs.default.promises.readFile(filePath, "utf8"),
          getCompiler: (filePath) => createMdxAstCompiler(
            root,
            mergeArrays(
              globalMdxOptions.remarkPlugins,
              getMdxOptions?.(filePath).remarkPlugins
            )
          )
        })
      );
    }
  };
  return plugin;
}

// ../../node_modules/.pnpm/vfile@5.3.7/node_modules/vfile/lib/index.js
var import_is_buffer = __toESM(require_is_buffer(), 1);

// ../../node_modules/.pnpm/unist-util-stringify-position@3.0.3/node_modules/unist-util-stringify-position/lib/index.js
function stringifyPosition(value) {
  if (!value || typeof value !== "object") {
    return "";
  }
  if ("position" in value || "type" in value) {
    return position(value.position);
  }
  if ("start" in value || "end" in value) {
    return position(value);
  }
  if ("line" in value || "column" in value) {
    return point(value);
  }
  return "";
}
function point(point2) {
  return index(point2 && point2.line) + ":" + index(point2 && point2.column);
}
function position(pos) {
  return point(pos && pos.start) + "-" + point(pos && pos.end);
}
function index(value) {
  return value && typeof value === "number" ? value : 1;
}

// ../../node_modules/.pnpm/vfile-message@3.1.4/node_modules/vfile-message/lib/index.js
var VFileMessage = class extends Error {
  /**
   * Create a message for `reason` at `place` from `origin`.
   *
   * When an error is passed in as `reason`, the `stack` is copied.
   *
   * @param {string | Error | VFileMessage} reason
   *   Reason for message, uses the stack and message of the error if given.
   *
   *   > 👉 **Note**: you should use markdown.
   * @param {Node | NodeLike | Position | Point | null | undefined} [place]
   *   Place in file where the message occurred.
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns
   *   Instance of `VFileMessage`.
   */
  // To do: next major: expose `undefined` everywhere instead of `null`.
  constructor(reason, place, origin) {
    const parts = [null, null];
    let position2 = {
      // @ts-expect-error: we always follows the structure of `position`.
      start: { line: null, column: null },
      // @ts-expect-error: "
      end: { line: null, column: null }
    };
    super();
    if (typeof place === "string") {
      origin = place;
      place = void 0;
    }
    if (typeof origin === "string") {
      const index2 = origin.indexOf(":");
      if (index2 === -1) {
        parts[1] = origin;
      } else {
        parts[0] = origin.slice(0, index2);
        parts[1] = origin.slice(index2 + 1);
      }
    }
    if (place) {
      if ("type" in place || "position" in place) {
        if (place.position) {
          position2 = place.position;
        }
      } else if ("start" in place || "end" in place) {
        position2 = place;
      } else if ("line" in place || "column" in place) {
        position2.start = place;
      }
    }
    this.name = stringifyPosition(place) || "1:1";
    this.message = typeof reason === "object" ? reason.message : reason;
    this.stack = "";
    if (typeof reason === "object" && reason.stack) {
      this.stack = reason.stack;
    }
    this.reason = this.message;
    this.fatal;
    this.line = position2.start.line;
    this.column = position2.start.column;
    this.position = position2;
    this.source = parts[0];
    this.ruleId = parts[1];
    this.file;
    this.actual;
    this.expected;
    this.url;
    this.note;
  }
};
VFileMessage.prototype.file = "";
VFileMessage.prototype.name = "";
VFileMessage.prototype.reason = "";
VFileMessage.prototype.message = "";
VFileMessage.prototype.stack = "";
VFileMessage.prototype.fatal = null;
VFileMessage.prototype.column = null;
VFileMessage.prototype.line = null;
VFileMessage.prototype.source = null;
VFileMessage.prototype.ruleId = null;
VFileMessage.prototype.position = null;

// ../../node_modules/.pnpm/vfile@5.3.7/node_modules/vfile/lib/minpath.js
var import_path2 = __toESM(require("path"), 1);

// ../../node_modules/.pnpm/vfile@5.3.7/node_modules/vfile/lib/minproc.js
var import_process = __toESM(require("process"), 1);

// ../../node_modules/.pnpm/vfile@5.3.7/node_modules/vfile/lib/minurl.js
var import_url = require("url");

// ../../node_modules/.pnpm/vfile@5.3.7/node_modules/vfile/lib/minurl.shared.js
function isUrl(fileUrlOrPath) {
  return fileUrlOrPath !== null && typeof fileUrlOrPath === "object" && // @ts-expect-error: indexable.
  fileUrlOrPath.href && // @ts-expect-error: indexable.
  fileUrlOrPath.origin;
}

// ../../node_modules/.pnpm/vfile@5.3.7/node_modules/vfile/lib/index.js
var order = ["history", "path", "basename", "stem", "extname", "dirname"];
var VFile = class {
  /**
   * Create a new virtual file.
   *
   * `options` is treated as:
   *
   * *   `string` or `Buffer` — `{value: options}`
   * *   `URL` — `{path: options}`
   * *   `VFile` — shallow copies its data over to the new file
   * *   `object` — all fields are shallow copied over to the new file
   *
   * Path related fields are set in the following order (least specific to
   * most specific): `history`, `path`, `basename`, `stem`, `extname`,
   * `dirname`.
   *
   * You cannot set `dirname` or `extname` without setting either `history`,
   * `path`, `basename`, or `stem` too.
   *
   * @param {Compatible | null | undefined} [value]
   *   File value.
   * @returns
   *   New instance.
   */
  constructor(value) {
    let options;
    if (!value) {
      options = {};
    } else if (typeof value === "string" || buffer(value)) {
      options = { value };
    } else if (isUrl(value)) {
      options = { path: value };
    } else {
      options = value;
    }
    this.data = {};
    this.messages = [];
    this.history = [];
    this.cwd = import_process.default.cwd();
    this.value;
    this.stored;
    this.result;
    this.map;
    let index2 = -1;
    while (++index2 < order.length) {
      const prop2 = order[index2];
      if (prop2 in options && options[prop2] !== void 0 && options[prop2] !== null) {
        this[prop2] = prop2 === "history" ? [...options[prop2]] : options[prop2];
      }
    }
    let prop;
    for (prop in options) {
      if (!order.includes(prop)) {
        this[prop] = options[prop];
      }
    }
  }
  /**
   * Get the full path (example: `'~/index.min.js'`).
   *
   * @returns {string}
   */
  get path() {
    return this.history[this.history.length - 1];
  }
  /**
   * Set the full path (example: `'~/index.min.js'`).
   *
   * Cannot be nullified.
   * You can set a file URL (a `URL` object with a `file:` protocol) which will
   * be turned into a path with `url.fileURLToPath`.
   *
   * @param {string | URL} path
   */
  set path(path) {
    if (isUrl(path)) {
      path = (0, import_url.fileURLToPath)(path);
    }
    assertNonEmpty(path, "path");
    if (this.path !== path) {
      this.history.push(path);
    }
  }
  /**
   * Get the parent path (example: `'~'`).
   */
  get dirname() {
    return typeof this.path === "string" ? import_path2.default.dirname(this.path) : void 0;
  }
  /**
   * Set the parent path (example: `'~'`).
   *
   * Cannot be set if there’s no `path` yet.
   */
  set dirname(dirname) {
    assertPath(this.basename, "dirname");
    this.path = import_path2.default.join(dirname || "", this.basename);
  }
  /**
   * Get the basename (including extname) (example: `'index.min.js'`).
   */
  get basename() {
    return typeof this.path === "string" ? import_path2.default.basename(this.path) : void 0;
  }
  /**
   * Set basename (including extname) (`'index.min.js'`).
   *
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be nullified (use `file.path = file.dirname` instead).
   */
  set basename(basename) {
    assertNonEmpty(basename, "basename");
    assertPart(basename, "basename");
    this.path = import_path2.default.join(this.dirname || "", basename);
  }
  /**
   * Get the extname (including dot) (example: `'.js'`).
   */
  get extname() {
    return typeof this.path === "string" ? import_path2.default.extname(this.path) : void 0;
  }
  /**
   * Set the extname (including dot) (example: `'.js'`).
   *
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be set if there’s no `path` yet.
   */
  set extname(extname) {
    assertPart(extname, "extname");
    assertPath(this.dirname, "extname");
    if (extname) {
      if (extname.charCodeAt(0) !== 46) {
        throw new Error("`extname` must start with `.`");
      }
      if (extname.includes(".", 1)) {
        throw new Error("`extname` cannot contain multiple dots");
      }
    }
    this.path = import_path2.default.join(this.dirname, this.stem + (extname || ""));
  }
  /**
   * Get the stem (basename w/o extname) (example: `'index.min'`).
   */
  get stem() {
    return typeof this.path === "string" ? import_path2.default.basename(this.path, this.extname) : void 0;
  }
  /**
   * Set the stem (basename w/o extname) (example: `'index.min'`).
   *
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be nullified (use `file.path = file.dirname` instead).
   */
  set stem(stem) {
    assertNonEmpty(stem, "stem");
    assertPart(stem, "stem");
    this.path = import_path2.default.join(this.dirname || "", stem + (this.extname || ""));
  }
  /**
   * Serialize the file.
   *
   * @param {BufferEncoding | null | undefined} [encoding='utf8']
   *   Character encoding to understand `value` as when it’s a `Buffer`
   *   (default: `'utf8'`).
   * @returns {string}
   *   Serialized file.
   */
  toString(encoding) {
    return (this.value || "").toString(encoding || void 0);
  }
  /**
   * Create a warning message associated with the file.
   *
   * Its `fatal` is set to `false` and `file` is set to the current file path.
   * Its added to `file.messages`.
   *
   * @param {string | Error | VFileMessage} reason
   *   Reason for message, uses the stack and message of the error if given.
   * @param {Node | NodeLike | Position | Point | null | undefined} [place]
   *   Place in file where the message occurred.
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns {VFileMessage}
   *   Message.
   */
  message(reason, place, origin) {
    const message = new VFileMessage(reason, place, origin);
    if (this.path) {
      message.name = this.path + ":" + message.name;
      message.file = this.path;
    }
    message.fatal = false;
    this.messages.push(message);
    return message;
  }
  /**
   * Create an info message associated with the file.
   *
   * Its `fatal` is set to `null` and `file` is set to the current file path.
   * Its added to `file.messages`.
   *
   * @param {string | Error | VFileMessage} reason
   *   Reason for message, uses the stack and message of the error if given.
   * @param {Node | NodeLike | Position | Point | null | undefined} [place]
   *   Place in file where the message occurred.
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns {VFileMessage}
   *   Message.
   */
  info(reason, place, origin) {
    const message = this.message(reason, place, origin);
    message.fatal = null;
    return message;
  }
  /**
   * Create a fatal error associated with the file.
   *
   * Its `fatal` is set to `true` and `file` is set to the current file path.
   * Its added to `file.messages`.
   *
   * > 👉 **Note**: a fatal error means that a file is no longer processable.
   *
   * @param {string | Error | VFileMessage} reason
   *   Reason for message, uses the stack and message of the error if given.
   * @param {Node | NodeLike | Position | Point | null | undefined} [place]
   *   Place in file where the message occurred.
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns {never}
   *   Message.
   * @throws {VFileMessage}
   *   Message.
   */
  fail(reason, place, origin) {
    const message = this.message(reason, place, origin);
    message.fatal = true;
    throw message;
  }
};
function assertPart(part, name) {
  if (part && part.includes(import_path2.default.sep)) {
    throw new Error(
      "`" + name + "` cannot be a path: did not expect `" + import_path2.default.sep + "`"
    );
  }
}
function assertNonEmpty(part, name) {
  if (!part) {
    throw new Error("`" + name + "` cannot be empty");
  }
}
function assertPath(path, name) {
  if (!path) {
    throw new Error("Setting `" + name + "` requires `path` to be set too");
  }
}
function buffer(value) {
  return (0, import_is_buffer.default)(value);
}

// src/index.ts
function viteMdx(mdxOptions) {
  return createPlugin(mdxOptions || {});
}
viteMdx.withImports = (namedImports) => function mdx(mdxOptions) {
  return createPlugin(mdxOptions || {}, namedImports);
};
function createPlugin(mdxOptions, namedImports) {
  let getMdxOptions;
  let globalMdxOptions = mdxOptions;
  if (typeof mdxOptions === "function") {
    getMdxOptions = mdxOptions;
    globalMdxOptions = {};
  }
  globalMdxOptions.remarkPlugins ??= [];
  globalMdxOptions.rehypePlugins ??= [];
  let reactRefresh;
  let transformMdx;
  const mdxPlugin = {
    name: "vite-plugin-mdx",
    // I can't think of any reason why a plugin would need to run before mdx; let's make sure `vite-plugin-mdx` runs first.
    enforce: "pre",
    mdxOptions: globalMdxOptions,
    configResolved({ root, plugins }) {
      const reactRefreshPlugins = plugins.filter(
        (p) => p.name === "react-refresh" || p.name === "vite:react-babel" || p.name === "vite:react-refresh" || p.name === "vite:react-jsx"
      );
      reactRefresh = reactRefreshPlugins.find((p) => p.transform);
      transformMdx = createTransformer(root, namedImports);
    },
    async transform(code, id, ssr) {
      const [path, query] = id.split("?");
      if (/\.mdx?$/.test(path)) {
        if (!transformMdx)
          throw new Error(
            "vite-plugin-mdx: configResolved hook should be called before calling transform hook"
          );
        const mdxOptions2 = mergeOptions(
          globalMdxOptions,
          getMdxOptions?.(path)
        );
        const input = new VFile({ value: code, path });
        code = await transformMdx(input, { ...mdxOptions2 });
        const refreshResult = await reactRefresh?.transform.call(
          this,
          code,
          path + ".js",
          ssr
        );
        return refreshResult || {
          code,
          map: { mappings: "" }
        };
      }
    }
  };
  return [
    mdxPlugin,
    // Let .mdx files import other .mdx and .md files without an import
    // specifier to automatically inline their content seamlessly.
    viteMdxTransclusion(globalMdxOptions, getMdxOptions)
  ];
}
function mergeOptions(globalOptions, localOptions) {
  return {
    ...globalOptions,
    ...localOptions,
    remarkPlugins: mergeArrays(
      globalOptions.remarkPlugins,
      localOptions?.remarkPlugins
    ),
    rehypePlugins: mergeArrays(
      globalOptions.rehypePlugins,
      localOptions?.rehypePlugins
    )
  };
}
/*! Bundled license information:

is-buffer/index.js:
  (*!
   * Determine if an object is a Buffer
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   *)
*/
