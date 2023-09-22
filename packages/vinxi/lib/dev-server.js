import getPort from "get-port";
import {
	H3Event,
	createApp,
	defineEventHandler,
	fromNodeMiddleware,
	getRequestURL,
} from "h3";
import { createNitro } from "nitropack";

import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { isMainThread } from "node:worker_threads";

import { AppWorkerClient } from "./app-worker-client.js";
import { createServerResponse } from "./http-stream.js";
import invariant from "./invariant.js";
import { consola } from "./logger.js";
import { createDevServer as createDevNitroServer } from "./nitro-dev.js";
import { config } from "./plugins/config.js";
import { css } from "./plugins/css.js";
import { manifest } from "./plugins/manifest.js";
import { routes } from "./plugins/routes.js";
import { treeShake } from "./plugins/tree-shake.js";
import { virtual } from "./plugins/virtual.js";

/** @typedef {{ port?: number; dev?: boolean; ws?: { port?: number } }} ServeConfigInput */
/** @typedef {{ port: number; dev: boolean; ws: { port: number } }} ServeConfig */

/**
 *
 * @returns {import('./vite-dev.d.ts').Plugin}
 */
function devEntries() {
	return {
		name: "vinxi:dev-entries",
		async config(inlineConfig) {
			return {
				build: {
					// rollupOptions: {
					// input: await getEntries(inlineConfig.router),
					// },
				},
			};
		},
	};
}

/**
 *
 * @param {import('vite').InlineConfig & { router: import("./app.js").RouterSchema; app: import("./app.js").App }} config
 * @returns
 */
async function createViteServer(config) {
	const vite = await import("vite");
	return vite.createServer(config);
}

const targetDevPlugin = {
	browser: (/** @type {import("./app.js").RouterSchema} */ router) => [css()],
	server: (/** @type {import("./app.js").RouterSchema} */ router) => [],
};

/**
 *
 * @param {import('vite').FSWatcher} watcher
 * @param {import("./app.js").RouterSchema} router
 */
function setupWatcher(watcher, router) {
	if (router.internals?.routes) {
		watcher.on("unlink", async (path) => {
			if (router.internals?.routes) {
				await router.internals?.routes.removeRoute(path);
			}
		});

		watcher.on("add", async (path) => {
			if (router.internals?.routes) {
				await router.internals?.routes.addRoute(path);
			}
		});

		watcher.on("change", async (path) => {
			if (router.internals?.routes) {
				await router.internals?.routes.updateRoute(path);
			}
		});
	}
}

const fileSystemWatcher = () => {
	/** @type {import('./vite-dev.d.ts').ViteConfig} */
	let config;

	/** @type {import('./vite-dev.d.ts').Plugin} */
	const plugin = {
		name: "fs-watcher",
		apply: "serve",
		configResolved(resolvedConfig) {
			config = resolvedConfig;
		},
		configureServer(server) {
			if (config.router.internals?.routes) {
				setupWatcher(server.watcher, config.router);
				config.router.internals.routes.addEventListener("reload", () => {
					const { moduleGraph } = server;
					const mods = moduleGraph.getModulesByFile(
						fileURLToPath(new URL("./routes.js", import.meta.url)),
					);
					if (mods) {
						const seen = new Set();
						mods.forEach((mod) => {
							moduleGraph.invalidateModule(mod, seen);
						});
					}
					// debug.hmr("Reload generated pages.");
					server.ws.send({
						type: "full-reload",
					});
				});
			}
		},
	};
	return plugin;
};

const routerModeDevPlugin = {
	spa: (/** @type {import("./app.js").SPARouterSchema} */ router) => [
		routes(),
		devEntries(),
		manifest(),
		config("appType", {
			appType: "spa",
			ssr: {
				noExternal: ["vinxi"],
			},
			optimizeDeps: {
				exclude: ["vinxi"],
			},
			define: {
				"process.env.TARGET": JSON.stringify(process.env.TARGET ?? "node"),
			},
		}),
		treeShake(),
		router.internals.routes ? fileSystemWatcher() : null,
	],
	handler: (/** @type {import("./app.js").HandlerRouterSchema} */ router) => [
		virtual({
			"#vinxi/handler": ({ config }) => {
				invariant(
					config.router.mode === "handler",
					"#vinxi/handler is only supported in handler mode",
				);
				if (config.router.middleware) {
					return `
					import middleware from "${join(config.router.root, config.router.middleware)}";
					import handler from "${join(config.router.root, config.router.handler)}"; 
					import { eventHandler } from "vinxi/runtime/server";
					export default eventHandler({ onRequest: middleware.onRequest, onBeforeResponse: middleware.onBeforeResponse, handler});`;
				}
				return `import handler from "${join(
					config.router.root,
					config.router.handler,
				)}"; export default handler;`;
			},
		}),
		routes(),
		devEntries(),
		manifest(),
		config("appType", {
			appType: "custom",
			ssr: {
				noExternal: ["vinxi"],
			},
			optimizeDeps: {
				disabled: true,
			},
			define: {
				"process.env.TARGET": JSON.stringify(process.env.TARGET ?? "node"),
			},
		}),
		treeShake(),
		router.internals.routes ? fileSystemWatcher() : null,
	],
	build: (/** @type {import("./app.js").BuildRouterSchema} */ router) => [
		virtual(
			{
				"#vinxi/handler": ({ config }) => {
					invariant(
						config.router.mode === "build",
						"#vinxi/handler is only supported in build mode",
					);
					return `import * as mod from "${join(
						config.router.root,
						config.router.handler,
					)}"; export default mod['default']`;
				},
			},
			"handler",
		),
		routes(),
		devEntries(),
		manifest(),
		config("appType", {
			appType: "custom",
			ssr: {
				noExternal: ["vinxi"],
			},
			optimizeDeps: {
				force: true,
				exclude: ["vinxi"],
			},
			define: {
				"process.env.TARGET": JSON.stringify(process.env.TARGET ?? "node"),
			},
		}),
		treeShake(),
		router.internals.routes ? fileSystemWatcher() : null,
	],
};

