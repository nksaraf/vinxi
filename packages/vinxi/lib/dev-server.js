import { defineEventHandler, fromNodeMiddleware } from "h3";
import { createNitro } from "nitropack";

import { createDevManifest } from "./manifest/dev-server-manifest.js";
import { createDevServer as createDevNitroServer } from "./nitro-dev.js";
import { config } from "./plugins/config.js";
import { css } from "./plugins/css.js";
import { manifest } from "./plugins/manifest.js";
import { routes } from "./plugins/routes.js";

export function getEntries(router) {
	return [
		router.handler,
		...(router.fileRouter?.routes.map((r) => r.filePath) ?? []),
	];
}

/**
 *
 * @returns {import('./vite-dev.d.ts').Plugin}
 */
function devEntries() {
	return {
		name: "vinxi:dev-entries",
		config(inlineConfig) {
			return {
				build: {
					rollupOptions: {
						input: getEntries(inlineConfig.router),
					},
				},
			};
		},
	};
}

/**
 *
 * @param {import('vite').UserConfig & { router: any }} config
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

const routerModeDevPlugin = {
	spa: () => [config({ appType: "spa" })],
	handler: () => [config({ appType: "custom" })],
};

async function createViteSSREventHandler(router, serveConfig) {
	const viteDevServer = await createViteServer({
		base: router.base,
		plugins: [
			routes(),
			devEntries(),
			manifest(),
			...(targetDevPlugin[router.build.target]?.() ?? []),
			...(routerModeDevPlugin[router.mode]?.() ?? []),
			...(router.build?.plugins?.() || []),
		],
		router,

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

async function createDevRouterHandler(router, serveConfig) {
	return {
		route: router.base,
		handler: await createViteSSREventHandler(router, serveConfig),
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
						.map((router) => createDevRouterHandler(router, serveConfig)),
				)),
			],
		});
		const devServer = createDevNitroServer(nitro);
		await devServer.listen(port);
	}
}
