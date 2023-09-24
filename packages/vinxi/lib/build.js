import { mkdir, rm, writeFile } from "fs/promises";
import {
	H3Event,
	createApp,
	eventHandler,
	fromNodeMiddleware,
	toNodeListener,
} from "h3";
import { createRequire } from "module";
import { build, copyPublicAssets, createNitro } from "nitropack";
import { join, relative } from "pathe";

import { writeFileSync } from "node:fs";

import { createIncomingMessage, createServerResponse } from "./http-stream.js";
import invariant from "./invariant.js";
import { consola, withLogger } from "./logger.js";
import { createSPAManifest } from "./manifest/spa-manifest.js";
import { config } from "./plugins/config.js";
import { manifest } from "./plugins/manifest.js";
import { routes } from "./plugins/routes.js";
import { treeShake } from "./plugins/tree-shake.js";
import { virtual } from "./plugins/virtual.js";

/** @typedef {{}} BuildConfig */

const require = createRequire(import.meta.url);

/**
 *
 * @param {import('./app.js').App} app
 * @param {BuildConfig} buildConfig
 */
export async function createBuild(app, buildConfig) {
	const { existsSync, promises: fsPromises, readFileSync } = await import("fs");
	const { join } = await import("pathe");
	const { fileURLToPath } = await import("url");
	for (const router of app.config.routers) {
		if (existsSync(router.outDir)) {
			console.log(`removing ${router.outDir}`);
			await fsPromises.rm(router.outDir, { recursive: true });
		}
	}

	for (const router of app.config.routers) {
		if (router.mode !== "static") {
			// if (router.mode in routers) {
			await withLogger({ router, requestId: "build" }, async () => {
				await createRouterBuild(app, router);

				//     await routers[router.mode].build.apply(this, [router])
			});
		}
		// }
	}

	const nitro = await createNitro({
		...app.config.server,
		dev: false,
		preset:
			process.env.TARGET ??
			process.env.NITRO_PRESET ??
			app.config.server.preset,
		alias: {
			/**
			 * These
			 */
			"node-fetch-native/polyfill": require.resolve(
				"node-fetch-native/polyfill",
			),
			"unstorage/drivers/fs-lite": require.resolve("unstorage/drivers/fs-lite"),
			defu: require.resolve("defu"),
			pathe: require.resolve("pathe"),
			unstorage: require.resolve("unstorage"),
		},
		// externals: {
		// 	inline: ["node-fetch-native/polyfill"],
		// },
		plugins: [
			"#prod-app",
			fileURLToPath(new URL("./app-fetch.js", import.meta.url)),
			fileURLToPath(new URL("./app-manifest.js", import.meta.url)),
			...(app.config.server.plugins ?? []),
		],
		handlers: [
			...app.config.routers
				.map((router) => {
					if (router.mode === "handler") {
						const bundlerManifest = JSON.parse(
							readFileSync(
								join(router.outDir, router.base, "manifest.json"),
								"utf-8",
							),
						);

						const handler = join(
							router.outDir,
							router.base,
							bundlerManifest[
								"virtual:#vinxi/handler" in bundlerManifest
									? "virtual:#vinxi/handler"
									: relative(app.config.root, router.handler)
							].file,
						);

						return [
							{
								route: router.base.length === 1 ? "/" : `${router.base}`,
								handler,
							},
							{
								route: router.base.length === 1 ? "/**" : `${router.base}/**`,
								handler,
							},
						];
					} else if (router.mode === "spa") {
						return [
							{
								route: router.base.length === 1 ? "/" : `${router.base}`,
								handler: "#vinxi/spa",
							},
							{
								route: router.base.length === 1 ? "/**" : `${router.base}/**`,
								handler: "#vinxi/spa",
							},
						];
					}
				})
				.flat(),
			...(app.config.server.handlers ?? []),
		].filter(Boolean),
		publicAssets: [
			...app.config.routers
				.map((router) => {
					if (router.mode === "static") {
						return {
							dir: router.dir,
							baseURL: router.base,
							passthrough: true,
						};
					} else if (router.mode === "handler") {
						return {
							dir: join(router.outDir, router.base, "assets"),
							baseURL: join(router.base, "assets"),
							passthrough: true,
						};
					} else if (router.mode === "spa" || router.mode === "build") {
						return {
							dir: join(router.outDir, router.base),
							baseURL: router.base,
							passthrough: true,
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
			"#prod-app": () => {
				const config = {
					...app.config,
					routers: app.config.routers.map((router) => {
						if (router.mode === "spa" && !router.handler.endsWith(".html")) {
							return {
								...router,
								handler: "index.html",
							};
						}

						return router;
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
						app.config.routers
							.map((router) => {
								if (router.mode !== "static") {
									const bundlerManifest = JSON.parse(
										readFileSync(
											join(router.outDir, router.base, "manifest.json"),
											"utf-8",
										),
									);
									return [router.name, bundlerManifest];
								}
							})
							.filter(Boolean),
					),
				)}

        function createProdApp(appConfig) {
          return {
            config: { ...appConfig, buildManifest },
            getRouter(name) {
              return appConfig.routers.find(router => router.name === name)
            }
          }
        }

        export default function plugin(app) {
          const prodApp = createProdApp(appConfig)
          globalThis.app = prodApp
        }
      `;
			},
			"#vinxi/spa": () => {
				const router = app.config.routers.find(
					(router) => router.mode === "spa",
				);

				invariant(router?.mode === "spa", "No SPA router found");

				const indexHtml = readFileSync(
					join(router.outDir, router.base, "index.html"),
					"utf-8",
				);
				return `
					import { eventHandler } from 'vinxi/runtime/server'
					const html = ${JSON.stringify(indexHtml)}
					export default eventHandler(event => { 
						return html
					})
				`;
			},
			// ...Object.fromEntries(
			// 	app.config.routers
			// 		.map((router) =>
			// 			router.mode === "handler"
			// 				? Object.entries(router.server?.virtual ?? {}).map(
			// 						([k, v]) => [k, typeof v === "function" ? () => v(app) : v],
			// 				  )
			// 				: [],
			// 		)
			// 		.flat(),
			// ),
			...(Object.fromEntries(
				Object.entries(app.config.server?.virtual ?? {}).map(([k, v]) => [
					k,
					// @ts-ignore
					typeof v === "function" ? () => v(app) : v,
				]),
			) ?? {}),
		},
	});

	nitro.options.appConfigFiles = [];
	nitro.logger = consola.withTag(app.config.name);

	if (existsSync(join(nitro.options.output.serverDir))) {
		await rm(join(nitro.options.output.serverDir), { recursive: true });
	}

	if (existsSync(join(nitro.options.output.publicDir))) {
		await rm(join(nitro.options.output.publicDir), { recursive: true });
	}

	await copyPublicAssets(nitro);
	await mkdir(join(nitro.options.output.serverDir), { recursive: true });
	await build(nitro);
	await nitro.close();
	process.exit(0);
}

/**
 *
 * @param {import("vite").InlineConfig & { router?: any; app: any }} config
 */
async function createViteBuild(config) {
	const vite = await import("vite");
	return await vite.build({ ...config, configFile: false });
}

/**
 *
 * @param {import("./app.js").App} app
 * @param {Exclude<import("./app-router-mode.js").RouterSchema, import("./app-router-mode.js").StaticRouterSchema>} router
 */
async function createRouterBuild(app, router) {
	let buildRouter = router;
	if (router.mode === "spa" && !router.handler.endsWith(".html")) {
		await createViteBuild({
			app: app,
			build: {
				ssr: true,
				ssrManifest: true,
				rollupOptions: {
					input: { handler: router.handler },
					external: ["h3"],
				},
				target: "esnext",
				outDir: join(router.outDir + "_entry"),
			},
		});

		const render = await import(join(router.outDir + "_entry", "handler.js"));

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

		writeFileSync(join(process.cwd(), "index.html"), text);

		buildRouter = {
			...router,
			handler: join(process.cwd(), "index.html"),
		};
	}

	console.log(`building router ${router.name} in ${router.mode} mode`);

	await createViteBuild({
		router: buildRouter,
		app,
		plugins: [
			routerModePlugin[buildRouter.mode]?.() ?? [],
			buildTargetPlugin[buildRouter.target]?.() ?? [],
			...((await buildRouter.plugins?.()) ?? []),
		],
	});

	if (router.mode === "spa" && !router.handler.endsWith(".html")) {
		await rm(join(process.cwd(), "index.html"));
	}

	consola.success("build done");
}

const buildTargetPlugin = {
	server: () => [routes(), handerBuild(), treeShake(), manifest()],
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
						attrs: { src: join(config.router.base, "manifest.js") },
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

const routerModePlugin = {
	static: () => [],
	build: () => [
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
		config("appType", {
			appType: "custom",
			ssr: {
				noExternal: ["vinxi"],
			},
			build: {
				rollupOptions: {
					external: ["h3"],
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
	handler: () => [
		virtual(
			{
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
			},
			"handler",
		),
		config("appType", {
			appType: "custom",
			ssr: {
				noExternal: ["vinxi"],
			},
			build: {
				rollupOptions: {
					external: ["h3"],
				},
			},
			optimizeDeps: {
				disabled: true,
			},
			define: {
				"process.env.TARGET": JSON.stringify(process.env.TARGET ?? "node"),
			},
		}),
	],
	spa: () => [
		spaManifest(),
		config("appType", {
			appType: "custom",
			ssr: {
				noExternal: ["vinxi"],
			},
			build: {
				rollupOptions: {
					external: ["h3"],
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
 * @param {Exclude<import("./app-router-mode.js").RouterSchema, import("./app-router-mode.js").StaticRouterSchema>} router
 * @returns
 */
export async function getEntries(router) {
	return [
		router.handler.endsWith(".html") ? router.handler : "#vinxi/handler",
		...(
			(await router.internals.routes?.getRoutes())?.map((r) =>
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
function handerBuild() {
	return {
		name: "react-rsc:handler",
		async config(inlineConfig, env) {
			if (env.command === "build") {
				invariant(
					inlineConfig.router && inlineConfig.router.mode !== "static",
					"Invalid router",
				);
				const { builtinModules } = await import("module");
				const { join } = await import("pathe");
				const input = await getEntries(inlineConfig.router);
				return {
					build: {
						rollupOptions: {
							input,
							external: [
								...builtinModules,
								...builtinModules.map((m) => `node:${m}`),
							],
							treeshake: true,
						},
						ssr: true,
						manifest: true,
						target: "node18",
						ssrEmitAssets: true,
						outDir: join(inlineConfig.router.outDir, inlineConfig.router.base),
						emptyOutDir: false,
					},
					base: inlineConfig.router.base,
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
		async config(inlineConfig, env) {
			if (env.command === "build") {
				invariant(
					inlineConfig.router && inlineConfig.router.mode !== "static",
					"Invalid router",
				);
				const { join } = await import("pathe");
				return {
					build: {
						rollupOptions: {
							input: await getEntries(inlineConfig.router),
							treeshake: true,
						},
						manifest: true,
						outDir: join(inlineConfig.router.outDir, inlineConfig.router.base),
						target: "esnext",
						emptyOutDir: false,
					},
					base: inlineConfig.router.base,
					publicDir: false,
				};
			}
		},
	};
}
