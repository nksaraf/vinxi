import {
  createApp,
  createRouter,
  eventHandler,
  lazyEventHandler,
  toNodeListener,
  fetchWithEvent,
  H3Error,
  isEvent,
  H3Event,
} from "h3";
import { createFetch, Headers } from "ofetch";
import destr from "destr";
import {
  createCall,
  createFetch as createLocalFetch,
} from "unenv/runtime/fetch/index";
import { createHooks, Hookable } from "hookable";

// export interface NitroApp {
//   h3App: H3App;
//   router: Router;
//   hooks: Hookable<NitroRuntimeHooks>;
//   localCall: ReturnType<typeof createCall>;
//   localFetch: ReturnType<typeof createLocalFetch>;
//   captureError: CaptureError;
// }

function createNitroApp(config) {

  const hooks = createHooks();

  const captureError = (error, context = {}) => {
    const promise = hooks
      .callHookParallel("error", error, context)
      .catch((_err) => {
        console.error("Error while capturing another error", _err);
      });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };

  const h3App = createApp({
    debug: destr(process.env.DEBUG),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error as H3Error, event);
    },
    onRequest: async (event) => {
      await hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await hooks
        .callHook("beforeResponse", event, response)
        .catch((error) => {
          captureError(error, { event, tags: ["request", "response"] });
        });
    },
    onAfterResponse: async (event, response) => {
      await hooks
        .callHook("afterResponse", event, response)
        .catch((error) => {
          captureError(error, { event, tags: ["request", "response"] });
        });
    },
  });

  const router = createRouter({
    preemptive: true,
  });

  // Create local fetch callers
  const localCall = createCall(toNodeListener(h3App));
  const _localFetch = createLocalFetch(localCall, globalThis.fetch);
  const localFetch = (...args) => {
    return _localFetch(...args).then((response) =>
      normalizeFetchResponse(response)
    );
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers,
    defaults: { baseURL: config.app.baseURL },
  });

  // @ts-ignore
  globalThis.$fetch = $fetch;

  // Register route rule handlers
  // h3App.use(createRouteRulesHandler({ localFetch }));

  // A generic event handler give nitro access to the requests
  h3App.use(
    eventHandler((event) => {
      // Init nitro context
      event.context.nitro = event.context.nitro || { errors: [] };

      // Support platform context provided by local fetch
      const envContext = (
        event.node.req
      )?.__unenv__;
      
      if (envContext) {
        Object.assign(event.context, envContext);
      }

      // Assign bound fetch to context
      event.fetch = (req, init) =>
        fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = ((req, init) =>
        fetchWithEvent(event, req, init as RequestInit, {
          fetch: $fetch,
        })) as $Fetch<unknown, NitroFetchRequest>;

      // https://github.com/unjs/nitro/issues/1420
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (envContext?.waitUntil) {
          envContext.waitUntil(promise);
        }
      };

      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
    })
  );

  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache,
        });
      }
      router.use(h.route, handler, h.method);
    }
  }

  h3App.use(config.app.baseURL as string, router.handler);

  // Experimental async context support
  if (import.meta._asyncContext) {
    const _handler = h3App.handler;
    h3App.handler = (event) => {
      const ctx: NitroAsyncContext = { event };
      return nitroAsyncContext.callAsync(ctx, () => _handler(event));
    };
  }

  const app: NitroApp = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError,
  };

  for (const plugin of plugins) {
    try {
      plugin(app);
    } catch (err) {
      captureError(err, { tags: ["plugin"] });
      throw err;
    }
  }

  return app;
}

export const nitroApp: NitroApp = createNitroApp();

export const useNitroApp = () => nitroApp;