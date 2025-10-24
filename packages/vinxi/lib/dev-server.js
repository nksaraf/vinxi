import { resolveCertificate } from "@vinxi/listhen";

import { fileURLToPath } from "node:url";

import { consola, withLogger } from "./logger.js";
import { join, normalize } from "./path.js";
import { resolve } from "./resolve.js";

export * from "./service-dev-plugins.js";

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
 * @param {import('vite').InlineConfig & { service: import("./service-mode.js").Service<any>; app: import("./app.js").App }} config
 * @returns
 */
export async function createViteDevServer(config) {
	const vite = await import("vite");
	return vite.createServer(config);
}

/**
 *
 * @param {import('./app.js').App} app
 * @param {import('./service-mode.js').Service<{ plugins?: any }>} service
 * @param {DevConfig} serveConfig
 * @returns {Promise<import("vite").ViteDevServer>}
 */
export async function createViteHandler(service, app, serveConfig) {
	const vite = await import("vite");
	const { getRandomPort } = await import("get-port-please");
	const port = service.server?.hmr?.port ?? (await getRandomPort());
	const plugins = [
		// ...(serveConfig.devtools ? [inspect()] : []),
		...((
			(await service.internals.type.dev.plugins?.(service, app)) ?? []
		).filter(Boolean) || []),
		...(((await service.plugins?.(service)) ?? []).filter(Boolean) || []),
	].filter(Boolean);

	let base = join(app.config.server.baseURL ?? "/", service.base);

	const viteDevServer = await createViteDevServer({
		configFile: false,
		root: service.root,
		base,
		plugins,
		optimizeDeps: {
			force: serveConfig.force,
		},
		dev: serveConfig,
		mode: app.config.mode,
		router: service,
		service: service,
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
				...service.server?.hmr,
				port,
			},
			https: serveConfig.https,
		},
	});

	service.internals.devServer = viteDevServer;

	return viteDevServer;
}

/**
 *
 * @param {import('./app.js').App} app
 * @param {DevConfigInput} param1
 * @returns {Promise<{ listen: () => Promise<import('@vinxi/listhen').Listener>; close: () => Promise<void> }>}
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

	const { createNitro, writeTypes } = await import("nitropack");

	const nitro = await createNitro({
		compatibilityDate: "2024-12-01",
		rootDir: "",
		...app.config.server,
		dev: true,
		preset: "nitro-dev",
		publicAssets: [
			...app.config.services
				.map((service) => {
					return service.internals.type.dev.publicAssets?.(service, app);
				})
				.filter(
					/**
					 * @param {*} asset
					 * @returns {asset is import("./service-mode.js").PublicAsset[]}
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
					app.config.services
						.sort((a, b) => b.base.length - a.base.length)
						.map((service) =>
							service.internals.type.dev.handler?.(service, app, serveConfig),
						),
				)
			)
				.filter(
					/**
					 * @param {*} asset
					 * @returns {asset is import("./service-modes.js").DevHandler[]}
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
				app.config.services
					.filter((service) => service.internals.devServer)
					.map((service) => service.internals.devServer?.close()),
			);
			await app.hooks.callHook("app:dev:server:closed", { app, devApp });
		},
	};
}
