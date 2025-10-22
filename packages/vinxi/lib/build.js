import { mkdir, rm, rmdir } from "fs/promises";
import { createRequire } from "module";
import { build, copyPublicAssets, createNitro, prerender } from "nitropack";
import { isRelative } from "ufo";

import {
	existsSync,
	readFileSync,
	readdirSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

import { H3Event, createApp } from "../runtime/server.js";
import { chunksServerVirtualModule } from "./chunks.js";
import { createIncomingMessage, createServerResponse } from "./http-stream.js";
import invariant from "./invariant.js";
import { c, consola, log, withLogger } from "./logger.js";
import { viteManifestPath } from "./manifest-path.js";
import { createSPAManifest } from "./manifest/spa-manifest.js";
import {
	handlerModule,
	isAbsolute,
	join,
	relative,
	virtualId,
} from "./path.js";
import { config } from "./plugins/config.js";
import { manifest } from "./plugins/manifest.js";
import { routes } from "./plugins/routes.js";
import { treeShake } from "./plugins/tree-shake.js";
import { virtual } from "./plugins/virtual.js";

/** @typedef {{
 * 		mode?: string;
 * 		preset?: string;
 * 		server?: boolean;
 * 		router?: string;
 * 		nitro?: boolean;
 * 		cache?: boolean;
 * 		service?: string
 * }} BuildConfig */

const require = createRequire(import.meta.url);

/**
 * @param {object} options
 * @param {import('./app.js').App} options.app
 * @param {BuildConfig} options.buildConfig
 * @param {string} options.configFile
 */
async function buildServer({ app, buildConfig }) {
	// assume that all services have been built already
	console.log("\n");
	console.log(`⚙  ${c.green("Building your app...")}`);
	await app.hooks.callHook("app:build:start", { app, buildConfig });

	// skip any services that are not being built
	app.config.services = app.config.services.filter(
		(service) => service.build !== false,
	);

	const nitro = await createNitro({
		...app.config.server,
		dev: false,
		compatibilityDate: "2024-12-01",
		rootDir: "",
		logLevel: +(process.env.NITRO_LOG_LEVEL || 1),
		preset:
			buildConfig.preset ??
			process.env.TARGET ??
			process.env.PRESET ??
			process.env.SERVER_PRESET ??
			process.env.SERVER_TARGET ??
			process.env.NITRO_PRESET ??
			process.env.NITRO_TARGET ??
			app.config.server.preset ??
			(process.versions.bun !== undefined ? "bun" : undefined),
		alias: {
			/**
			 * These
			 */
			"node-fetch-native/polyfill": require.resolve(
				"node-fetch-native/polyfill",
			),
			...(app.config.server.alias ?? {}),
			// "unstorage/drivers/fs-lite": require.resolve("unstorage/drivers/fs-lite"),
			// "unstorage/drivers/fs": require.resolve("unstorage/drivers/fs"),
			// defu: require.resolve("defu"),
			// pathe: require.resolve("pathe"),
			// unstorage: require.resolve("unstorage"),
		},
		// minify: process.env.MINIFY !== "false" ?? true,
		plugins: [
			"$vinxi/prod-app",
			fileURLToPath(new URL("./app-fetch.js", import.meta.url)),
			fileURLToPath(new URL("./app-manifest.js", import.meta.url)),
			"$vinxi/chunks",
			...(app.config.server.plugins ?? [])
				.filter(Boolean)
				.map(
					(plugin) =>
						plugin &&
						(isRelative(plugin)
							? plugin
							: isAbsolute(plugin)
							? plugin
							: require.resolve(plugin, { paths: [app.config.root] })),
				),
		],
		buildDir: ".vinxi",
		handlers: [
			...[...app.config.services]
				.sort((a, b) => b.base.length - a.base.length)
				.map((service) => {
					if (service.type === "http") {
						invariant(service.handler, "Missing service.handler");
						const bundlerManifest = JSON.parse(
							readFileSync(viteManifestPath(service), "utf-8"),
						);

						const virtualHandlerId = virtualId(handlerModule(service));

						const handler = join(
							service.outDir,
							service.base,
							bundlerManifest[
								virtualHandlerId in bundlerManifest
									? virtualHandlerId
									: relative(app.config.root, service.handler)
							].file,
						);

						return [
							{
								route: service.base.length === 1 ? "/" : `${service.base}`,
								handler,
								middleware: true,
							},
						];
					} else if (service.type === "spa") {
						return [
							{
								route: service.base.length === 1 ? "/" : `${service.base}`,
								handler: `$vinxi/spa/${service.name}`,
								middleware: true,
							},
						];
					}
				})
				.flat(),
			...(app.config.server.handlers ?? []),
		].filter(Boolean),
		publicAssets: [
			...app.config.services
				.map((service) => {
					if (service.type === "static") {
						return {
							// @ts-expect-error
							dir: service.dir,
							baseURL: service.base,
							fallthrough: true,
						};
					} else if (service.type === "http") {
						return {
							dir: join(service.outDir, service.base, "assets"),
							baseURL: join(service.base, "assets"),
							fallthrough: true,
						};
					} else if (service.type === "spa" || service.type === "client") {
						return {
							dir: join(service.outDir, service.base),
							baseURL: service.base,
							fallthrough: true,
						};
					}
				})
				.filter(Boolean),
			...(app.config.server.publicAssets ?? []),
		],
		scanDirs: [],
		appConfigFiles: [],
		imports: false,
		virtual: {
			"$vinxi/prod-app": () => {
				const config = {
					...app.config,
					services: app.config.services.map((service) => {
						if (
							service.type === "spa" &&
							service.handler &&
							!service.handler.endsWith(".html")
						) {
							return {
								...service,
								handler: "index.html",
							};
						}

						return service;
					}),
				};
				return `
	const appConfig = ${JSON.stringify(config, (k, v) => {
		if (["routes", "internals", "plugins"].includes(k)) {
			return undefined;
		}

		return v;
	})}
				const buildManifest = ${JSON.stringify(
					Object.fromEntries(
						// @ts-ignore
						app.config.services
							.map((service) => {
								if (service.type !== "static") {
									const bundlerManifest = JSON.parse(
										readFileSync(viteManifestPath(service), "utf-8"),
									);
									return [service.name, bundlerManifest];
								}
							})
							.filter(Boolean),
					),
				)}

				const routeManifest = ${JSON.stringify(
					Object.fromEntries(
						// @ts-ignore
						app.config.services
							.map((service) => {
								if (service.type !== "static" && service.internals.routes) {
									return [
										service.name,
										service.internals.routes?.getRoutes?.(),
									];
								}
							})
							.filter(Boolean),
					),
				)}

	function createProdApp(appConfig) {
	  return {
		config: { ...appConfig, buildManifest, routeManifest },
		getRouter(name) {
		  return appConfig.services.find(services => service.name === name)
		},
		getService(name) {
		  return appConfig.services.find(service => service.name === name)
		}
	  }
	}

	export default function plugin(app) {
	  const prodApp = createProdApp(appConfig)
	  globalThis.app = prodApp
	}
  `;
			},
			...app.config.services
				.filter((service) => service.type === "spa")
				.reduce((virtuals, service) => {
					virtuals[`$vinxi/spa/${service.name}`] = () => {
						const indexHtml = readFileSync(
							join(service.outDir, service.base, "index.html"),
							"utf-8",
						);
						return `
						import { eventHandler } from "vinxi/http"
						const html = ${JSON.stringify(indexHtml)}
						export default eventHandler(event => {
							return html
						})
					`;
					};
					return virtuals;
				}, {}),
			"$vinxi/chunks": () => chunksServerVirtualModule()(app),

			...(Object.fromEntries(
				Object.entries(app.config.server?.virtual ?? {}).map(([k, v]) => [
					k,
					// @ts-ignore
					typeof v === "function" ? () => v(app) : v,
				]),
			) ?? {}),
		},
	});

	console.log("\n");
	console.log(`⚙  ${c.green(`Preparing app for ${nitro.options.preset}...`)}`);

	nitro.options.appConfigFiles = [];
	nitro.logger = consola.withTag(app.config.name);

	await app.hooks.callHook("app:build:nitro:config", { app, nitro });

	if (existsSync(join(nitro.options.output.serverDir))) {
		await rm(join(nitro.options.output.serverDir), { recursive: true });
	}

	if (existsSync(join(nitro.options.output.publicDir))) {
		await rm(join(nitro.options.output.publicDir), { recursive: true });
	}

	await app.hooks.callHook("app:build:nitro:assets:copy:start", { app, nitro });

	await mkdir(join(nitro.options.output.publicDir), { recursive: true });
	await copyPublicAssets(nitro);

	// remove js files from assets for 'http' routers targetting 'server'
	// https://github.com/nksaraf/vinxi/issues/363
	for (const service of app.config.services.filter(
		(r) => r.type === "http" && r.target === "server",
	)) {
		const serviceDir = join(nitro.options.output.publicDir, service.base);
		const assetsDir = join(serviceDir, "assets");
		if (!existsSync(assetsDir)) {
			continue;
		}

		let hasFilesDeleted = false;
		const assetFiles = readdirSync(assetsDir);
		for (const assetName of assetFiles) {
			if (
				assetName.endsWith(".js") ||
				assetName.endsWith(".mjs") ||
				assetName.endsWith(".cjs") ||
				assetName.includes(".js.") ||
				assetName.includes(".cjs.") ||
				assetName.includes(".mjs.")
			) {
				if (!hasFilesDeleted) {
					hasFilesDeleted = true;
				}
				await rm(join(assetsDir, assetName));
			}
		}

		// if the service dir is empty (including its subdirectories), remove it
		// if the subdirectories are empty, they will be removed recursively
		if (hasFilesDeleted) {
			await deleteEmptyDirs(serviceDir);
		}
	}

	await app.hooks.callHook("app:build:nitro:assets:copy:end", { app, nitro });

	await mkdir(join(nitro.options.output.serverDir), { recursive: true });

	await app.hooks.callHook("app:build:nitro:prerender:start", { app, nitro });
	nitro.hooks.hook("prerender:init", (nitro) => {
		nitro.options.appConfigFiles = [];
		nitro.logger = consola.withTag(app.config.name);
	});
	await prerender(nitro);
	await app.hooks.callHook("app:build:nitro:prerender:end", { app, nitro });

	await app.hooks.callHook("app:build:nitro:start", { app, nitro });
	await build(nitro);
	await app.hooks.callHook("app:build:nitro:end", { app, nitro });
	await nitro.close();
	await app.hooks.callHook("app:build:end", { app });
}

/**
 *
 * @param {object} options
 * @param {import('./app.js').App} options.app
 * @param {BuildConfig} options.buildConfig
 * @param {string} options.configFile
 */
export async function createBuild({ app, buildConfig, configFile }) {
	try {
		let { log, debug, c } = await import("../lib/logger.js");
		const { existsSync, promises: fsPromises } = await import("fs");
		const { join } = await import("./path.js");
		const { fileURLToPath } = await import("url");

		debug("build config", buildConfig);

		if (buildConfig.server || buildConfig.nitro) {
			const vinxiBuildLabel = c.dim(c.blue("vinxi server build time"));
			console.time(vinxiBuildLabel);
			try {
				await buildServer({ app, buildConfig, configFile });
			} catch (error) {
				console.error("Error building server:", error);
				throw error;
			} finally {
				console.timeEnd(vinxiBuildLabel);
			}
			return;
		}

		if (buildConfig.service) {
			console.log("\n");

			let service = app.config.services.find(
				(s) => s.name === buildConfig.service,
			);

			if (!service) {
				throw new Error(`Service ${buildConfig.service} not found`);
			}

			console.time(
				`${c.dim(c.blue("vinxi"))} ${c.yellow(service.name)} build time`,
			);

			try {
				if (service.type === "static") {
					log(c.yellow(service.name), `skipping static service`);
					return;
				}

				if (
					service.type === "spa" &&
					service.handler &&
					!service.handler.endsWith(".html")
				) {
					log(c.yellow(service.name), `generating index.html for SPA`);
					await generateIndexHTMLforSPA({
						app,
						service,
						mode: buildConfig.mode ?? "production",
					});

					service = {
						...service,
						handler: "./index.html",
					};
				}

				if (
					service.build !== false &&
					(buildConfig.cache === false || !existsSync(service.outDir))
				) {
					if (existsSync(service.outDir) && buildConfig.cache === false) {
						log(c.yellow(service.name), `cleaning previous build`);
						debug(c.yellow(service.name), `removing ${service.outDir}`);
						await fsPromises.rm(service.outDir, { recursive: true });
					}

					if (buildConfig.cache === false) {
						try {
							await createServiceBuild(
								app,
								service,
								buildConfig.mode ?? "production",
							);
						} catch (error) {
							console.error(`Error building service ${service.name}:`, error);
							process.exit(1);
						}
					} else {
						log(c.yellow(service.name), `skipping build`);
						log(c.yellow(service.name), `using cached build`);
						debug(
							c.yellow(service.name),
							`cached build directory: ${service.outDir}`,
						);
					}
				} else {
				}

				log(c.yellow(service.name), c.green(`built successfully`));
				debug(
					c.yellow(service.name),
					c.green(`target directory: ${service.outDir}`),
				);
				return;
			} catch (error) {
				console.error(`Error building service ${service.name}:`, error);
				throw error;
			} finally {
				console.timeEnd(
					`${c.dim(c.blue("vinxi"))} ${c.yellow(service.name)} build time`,
				);
			}
		}

		const vinxiBuildLabel = c.dim(c.blue("vinxi build time"));
		console.time(vinxiBuildLabel);
		for (const service of app.config.services) {
			if (service.build !== false) {
				if (existsSync(service.outDir) && buildConfig.cache === false) {
					log(`removing ${service.outDir}`);
					await rm(service.outDir, { recursive: true });
				}
			} else {
				log(`skipping ${service.name}`);
			}
		}

		for (const service of app.config.services) {
			if (
				service.type !== "static" &&
				service.build !== false &&
				(buildConfig.cache === false || !existsSync(service.outDir))
			) {
				console.log();
				log(c.yellow(service.name), c.green(`building in worker`));
				try {
					await buildServiceInWorker(
						app,
						service,
						buildConfig.mode,
						configFile,
					);
				} catch (error) {
					console.error(`Error building service ${service.name}:`, error);
					process.exit(1);
				}
			}
		}

		const vinxiServerBuildLabel = c.dim(c.blue("vinxi server build time"));
		console.time(vinxiServerBuildLabel);
		await buildServer({ app, buildConfig, configFile });
		console.timeEnd(vinxiServerBuildLabel);
		console.timeEnd(vinxiBuildLabel);
	} catch (error) {
		console.error("Build failed:", error);
		process.exit(1);
	}
}

/**
 *
 * @param {import("vite").InlineConfig & { router?: any; service?: any; app: any; root: string }} config
 */
async function createViteBuild(config) {
	const cwd = process.cwd();
	process.chdir(config.root);
	const vite = await import("vite");
	const output = await vite.build({ ...config, configFile: false });
	process.chdir(cwd);
	return output;
}

/**
 *
 * @param {import("./app.js").App} app
 * @param {import("./service-mode.js").Service} service
 * @param {string} [mode]
 * @param {string} [configFile]
 */
async function buildServiceInWorker(app, service, mode, configFile) {
	const sh = await import("../runtime/sh.js");
	const { fileURLToPath } = await import("url");
	await sh.default`node ${fileURLToPath(
		new URL("../bin/cli.mjs", import.meta.url).href,
	)} build --vinxi-worker --service=${service.name} ${
		mode ? `--mode=${mode}` : ""
	} ${configFile ? `--config=${configFile}` : ""}`;
}

/**
 *
 * @param {object} options
 * @param {import("./app.js").App} options.app
 * @param {import("./service-mode.js").Service} options.service
 * @param {string} options.mode
 */
async function generateIndexHTMLforSPA({ app, service, mode }) {
	await app.hooks.callHook("app:build:service:html:generate:start", {
		app,
		service,
		// @deprecated
		router: service,
	});

	if (!service.handler) {
		throw new Error(`Service ${service.name} has no handler`);
	}

	await createViteBuild({
		app: app,
		root: service.root,
		mode,
		build: {
			ssr: true,
			ssrManifest: true,
			rollupOptions: {
				input: { handler: service.handler },
			},
			target: "esnext",
			outDir: join(service.outDir + "_entry"),
			emptyOutDir: true,
		},
	});

	const render = await import(
		pathToFileURL(join(service.outDir + "_entry", "handler.js")).href
	);

	const smallApp = createApp();
	smallApp.use(render.default);
	let html = "";
	const textDecoder = new TextDecoder();
	const text = await new Promise(async (resolve, reject) => {
		await smallApp.handler(
			new H3Event(
				createIncomingMessage("/", "GET", {}),
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

	const htmlCode = { code: text };

	await app.hooks.callHook("app:build:service:html:generate:end", {
		app,
		// @deprecated
		router: service,
		service,
		html: htmlCode,
	});

	writeFileSync(join(service.root, "index.html"), htmlCode.code);

	await app.hooks.callHook("app:build:service:html:generate:write", {
		app,
		// @deprecated
		router: service,
		service,
		html: htmlCode,
		path: join(service.root, "index.html"),
	});
}

/**
 *
 * @param {import("./app.js").App} app
 * @param {import("./service-mode.js").Service} service
 * @param {string} mode
 */
async function createServiceBuild(app, service, mode) {
	log(c.yellow(service.name), c.green(`build start`));
	console.log("");
	await app.hooks.callHook("app:build:service:start", {
		app,
		// @deprecated
		router: service,
		service,
	});
	let buildService = service;
	if (
		service.type === "spa" &&
		service.handler &&
		!service.handler.endsWith(".html")
	) {
		await generateIndexHTMLforSPA({ app, service, mode });
		buildService = {
			...service,
			handler: "./index.html",
		};
	}

	log(`${c.yellow(service.name)} building in ${service.type} mode`);

	const viteBuildConfig = {
		// @deprecated
		router: buildService,
		service: buildService,
		app,
		root: service.root,
		plugins: [
			buildTargetPlugin[buildService.target]?.(buildService) ?? [],
			serviceTypePlugins[buildService.internals.type.name]?.(buildService) ??
				[],
			...((await buildService.plugins?.(buildService)) ?? []),
			{
				name: "vinxi:build:service:config",
				async configResolved(config) {
					await app.hooks.callHook("app:build:service:vite:config:resolved", {
						vite: config,
						service: buildService,
						// @deprecated
						router: buildService,
						app,
					});
				},
			},
		],
		mode,
	};

	await app.hooks.callHook("app:build:service:vite:config", {
		vite: viteBuildConfig,
		// @deprecated
		router: buildService,
		service: buildService,
		app,
	});

	await app.hooks.callHook("app:build:service:vite:start", {
		vite: viteBuildConfig,
		// @deprecated
		router: buildService,
		service: buildService,
		app,
	});

	await createViteBuild(viteBuildConfig);

	await app.hooks.callHook("app:build:service:vite:end", {
		vite: viteBuildConfig,
		// @deprecated
		router: buildService,
		service: buildService,
		app,
	});

	if (service.type === "spa" && !service.handler.endsWith(".html")) {
		await rm(join(service.root, "index.html"));
	}

	log(c.yellow(service.name), c.green(`build done`));
}

const buildTargetPlugin = {
	server: () => [routes(), handlerBuild(), treeShake(), manifest()],
	browser: () => [routes(), browserBuild(), treeShake(), manifest()],
};

const spaManifest = () => {
	/** @type {import('./vite-dev.d.ts').ViteConfig} */
	let config;
	/** @type {import('./vite-dev.d.ts').ConfigEnv} */
	let env;

	/** @type {import('./vite-dev.d.ts').Plugin} */
	const plugin = {
		name: "spa-manifest",
		enforce: "post",
		config(c, e) {
			env = e;
		},
		transformIndexHtml() {
			if (env.command === "build") {
				return [
					{
						tag: "script",
						attrs: {
							src: join(
								config.app.config.server.baseURL ?? "/",
								config.service.base,
								"manifest.js",
							),
						},
						injectTo: "head",
					},
				];
			}
			return [];
		},

		configResolved(resolvedConfig) {
			config = resolvedConfig;
		},
		async generateBundle(options, bundle) {
			const manifest = await createSPAManifest(config, bundle, options.format);
			this.emitFile({
				fileName: "manifest.js",
				type: "asset",
				source: `window.manifest = ${JSON.stringify(manifest, null, 2)}`,
			});
		},
	};

	return plugin;
};

const serviceTypePlugins = {
	static: () => [],
	/**
	 *
	 * @param {import('./service-mode.js').Service} service
	 * @returns
	 */
	client: (service) => [
		virtual(
			{
				[handlerModule(service)]: ({ config }) => {
					invariant(
						config.service.type === "client",
						"$vinxi/handler is only supported in client mode",
					);
					return `import * as mod from "${join(
						config.service.root,
						config.service.handler,
					)}"; export default mod['default']`;
				},
			},
			"http",
		),
		config("appType", {
			appType: "custom",
			ssr: {
				noExternal: ["vinxi", /@vinxi\//],
				external: ["@vinxi/listhen"],
			},
			build: {
				rollupOptions: {
					external: ["h3", "@vinxi/listhen"],
				},
			},
			optimizeDeps: {
				force: true,
				exclude: ["vinxi"],
			},
			define: {
				"process.env.TARGET": JSON.stringify(process.env.TARGET ?? "node"),
			},
		}),
	],
	/**
	 *
	 * @param {import('./service-mode.js').Service} service
	 * @returns
	 */
	http: (service) => [
		virtual(
			{
				[handlerModule(service)]: ({ config }) => {
					invariant(
						config.service.type === "http",
						"$vinxi/handler is only supported in handler mode",
					);

					if (config.service.middleware) {
						return `
					import middleware from "${join(
						config.service.root,
						config.service.middleware,
					)}";
					import handler from "${join(config.service.root, config.service.handler)}";
					import { eventHandler } from "vinxi/http";
					export default eventHandler({ onRequest: middleware.onRequest, onBeforeResponse: middleware.onBeforeResponse, handler, websocket: handler.__websocket__ });`;
					}
					return `import handler from "${join(
						config.service.root,
						config.service.handler,
					)}"; export default handler;`;
				},
			},
			"http",
		),
		config("appType", {
			appType: "custom",
			ssr: {
				noExternal: ["vinxi", /@vinxi\//],
				external: ["@vinxi/listhen"],
			},
			build: {
				rollupOptions: {
					external: ["h3", "@vinxi/listhen"],
				},
			},
			define: {
				"process.env.TARGET": JSON.stringify(process.env.TARGET ?? "node"),
			},
		}),
		config("handler:base", (service, app) => {
			const clientService = service.link?.client
				? app.getService(service.link?.client)
				: null;

			let serviceBase = clientService ? clientService.base : service.base;

			let base = join(app.config.server.baseURL ?? "/", serviceBase);

			return {
				base,
			};
		}),
	],
	/**
	 *
	 * @param {import('./service-mode.js').Service} service
	 * @returns
	 */
	spa: (service) => [
		service.handler?.endsWith(".html")
			? undefined
			: virtual(
					{
						[handlerModule(service)]: ({ config }) => {
							return `export default {}`;
						},
					},
					"http",
			  ),
		spaManifest(),
		config("appType", {
			appType: "custom",
			ssr: {
				noExternal: ["vinxi", /@vinxi\//],
				external: ["@vinxi/listhen"],
			},
			build: {
				rollupOptions: {
					external: ["h3", "@vinxi/listhen"],
				},
			},
			optimizeDeps: {
				force: true,
				exclude: ["vinxi"],
			},
			define: {
				"process.env.TARGET": JSON.stringify(process.env.TARGET ?? "node"),
			},
		}),
	],
};

/**
 *
 * @param {{ src: string; pick: string[] }} route
 * @returns
 */
function toRouteId(route) {
	return `${route.src}?${route.pick.map((p) => `pick=${p}`).join("&")}`;
}

/**
 *
 * @param {import("./service-mode.js").Service<{ handler: string }>} service
 * @returns
 */
export async function getEntries(service) {
	return [
		handlerModule(service),
		...(
			(await service.internals.routes?.getRoutes())?.map((r) =>
				Object.entries(r)
					.filter(([r, v]) => v && r.startsWith("$") && !r.startsWith("$$"))
					.map(([, v]) => toRouteId(v)),
			) ?? []
		).flat(),
	];
}

/**
 * @returns {import('./vite-dev.d.ts').Plugin}
 */
function handlerBuild() {
	return {
		name: "react-rsc:handler",
		async config({ service, app }, env) {
			if (env.command === "build") {
				invariant(
					service && service.type !== "static" && service.handler,
					"Invalid service",
				);
				const { builtinModules } = await import("module");
				const { join } = await import("./path.js");
				const input = await getEntries(service);
				let base = join(app?.config.server.baseURL ?? "/", service.base);
				return {
					build: {
						rollupOptions: {
							input,
							external: [
								...builtinModules,
								...builtinModules.map((m) => `node:${m}`),
							],
							treeshake: true,
							preserveEntrySignatures: "exports-only",
						},
						ssr: true,
						cssMinify: "esbuild",
						minify: process.env.MINIFY !== "false" ?? true,
						manifest: true,
						target: "node18",
						ssrEmitAssets: true,
						outDir: join(service.outDir, service.base),
						emptyOutDir: false,
					},
					base,
					publicDir: false,
				};
			}
		},
	};
}

/**
 * @returns {import('./vite-dev.d.ts').Plugin}
 */
function browserBuild() {
	return {
		name: "build:browser",
		async config({ service, app }, env) {
			if (env.command === "build") {
				invariant(service && service.type !== "static", "Invalid service");
				const { join } = await import("./path.js");
				let base = join(app.config.server.baseURL ?? "/", service.base);

				return {
					build: {
						rollupOptions: {
							input: await getEntries(service),
							treeshake: true,
							preserveEntrySignatures: "exports-only",
						},
						minify: process.env.MINIFY !== "false" ?? true,
						manifest: true,
						cssMinify: "esbuild",
						outDir: join(service.outDir, service.base),
						target: "esnext",
						emptyOutDir: false,
					},
					base,
					publicDir: false,
				};
			}
		},
	};
}

/**
 * Recursively deletes empty directories starting from the given directory
 * and moving upwards but stopping at the initial directory.
 * If the initial given directory is empty, it will be deleted.
 *
 * @param {string} dir The directory to start deleting from
 * @param {string} startDir The initial directory to stop deleting at
 * @returns {Promise<void>} A promise that resolves when all empty directories have been deleted
 */
async function deleteEmptyDirs(dir, startDir = dir) {
	const fileOrFolderList = readdirSync(dir);
	if (fileOrFolderList.length === 0) {
		await rmdir(dir);
		if (dir === startDir) {
			return;
		}
	}

	// if file is directory then recursively call deleteEmptyDirs
	for (const file of fileOrFolderList) {
		const filePath = join(dir, file);
		if (statSync(filePath).isDirectory()) {
			await deleteEmptyDirs(filePath, startDir);
		}
	}
}
