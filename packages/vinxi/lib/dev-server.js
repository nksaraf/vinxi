import getPort from "get-port";
import { H3Event, createApp, defineEventHandler, fromNodeMiddleware } from "h3";
import { createNitro } from "nitropack";

import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { isMainThread } from "node:worker_threads";

import { AppWorkerClient } from "./app-worker-client.js";
import { createServerResponse } from "./http-stream.js";
import { consola } from "./logger.js";
import { createDevServer as createDevNitroServer } from "./nitro-dev.js";
import { config } from "./plugins/config.js";
import { css } from "./plugins/css.js";
import { manifest } from "./plugins/manifest.js";
import { routes } from "./plugins/routes.js";
import { treeShake } from "./plugins/tree-shake.js";
import { virtual } from "./plugins/virtual.js";

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
 * @param {import('vite').InlineConfig & { router: any; app: any }} config
 * @returns
 */
async function createViteServer(config) {
	const vite = await import("vite");
	return vite.createServer(config);
}

const targetDevPlugin = {
	browser: () => [css()],
	node: () => [],
};

function setupWatcher(watcher, router) {
	watcher.on("unlink", async (path) => {
		// path = slash(path);
		// if (!isTarget(path, this.options)) return;
		await router.compiled.removeRoute(path);
	});
	watcher.on("add", async (path) => {
		// path = slash(path);
		// if (!isTarget(path, this.options)) return;
		// const page = this.options.dirs.find((i) =>
		// 	path.startsWith(slash(resolve(this.root, i.dir))),
		// );
		await router.compiled.addRoute(path);
	});

	watcher.on("change", async (path) => {
		// path = slash(path);
		// if (!isTarget(path, this.options)) return;
		// const page = this._pageRouteMap.get(path);
		// if (page) await this.options.resolver.hmr?.changed?.(this, path);
		await router.compiled.updateRoute(path);
	});
}

const fileSystemWatcher = () => {
	let config;
	return {
		name: "fs-watcher",
		apply: "serve",
		configResolved(resolvedConfig) {
			config = resolvedConfig;
		},
		configureServer(server) {
			if (config.router.fileRouter) {
				setupWatcher(server.watcher, config.router);
				config.router.compiled.update = () => {
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
				};
			}
		},
	};
};

const routerModeDevPlugin = {
	spa: (router) => [
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
		router.fileRouter ? fileSystemWatcher() : null,
	],
	handler: (router) => [
		virtual({
			"#vinxi/handler": ({ config }) => {
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
		router.fileRouter ? fileSystemWatcher() : null,
	],
	build: (router) => [
		virtual(
			{
				"#vinxi/handler": ({ config }) => {
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
		router.fileRouter ? fileSystemWatcher() : null,
	],
};

async function createViteHandler(app, router, serveConfig) {
	if (router.worker && isMainThread) {
		if (!router.appWorker) {
			router.appWorker = new AppWorkerClient(
				new URL("./app-worker.js", import.meta.url),
			);
		}
		return defineEventHandler(async (event) => {
			await router.appWorker.init(() => {});
			await router.appWorker.handle(event);
		});
	}

	const viteDevServer = await createViteServer({
		configFile: false,
		base: router.base,
		plugins: [
			...((targetDevPlugin[router.compile.target]?.(router) ?? []).filter(
				Boolean,
			) ?? []),
			...((routerModeDevPlugin[router.mode]?.(router) ?? []).filter(Boolean) ??
				[]),
			...(((await router.compile?.plugins?.(router)) ?? []).filter(Boolean) ||
				[]),
		],
		router,
		app,
		server: {
			middlewareMode: true,
			hmr: {
				port: await getPort({ port: serveConfig.ws.port + router.index }),
			},
		},
	});

	router.devServer = viteDevServer;

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
					event.node.req.url,
					text,
				);

				return transformedHtml;
			});
		}
	} else {
		return defineEventHandler(fromNodeMiddleware(viteDevServer.middlewares));
	}
}

async function createDevRouterHandler(app, router, serveConfig) {
	return {
		route: router.base,
		handler: await createViteHandler(app, router, serveConfig),
	};
}

/**
 *
 * @param {import('./app.js').App} app
 * @param {{ port?: number; dev?: boolean; ws?: { port?: number } }} param1
 * @returns
 */
export async function createDevServer(
	app,
	{ port = 3000, dev = false, ws: { port: wsPort = null } = {} },
) {
	const serveConfig = {
		port,
		dev,
		ws: {
			port: wsPort,
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
					.filter((router) => router.mode === "static")
					.map(
						(/** @type {import("./app.js").StaticRouterSchema} */ router) => ({
							dir: router.dir,
							baseURL: router.base,
							passthrough: true,
						}),
					),
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
			if ("compiled" in router && router.compiled) {
				const routes = await router.compiled.getRoutes();
				for (const route of routes) {
					console.log(route.path);
				}
			}
		}

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