/**
 *
 * @param {import('./app.js').App} app
 * @param {import('./app.js').RouterSchema} router
 * @param {ServeConfig} serveConfig
 * @returns
 */
async function createViteHandler(app, router, serveConfig) {
	if (router.mode === "handler" && router.worker && isMainThread) {
		if (!router.internals.appWorker) {
			router.internals.appWorker = new AppWorkerClient(
				new URL("./app-worker.js", import.meta.url),
			);
		}
		return defineEventHandler(async (event) => {
			invariant(
				router.internals.appWorker,
				"Router App Worker not initialized",
			);
			await router.internals.appWorker.init(() => {});
			await router.internals.appWorker.handle(event);
		});
	}

	invariant(
		router.mode !== "static",
		"Vite does not need to run for static mode",
	);

	const viteDevServer = await createViteServer({
		configFile: false,
		base: router.base,
		plugins: [
			...((targetDevPlugin[router.target]?.(router) ?? []).filter(Boolean) ??
				[]),
			// @ts-expect-error
			...((routerModeDevPlugin[router.mode]?.(router) ?? []).filter(Boolean) ??
				[]),
			...(((await router.plugins?.(router)) ?? []).filter(Boolean) || []),
		],
		router,
		app,
		server: {
			middlewareMode: true,
			hmr: {
				port: await getPort({ port: serveConfig.ws.port + router.order }),
			},
		},
	});

	router.internals.devServer = viteDevServer;

	if (router.mode === "handler") {
		return defineEventHandler(async (event) => {
			const { default: handler } = await viteDevServer.ssrLoadModule(
				"#vinxi/handler",
			);
			return handler(event);
		});
	} else if (router.mode === "spa") {
		if (router.handler.endsWith(".html")) {
			return defineEventHandler(fromNodeMiddleware(viteDevServer.middlewares));
		} else {
			viteDevServer.middlewares.stack = viteDevServer.middlewares.stack.filter(
				(m) =>
					![
						"viteIndexHtmlMiddleware",
						"viteHtmlFallbackMiddleware",
						"vite404Middleware",
						// @ts-expect-error
					].includes(m.handle.name),
			);
			const viteHandler = fromNodeMiddleware(viteDevServer.middlewares);

			return defineEventHandler(async (event) => {
				const response = await viteHandler(event);
				if (event.handled) {
					return;
				}
				const { default: handler } = await viteDevServer.ssrLoadModule(
					router.handler,
				);

				let html = "";
				const textDecoder = new TextDecoder();
				const smallApp = createApp();
				smallApp.use(handler);
				const text = await new Promise(async (resolve, reject) => {
					await smallApp.handler(
						new H3Event(
							event.node.req,
							createServerResponse("html", {
								onChunk: (chunk) => {
									html += textDecoder.decode(chunk);
								},
								onFinish: () => {
									resolve(html);
								},
							}),
						),
					);
				});

				const transformedHtml = await viteDevServer.transformIndexHtml(
					getRequestURL(event).href,
					text,
				);

				return transformedHtml;
			});
		}
	} else {
		return defineEventHandler(fromNodeMiddleware(viteDevServer.middlewares));
	}
}

/**
 *
 * @param {import('./app.js').App} app
 * @param {import('./app.js').RouterSchema} router
 * @param {ServeConfig} serveConfig
 * @returns
 */
async function createDevRouterHandler(app, router, serveConfig) {
	return {
		route: router.base,
		handler: await createViteHandler(app, router, serveConfig),
	};
}

/**
 *
 * @param {import('./app.js').App} app
 * @param {ServeConfigInput} param1
 * @returns
 */
export async function createDevServer(
	app,
	{ port = 3000, dev = false, ws: { port: wsPort = undefined } = {} },
) {
	const serveConfig = {
		port,
		dev,
		ws: {
			port: wsPort ?? 8989,
		},
	};

	if (dev) {
		const nitro = await createNitro({
			...app.config.server,
			rootDir: "",
			dev: true,
			preset: "nitro-dev",
			publicAssets: [
				...app.config.routers
					.map((router) => {
						if (router.mode === "static") {
							return {
								dir: router.dir,
								baseURL: router.base,
								fallthrough: true,
							};
						}
					})
					.filter(Boolean),
				...(app.config.server.publicAssets ?? []),
			],
			devHandlers: [
				...(await Promise.all(
					app.config.routers
						.filter((router) => router.mode != "static")
						.sort((a, b) => b.base.length - a.base.length)
						.map((router) => createDevRouterHandler(app, router, serveConfig)),
				)),
			],
			handlers: [...(app.config.server.handlers ?? [])],
			plugins: [...(app.config.server.plugins ?? [])],
		});

		nitro.options.appConfigFiles = [];
		nitro.logger = consola.withTag(app.config.name);

		const devApp = createDevNitroServer(nitro);
		await devApp.listen(port, {});

		for (const router of app.config.routers) {
			if (router.internals && router.internals.routes) {
				const routes = await router.internals.routes.getRoutes();
				for (const route of routes) {
					console.log(route.path);
				}
			}
		}

		// @ts-ignore
		globalThis.app = app;

		const plugins = [
			new URL("./app-fetch.js", import.meta.url).href,
			new URL("./app-manifest.js", import.meta.url).href,
		];

		for (const plugin of plugins) {
			const { default: pluginFn } = await import(plugin);
			await pluginFn(devApp);
		}

		return devApp;
	}
}
