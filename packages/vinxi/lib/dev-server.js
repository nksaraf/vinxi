import { resolveCertificate } from "@vinxi/listhen";

import { fileURLToPath } from "node:url";

import { consola, withLogger } from "./logger.js";
import { join, normalize } from "./path.js";
import { resolve } from "./resolve.js";

export * from "./router-dev-plugins.js";

/** @typedef {{ force?: boolean; devtools?: boolean; port?: number; ws?: { port?: number }; https?: import('@vinxi/listhen').HTTPSOptions | boolean; }} DevConfigInput */
/** @typedef {{ force: boolean; port: number; devtools: boolean; ws: { port: number }; https?: import('@vinxi/listhen').Certificate; }} DevConfig */

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
export async function createViteDevServer(config) {
	const vite = await import("vite");
	return vite.createServer(config);
}

/**
 *
 * @param {import('./app.js').App} app
 * @param {import('./router-mode.d.ts').Router<{ plugins?: any }>} router
 * @param {DevConfig} serveConfig
 * @returns {Promise<import("vite").ViteDevServer>}
 */
export async function createViteHandler(router, app, serveConfig) {
	const vite = await import("vite");
	const { getRandomPort } = await import("get-port-please");
	const port = await getRandomPort();
	const plugins = [
		// ...(serveConfig.devtools ? [inspect()] : []),
		...(((await router.internals.type.dev.plugins?.(router, app)) ?? []).filter(
			Boolean,
		) || []),
		...(((await router.plugins?.(router)) ?? []).filter(Boolean) || []),
	].filter(Boolean);

	let base = join(app.config.server.baseURL ?? "/", router.base);

	const viteDevServer = await createViteDevServer({
		configFile: false,
		root: router.root,
		base,
		plugins,
		optimizeDeps: {
			force: serveConfig.force,
		},
		dev: serveConfig,
		mode: app.config.mode,
		router,
		app,
		server: {
			fs: {
				allow: [
					normalize(fileURLToPath(new URL("../", import.meta.url))),
					vite.searchForWorkspaceRoot(process.cwd()),
				],
			},
			middlewareMode: true,
			hmr: {
				port,
			},
			https: serveConfig.https,
		},
	});

	router.internals.devServer = viteDevServer;

	return viteDevServer;
}

/**
 *
 * @param {import('./app.js').App} app
 * @param {DevConfigInput} param1
 * @returns
 */
export async function createDevServer(
	app,
	{
		force = false,
		port = 3000,
		devtools = false,
		ws: { port: wsPort = undefined } = {},
	},
) {
	const https = app.config.server.https;
	const serveConfig = {
		port,
		force,
		devtools,
		ws: {
			port: wsPort,
		},
		https: https
			? await resolveCertificate(typeof https === "object" ? https : {})
			: undefined,
	};

	await app.hooks.callHook("app:dev:start", { app, serveConfig });

	// if (devtools) {
	// 	const { devtoolsClient, devtoolsRpc } = await import("@vinxi/devtools");
	// 	app.addRouter(devtoolsClient());
	// 	app.addRouter(devtoolsRpc());
	// }
	const { createNitro, writeTypes } = await import("nitropack");

	const nitro = await createNitro({
		compatibilityDate: "2024-12-01",
		rootDir: "",
		...app.config.server,
		dev: true,
		preset: "nitro-dev",
		publicAssets: [
			...app.config.routers
				.map((router) => {
					return router.internals.type.dev.publicAssets?.(router, app);
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
		buildDir: ".vinxi",
		imports: false,
		devHandlers: [
			...(
				await Promise.all(
					app.config.routers
						.sort((a, b) => b.base.length - a.base.length)
						.map((router) =>
							router.internals.type.dev.handler?.(router, app, serveConfig),
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
			...(app.config.server.devHandlers ?? []),
		],
		// handlers: [...(app.config.server.handlers ?? [])],
		plugins: [...(app.config.server.plugins ?? [])],
	});

	// We do this so that nitro doesn't try to load app.config.ts files since those are
	// special to vinxi as the app definition files.
	nitro.options.appConfigFiles = [];
	nitro.logger = consola.withTag(app.config.name);

	await app.hooks.callHook("app:dev:nitro:config", { app, nitro });

	// During development, we use our own nitro dev server instead of the one provided by nitro.
	// it's very similar to the one provided by nitro, but it has different defaults. Most importantly, it
	// doesn't run the server in a worker.
	const { createDevServer: createNitroDevServer } = await import(
		"./nitro-dev.js"
	);

	const devApp = await createNitroDevServer(nitro);

	await app.hooks.callHook("app:dev:server:created", { app, devApp });

	// for (const router of app.config.routers) {
	// 	if (router.internals && router.internals.routes) {
	// 		const routes = await router.internals.routes.getRoutes();
	// 		for (const route of routes) {
	// 			withLogger({ router }, () => console.log(route.path));
	// 		}
	// 	}
	// }

	// Running plugins manually
	const devViteServer = await import("vite").then(({ createServer }) =>
		createServer({}),
	);

	const plugins = [
		fileURLToPath(new URL("./app-fetch.js", import.meta.url)),
		fileURLToPath(new URL("./app-manifest.js", import.meta.url)),
		...(app.config.server.plugins ?? []),
	];

	for (const plugin of plugins) {
		const { default: pluginFn } = await devViteServer.ssrLoadModule(plugin);
		try {
			await pluginFn(devApp);
		} catch (error) {
			console.error(`Error running plugin ${plugin}`);
			console.error(error);
		}
	}

	await devViteServer.close();

	return {
		...devApp,
		listen: async () => {
			await app.hooks.callHook("app:dev:server:listener:creating", {
				app,
				devApp,
			});
			const listener = await devApp.listen(port, {
				https: serveConfig.https,
			});
			await app.hooks.callHook("app:dev:server:listener:created", {
				app,
				devApp,
				listener,
			});
			return listener;
		},
		close: async () => {
			await app.hooks.callHook("app:dev:server:closing", { app, devApp });
			await devApp.close();
			await Promise.all(
				app.config.routers
					.filter((router) => router.internals.devServer)
					.map((router) => router.internals.devServer?.close()),
			);
			await app.hooks.callHook("app:dev:server:closed", { app, devApp });
		},
	};
}
