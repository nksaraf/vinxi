import { listen } from "@vinxi/listhen";
import { watch } from "chokidar";
import wsAdapter from "crossws/adapters/node";
import {
	createApp,
	eventHandler,
	fromNodeMiddleware,
	isEvent,
	promisifyNodeListener,
	toNodeListener,
} from "h3";
import { createHooks } from "hookable";
import httpProxy from "http-proxy";
import { servePlaceholder } from "serve-placeholder";
import serveStatic from "serve-static";
import { joinURL } from "ufo";
import {
	createCall,
	createFetch,
	createFetch as createLocalFetch,
} from "unenv/runtime/fetch/index";

import errorHandler from "./dev-error.js";
import { createRouteRulesHandler } from "./route-rules.js";

// import { createVFSHandler } from './vfs'
// import defaultErrorHandler from './error'

// function initWorker(filename: string): Promise<NitroWorker> | null {
//   if (!existsSync(filename)) {
//     return null;
//   }
//   return new Promise((resolve, reject) => {
//     const worker = new Worker(filename);
//     worker.once("exit", (code) => {
//       reject(
//         new Error(
//           code ?"[worker] exited with code: " + code : "[worker] exited"
//         )
//       );
//     });
//     worker.once("error", (err) => {
//       err.message = "[worker init] " + err.message;
//       reject(err);
//     });
//     const addressListener = (event) => {
//       if (!event || !event.address) {
//         return;
//       }
//       worker.off("message", addressListener);
//       resolve({
//         worker,
//         address: event.address,
//       } as NitroWorker);
//     };
//     worker.on("message", addressListener);
//   });
// }

// async function killWorker(worker: NitroWorker, nitro: Nitro) {
//   if (!worker) {
//     return;
//   }
//   if (worker.worker) {
//     worker.worker.postMessage({ event: "shutdown" });
//     const gracefulShutdownTimeout =
//       Number.parseInt(process.env.NITRO_SHUTDOWN_TIMEOUT, 10) || 3;
//     await new Promise<void>((resolve) => {
//       const timeout = setTimeout(() => {
//         nitro.logger.warn(
//           `[nitro] [dev] Force closing worker after ${gracefulShutdownTimeout} seconds...`
//         );
//         resolve();
//       }, gracefulShutdownTimeout * 1000);
//       worker.worker.once("message", (message) => {
//         if (message.event === "exit") {
//           clearTimeout(timeout);
//           resolve();
//         }
//       });
//     });
//     worker.worker.removeAllListeners();
//     await worker.worker.terminate();
//     worker.worker = null;
//   }
//   if (worker.address.socketPath && existsSync(worker.address.socketPath)) {
//     await fsp.rm(worker.address.socketPath).catch(() => {});
//   }
// }

/**
 *
 * @param {import("nitropack").Nitro} nitro
 * @returns
 */
