/**
 * @license React
 * react-server-dom-vite-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

if (process.env.NODE_ENV !== "production") {
  (function() {
'use strict';

var CLIENT_REFERENCE = Symbol.for('react.client.reference');
var SERVER_REFERENCE = Symbol.for('react.server.reference');
var PROMISE_PROTOTYPE = Promise.prototype;
var deepProxyHandlers = {
  get: function (target, name, _receiver) {
    switch (name) {
      // These names are read by the Flight runtime if you end up using the exports object.
      case '$$typeof':
        // These names are a little too common. We should probably have a way to
        // have the Flight runtime extract the inner target instead.
        return target.$$typeof;

      case '$$id':
        return target.$$id;

      case '$$async':
        return target.$$async;

      case 'name':
        return target.name;

      case 'displayName':
        return undefined;
      // We need to special case this because createElement reads it if we pass this
      // reference.

      case 'defaultProps':
        return undefined;
      // Avoid this attempting to be serialized.

      case 'toJSON':
        return undefined;

      case Symbol.toPrimitive.toString():
        // $FlowFixMe[prop-missing]
        return Object.prototype[Symbol.toPrimitive];

      case 'Provider':
        throw new Error("Cannot render a Client Context Provider on the Server. " + "Instead, you can export a Client Component wrapper " + "that itself renders a Client Context Provider.");
    } // eslint-disable-next-line react-internal/safe-string-coercion


    var expression = String(target.name) + '.' + String(name);
    throw new Error("Cannot access " + expression + " on the server. " + 'You cannot dot into a client module from a server component. ' + 'You can only pass the imported name through.');
  },
  set: function () {
    throw new Error('Cannot assign to a client module from a server module.');
  }
};
var proxyHandlers = {
  get: function (target, name, _receiver) {
    switch (name) {
      // These names are read by the Flight runtime if you end up using the exports object.
      case '$$typeof':
        return target.$$typeof;

      case '$$id':
        return target.$$id;

      case '$$async':
        return target.$$async;

      case 'name':
        return target.name;
      // We need to special case this because createElement reads it if we pass this
      // reference.

      case 'defaultProps':
        return undefined;
      // Avoid this attempting to be serialized.

      case 'toJSON':
        return undefined;

      case Symbol.toPrimitive.toString():
        // $FlowFixMe[prop-missing]
        return Object.prototype[Symbol.toPrimitive];

      case '__esModule':
        // Something is conditionally checking which export to use. We'll pretend to be
        // an ESM compat module but then we'll check again on the client.
        var moduleId = target.$$id;
        target.default = Object.defineProperties(function () {
          throw new Error("Attempted to call the default export of " + moduleId + " from the server " + "but it's on the client. It's not possible to invoke a client function from " + "the server, it can only be rendered as a Component or passed to props of a " + "Client Component.");
        }, {
          $$typeof: {
            value: CLIENT_REFERENCE
          },
          // This a placeholder value that tells the client to conditionally use the
          // whole object or just the default export.
          $$id: {
            value: target.$$id + '#'
          },
          $$async: {
            value: target.$$async
          }
        });
        return true;

      case 'then':
        if (target.then) {
          // Use a cached value
          return target.then;
        }

        if (!target.$$async) {
          // If this module is expected to return a Promise (such as an AsyncModule) then
          // we should resolve that with a client reference that unwraps the Promise on
          // the client.
          var clientReference = Object.defineProperties({}, {
            $$typeof: {
              value: CLIENT_REFERENCE
            },
            $$id: {
              value: target.$$id
            },
            $$async: {
              value: true
            }
          });
          var proxy = new Proxy(clientReference, proxyHandlers); // Treat this as a resolved Promise for React's use()

          target.status = 'fulfilled';
          target.value = proxy;
          var then = target.then = Object.defineProperties(function then(resolve, _reject) {
            // Expose to React.
            return Promise.resolve( // $FlowFixMe[incompatible-call] found when upgrading Flow
            resolve(proxy));
          }, // If this is not used as a Promise but is treated as a reference to a `.then`
          // export then we should treat it as a reference to that name.
          {
            $$typeof: {
              value: CLIENT_REFERENCE
            },
            $$id: {
              value: target.$$id
            },
            $$async: {
              value: false
            }
          });
          return then;
        } else {
          // Since typeof .then === 'function' is a feature test we'd continue recursing
          // indefinitely if we return a function. Instead, we return an object reference
          // if we check further.
          return undefined;
        }
    }

    var cachedReference = target[name];

    if (!cachedReference) {
      var reference = Object.defineProperties(function () {
        throw new Error( // eslint-disable-next-line react-internal/safe-string-coercion
        "Attempted to call " + String(name) + "() from the server but " + String(name) + " is on the client. " + "It's not possible to invoke a client function from the server, it can " + "only be rendered as a Component or passed to props of a Client Component.");
      }, {
        $$typeof: {
          value: CLIENT_REFERENCE
        },
        $$id: {
          value: target.$$id + '#' + name
        },
        $$async: {
          value: target.$$async
        }
      });
      cachedReference = target[name] = new Proxy(reference, deepProxyHandlers);
    }

    return cachedReference;
  },
  getPrototypeOf: function (_target) {
    // Pretend to be a Promise in case anyone asks.
    return PROMISE_PROTOTYPE;
  },
  set: function () {
    throw new Error('Cannot assign to a client module from a server module.');
  }
};
function createClientReference(fn, moduleId, name) {
  var clientReference = Object.defineProperties({}, {
    $$typeof: {
      value: CLIENT_REFERENCE
    },
    // Represents the whole Module object instead of a particular import.
    $$id: {
      value: moduleId + "#" + name
    },
    $$async: {
      value: false
    }
  });
  return new Proxy(clientReference, proxyHandlers);
}
function createServerReference(fn, moduleId, name) {
  var serverReference = Object.defineProperties(fn, {
    $$typeof: {
      value: SERVER_REFERENCE
    },
    // Represents the whole Module object instead of a particular import.
    $$id: {
      value: moduleId + "#" + name
    },
    $$bound: {
      value: null
    }
  });
  return serverReference;
}
var modulePromiseCache = new Map();
function createModuleLoader(bundler) {
  {
    if (typeof window === 'undefined') {
      return {
        require: undefined,
        import: function (id) {
          var modulePromise = bundler.ssrLoadModule(id);
          modulePromise.status = 'pending';
          modulePromise.then(function (value) {
            var fulfilledThenable = modulePromise;
            fulfilledThenable.status = 'fulfilled';
            fulfilledThenable.value = value;
          }, function (reason) {
            var rejectedThenable = modulePromise;
            rejectedThenable.status = 'rejected';
            rejectedThenable.reason = reason;
          });
          modulePromiseCache.set(id, modulePromise);
          return modulePromise;
        },
        cached: function (id) {
          var cachedModule = bundler.moduleGraph.getModuleById(id);

          if (cachedModule) {
            if (cachedModule.ssrModule) {
              return {
                status: 'fulfilled',
                value: cachedModule.ssrModule
              };
            } else {
              modulePromiseCache.delete(id);
              return null;
            }
          }

          var modulePromise = modulePromiseCache.get(id);
          return modulePromise;
        }
      };
    }

    return {
      require: undefined,
      import: function (id) {
        var modulePromise = bundler.loadModule(id);
        modulePromise.status = 'pending';
        modulePromise.then(function (value) {
          var fulfilledThenable = modulePromise;
          fulfilledThenable.status = 'fulfilled';
          fulfilledThenable.value = value;
        }, function (reason) {
          var rejectedThenable = modulePromise;
          rejectedThenable.status = 'rejected';
          rejectedThenable.reason = reason;
        });
        modulePromiseCache.set(id, modulePromise);
        return modulePromise;
      },
      cached: function (id) {
        var modulePromise = modulePromiseCache.get(id);
        return modulePromise;
      }
    };
  }
}

exports.createClientReference = createClientReference;
exports.createModuleLoader = createModuleLoader;
exports.createServerReference = createServerReference;
  })();
}
