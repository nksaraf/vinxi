import { defineEventHandler, fromNodeMiddleware, toNodeListener } from "h3";
import { createNitro } from "nitropack";
import {
	createCall,
	createFetch,
	createFetch as createLocalFetch,
} from "unenv/runtime/fetch/index";

import { fileURLToPath } from "node:url";
import { isMainThread } from "node:worker_threads";

import { AppWorkerClient } from "./app-worker-client.js";
import { getEntries } from "./build.js";
import { consola } from "./logger.js";
import { createDevManifest } from "./manifest/dev-server-manifest.js";
import { createDevServer as createDevNitroServer } from "./nitro-dev.js";
import { config } from "./plugins/config.js";
import { css } from "./plugins/css.js";
import { manifest } from "./plugins/manifest.js";
import { routes } from "./plugins/routes.js";
import { treeShake } from "./plugins/tree-shake.js";

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
					rollupOptions: {
						input: await getEntries(inlineConfig.router),
					},
				},
			};
		},
	};
}

/**
 *
 * @param {import('vite').UserConfig & { router: any; app: any }} config
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
		await router.fileRouter.removeRoute(path);
	});
	watcher.on("add", async (path) => {
		// path = slash(path);
		// if (!isTarget(path, this.options)) return;
		// const page = this.options.dirs.find((i) =>
		// 	path.startsWith(slash(resolve(this.root, i.dir))),
		// );
		await router.fileRouter.addRoute(path);
	});

	watcher.on("change", async (path) => {
		// path = slash(path);
		// if (!isTarget(path, this.options)) return;
		// const page = this._pageRouteMap.get(path);
		// if (page) await this.options.resolver.hmr?.changed?.(this, path);
		await router.fileRouter.updateRoute(path);
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
				config.router.fileRouter.update = () => {
					const { moduleGraph } = server;
					console.log("file system router", "update");
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
	spa: () => [
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
		}),
		treeShake(),
		// fileSystemWatcher(),
	],

	handler: () => [
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
		}),
		treeShake(),
	],
	build: () => [
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
		}),
		treeShake(),
	],
};

async function createViteHandler(app, router, serveConfig) {
	if (router.worker && isMainThread) {
		const worker = new AppWorkerClient(
			new URL("./app-worker.js", import.meta.url),
		);
		let promise;
		return defineEventHandler(async (event) => {
			promise ??= worker.init(() => {});
			await promise;
			return await fromNodeMiddleware(worker.fetchNode.bind(worker))(event);
		});
	}

	const viteDevServer = await createViteServer({
		base: router.base,
		plugins: [
			...(targetDevPlugin[router.build.target]?.() ?? []),
			...(routerModeDevPlugin[router.mode]?.() ?? []),
			...(router.build?.plugins?.() || []),
		],
		router,
		app,
		server: {
			middlewareMode: true,
			hmr: {
				port: serveConfig.ws.port + router.index,
			},
		},
	});

	router.devServer = viteDevServer;

	if (router.mode === "handler") {
		return defineEventHandler(async (event) => {
			const { default: handler } = await viteDevServer.ssrLoadModule(
				router.handler,
			);
			return handler(event);
		});
	} else if (router.mode === "spa") {
		return defineEventHandler(fromNodeMiddleware(viteDevServer.middlewares));
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

export async function createDevServer(
	app,
	{ port = 3000, dev = false, ws: { port: wsPort = 16000 } = {} },
) {
	const serveConfig = {
		port,
		dev,
		ws: {
			port: wsPort,
		},
	};

	if (dev) {
		const manifest = createDevManifest(app);
		globalThis.MANIFEST = manifest;
		const nitro = await createNitro({
			rootDir: "",
			dev: true,
			preset: "nitro-dev",
			publicAssets: app.config.routers
				.filter((router) => router.mode === "static")
				.map((router) => ({
					dir: router.dir,
					baseURL: router.base,
					passthrough: true,
				})),
			devHandlers: [
				...(await Promise.all(
					app.config.routers
						.filter((router) => router.mode != "static")
						.map((router) => createDevRouterHandler(app,router, serveConfig)),
				)),
			],
		});

		nitro.logger = consola.withTag(app.config.name);

		const devServer = createDevNitroServer(nitro);
		await devServer.listen(port);

		for (const router of app.config.routers) {
			if (router.fileRouter) {
				const routes = await router.fileRouter.getRoutes();
				for (const route of routes) {
					console.log(route.path);
				}
			}
		}

		// Create local fetch callers
		const localCall = createCall(toNodeListener(devServer.app));
		const localFetch = createLocalFetch(localCall, globalThis.fetch);
		const $fetch = createFetch({
			fetch: localFetch,
			// Headers,
		});
		// @ts-ignore
		globalThis.$fetch = $fetch;
		globalThis.$handle = (event) => devServer.app.handler(event);

		return devServer;
	}
}
