import getPort from "get-port";
import { createNitro } from "nitropack";

import { consola } from "./logger.js";
import { createDevServer as createDevNitroServer } from "./nitro-dev.js";

export * from "./router-dev-plugins.js";

/** @typedef {{ port?: number; dev?: boolean; ws?: { port?: number } }} ServeConfigInput */
/** @typedef {{ port: number; dev: boolean; ws: { port: number } }} ServeConfig */

/**
 *
 * @returns {import('./vite-dev.d.ts').Plugin}
 */
export function devEntries() {
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
 * @param {import('vite').InlineConfig & { router: import("./router-mode.js").Router<any>; app: import("./app.js").App }} config
 * @returns
 */
export async function createViteServer(config) {
	const vite = await import("vite");
	return vite.createServer(config);
}

/**
 *
 * @param {import('./app.js').App} app
 * @param {import('./router-mode.d.ts').Router<{ plugins?: any }>} router
 * @param {ServeConfig} serveConfig
 * @returns {Promise<import("vite").ViteDevServer>}
 */
export async function createViteHandler(router, app, serveConfig) {
	const viteDevServer = await createViteServer({
		configFile: false,
		base: router.base,
		plugins: [
			...((
				(await router.internals.mode.dev.plugins?.(router, app)) ?? []
			).filter(Boolean) || []),
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

	return viteDevServer;
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
						return router.internals.mode.dev.publicAssets?.(router, app.config);
					})
					.filter(
						/**
						 * @param {*} asset
						 * @returns {asset is import("./router-mode.js").PublicAsset[]}
						 */
						(asset) => Boolean(asset),
					)
					.flat(),
				...(app.config.server.publicAssets ?? []),
			],
			devHandlers: [
				...(
					await Promise.all(
						app.config.routers
							.sort((a, b) => b.base.length - a.base.length)
							.map((router) =>
								router.internals.mode.dev.handler?.(router, app, serveConfig),
							),
					)
				)
					.filter(
						/**
						 * @param {*} asset
						 * @returns {asset is import("./router-mode.js").DevHandler[]}
						 */
						(asset) => Boolean(asset),
					)
					.flat(),
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