export async function createDevServer(nitro) {
	// Worker
	// const workerEntry = resolve(
	// 	nitro.options.output.dir,
	// 	nitro.options.output.serverDir,
	// 	"index.mjs",
	// );

	// Error handler
	// const errorHandler = nitro.options.devErrorHandler || defaultErrorHandler;

	// let lastError: H3Error = null;
	// let reloadPromise: Promise<void> = null;

	// let currentWorker: NitroWorker = null;
	// async function _reload() {
	//   // Kill old worker
	//   const oldWorker = currentWorker;
	//   currentWorker = null;
	//   await killWorker(oldWorker, nitro);
	//   // Create a new worker
	//   currentWorker = await initWorker(workerEntry);
	// }
	// const reload = debounce(() => {
	//   reloadPromise = _reload()
	//     .then(() => {
	//       lastError = null;
	//     })
	//     .catch((error) => {
	//       console.error("[worker reload]", error);
	//       lastError = error;
	//     })
	//     .finally(() => {
	//       reloadPromise = null;
	//     });
	//   return reloadPromise;
	// });
	// nitro.hooks.hook("dev:reload", reload);

	const hooks = createHooks();

	const captureError = (error, context = {}) => {
		const promise = hooks
			.callHookParallel("error", error, context)
			.catch((error_) => {
				console.error("Error while capturing another error", error_);
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

	// App
	const app = createApp({
		debug: Boolean(process.env.DEBUG),
		onError: (error, event) => {
			captureError(error, { event, tags: ["request"] });
			return errorHandler(error, event);
		},
		onRequest: async (event) => {
			await hooks.callHook("request", event).catch((error) => {
				captureError(error, { event, tags: ["request"] });
			});
		},
		onBeforeResponse: async (event, response) => {
			await hooks.callHook("beforeResponse", event, response).catch((error) => {
				captureError(error, { event, tags: ["request", "response"] });
			});
		},
		onAfterResponse: async (event, response) => {
			await hooks.callHook("afterResponse", event, response).catch((error) => {
				captureError(error, { event, tags: ["request", "response"] });
			});
		},
	});

	// Create local fetch callers
	const localCall = createCall(promisifyNodeListener(toNodeListener(app)));
	const localFetch = createLocalFetch(localCall, globalThis.fetch);

	// Debugging endpoint to view vfs
	// app.use("/_vfs", createVFSHandler(nitro));
	//
	app.use(
		createRouteRulesHandler({
			localFetch,
			routeRules: nitro.options.routeRules,
		}),
	);

	// Serve asset dirs
	for (const asset of nitro.options.publicAssets) {
		const url = joinURL(
			nitro.options.runtimeConfig.app.baseURL,
			asset.baseURL ?? "/",
		);
		app.use(url, fromNodeMiddleware(serveStatic(asset.dir)));
		if (!asset.fallthrough) {
			app.use(url, fromNodeMiddleware(servePlaceholder()));
		}
	}

	// User defined dev proxy
	for (const route of Object.keys(nitro.options.devProxy).sort().reverse()) {
		let opts = nitro.options.devProxy[route];
		if (typeof opts === "string") {
			opts = { target: opts };
		}
		const proxy = createProxy(opts);
		app.use(
			route,
			eventHandler(async (event) => {
				await proxy.handle(event);
			}),
		);
	}

	const wsApp = createApp();

	// Dev-only handlers
	for (const handler of nitro.options.devHandlers) {
		app.use(
			joinURL(nitro.options.runtimeConfig.app.baseURL, handler.route ?? "/"),
			handler.handler,
		);
		wsApp.use(
			joinURL(nitro.options.runtimeConfig.app.baseURL, handler.route ?? "/"),
			handler.handler,
		);
	}

	// Main worker proxy
	// const proxy = createProxy();
	// proxy.proxy.on("proxyReq", (proxyReq, req) => {
	// 	const proxyRequestHeaders = proxyReq.getHeaders();
	// 	if (req.socket.remoteAddress && !proxyRequestHeaders["x-forwarded-for"]) {
	// 		proxyReq.setHeader("X-Forwarded-For", req.socket.remoteAddress);
	// 	}
	// 	if (req.socket.remotePort && !proxyRequestHeaders["x-forwarded-port"]) {
	// 		proxyReq.setHeader("X-Forwarded-Port", req.socket.remotePort);
	// 	}
	// 	if (req.socket.remoteFamily && !proxyRequestHeaders["x-forwarded-proto"]) {
	// 		proxyReq.setHeader("X-Forwarded-Proto", req.socket.remoteFamily);
	// 	}
	// });

	// const getWorkerAddress = () => {
	// 	const address = currentWorker?.address;
	// 	if (!address) {
	// 		return;
	// 	}
	// 	if (address.socketPath) {
	// 		try {
	// 			accessSync(address.socketPath);
	// 		} catch (err) {
	// 			if (!lastError) {
	// 				lastError = err;
	// 			}
	// 			return;
	// 		}
	// 	}
	// 	return address;
	// };

	import.meta._asyncContext = nitro.options.experimental?.asyncContext;

	if (import.meta._asyncContext) {
		const { getContext } = await import("unctx");
		const { AsyncLocalStorage } = await import("node:async_hooks");
		const nitroAsyncContext = getContext("nitro-app", {
			asyncContext: true,
			AsyncLocalStorage,
		});
		const _handler = app.handler;
		app.handler = (event) => {
			const ctx = { event };
			return nitroAsyncContext.callAsync(ctx, () => _handler(event));
		};
	}

	// app.use(
	// 	eventHandler(async (event) => {
	// 		await reloadPromise;
	// 		const address = getWorkerAddress();
	// 		if (!address) {
	// 			return errorHandler(lastError, event);
	// 		}
	// 		await proxy.handle(event, { target: address }).catch((err) => {
	// 			lastError = err;
	// 			throw err;
	// 		});
	// 	}),
	// );

	const adapter = wsAdapter(wsApp.websocket);
	// Listen
	/** @type {import("@vinxi/listhen").Listener[]}  */
	let listeners = [];
	/**
	 *
	 * @param {number} port
	 * @param {Partial<import("@vinxi/listhen").ListenOptions>} opts
	 * @returns
	 */
	const _listen = async (port, opts) => {
		const listener = await listen(toNodeListener(app), {
			port,
			ws: true,
			...opts,
		});
		listeners.push(listener);
		import.meta._websocket = nitro.options.experimental?.websocket;
		if (import.meta._websocket) {
			console.log("enabling websockets");
			listener.server.on("upgrade", (req, sock, head) => {
				req.url = req.originalUrl;
				adapter.handleUpgrade(req, sock, head);
			});
		}
		return listener;
	};

	// Optional watcher
	// let watcher = null;
	// if (nitro.options.devServer.watch.length > 0) {
	// 	watcher = watch(nitro.options.devServer.watch, nitro.options.watchOptions);
	// 	watcher.on("add", reload).on("change", reload);
	// }

	// Close handler
	async function close() {
		// if (watcher) {
		// 	await watcher.close();
		// }
		// await killWorker(currentWorker, nitro);
		await Promise.all(listeners.map((l) => l.close()));
		listeners = [];
	}
	nitro.hooks.hook("close", close);

	return {
		// reload,
		listen: _listen,
		h3App: app,
		localCall,
		localFetch,
		close,
		hooks,
		captureError,
		// watcher,
	};
}

function createProxy(defaults = {}) {
	const proxy = httpProxy.createProxy();
	const handle = (event, opts = {}) => {
		return new Promise((resolve, reject) => {
			proxy.web(
				event.node.req,
				event.node.res,
				{ ...defaults, ...opts },
				(error) => {
					if (error.code !== "ECONNRESET") {
						reject(error);
					}
					resolve();
				},
			);
		});
	};
	return {
		proxy,
		handle,
	};
}
