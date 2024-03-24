import { mkdir, rm } from "fs/promises";
import { createRequire } from "module";
import { build, copyPublicAssets, createNitro, prerender } from "nitropack";

import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

import { H3Event, createApp } from "../runtime/server.js";
import { chunksServerVirtualModule } from "./chunks.js";
import { createIncomingMessage, createServerResponse } from "./http-stream.js";
import invariant from "./invariant.js";
import { c, consola, log, withLogger } from "./logger.js";
import { viteManifestPath } from "./manifest-path.js";
import { createSPAManifest } from "./manifest/spa-manifest.js";
import { handlerModule, join, relative, virtualId } from "./path.js";
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
	console.log("\n");
	console.log(`⚙  ${c.green("Building your app...")}`);
	await app.hooks.callHook("app:build:start", { app, buildConfig });
	const { existsSync, promises: fsPromises, readFileSync } = await import("fs");
	const { join } = await import("./path.js");
	const { fileURLToPath } = await import("url");
	app.config.routers = app.config.routers.filter(
		(router) => router.build !== false,
	);
	for (const router of app.config.routers) {
		if (router.build !== false) {
			if (existsSync(router.outDir)) {
				await withLogger({ router, requestId: "build" }, async () => {
					console.log(`removing ${router.outDir}`);
					await fsPromises.rm(router.outDir, { recursive: true });
				});
			}
		} else {
			await withLogger({ router, requestId: "build" }, async () => {
				console.log(`skipping ${router.name}`);
			});
		}
	}

	for (const router of app.config.routers) {
		if (router.type !== "static" && router.build !== false) {
			await withLogger({ router, requestId: "build" }, async () => {
				await createRouterBuild(app, router);
			});
		}
	}

	const nitro = await createNitro({
		...app.config.server,
		dev: false,

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
			(process.versions.bun !== undefined ? "bun" : "node-server"),
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
			"#vinxi/prod-app",
			fileURLToPath(new URL("./app-fetch.js", import.meta.url)),
			fileURLToPath(new URL("./app-manifest.js", import.meta.url)),
			"#vinxi/chunks",
			...(app.config.server.plugins ?? []),
		],
		buildDir: ".vinxi",
		handlers: [
			...[...app.config.routers]
				.sort((a, b) => b.base.length - a.base.length)
				.map((router) => {
					if (router.type === "http") {
						invariant(router.handler, "Missing router.handler");
						const bundlerManifest = JSON.parse(
							readFileSync(viteManifestPath(router), "utf-8"),
						);

						const virtualHandlerId = virtualId(handlerModule(router));

						const handler = join(
							router.outDir,
							router.base,
							bundlerManifest[
								virtualHandlerId in bundlerManifest
									? virtualHandlerId
									: relative(app.config.root, router.handler)
							].file,
						);

						return [
							{
								route: router.base.length === 1 ? "/" : `${router.base}`,
								handler,
								middleware: true,
							},
						];
					} else if (router.type === "spa") {
						return [
							{
								route: router.base.length === 1 ? "/" : `${router.base}`,
								handler: `#vinxi/spa/${router.name}`,
								middleware: true,
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
					if (router.type === "static") {
						return {
							// @ts-expect-error
							dir: router.dir,
							baseURL: router.base,
							fallthrough: true,
						};
					} else if (router.type === "http") {
						return {
							dir: join(router.outDir, router.base, "assets"),
							baseURL: join(router.base, "assets"),
							fallthrough: true,
						};
					} else if (router.type === "spa" || router.type === "client") {
						return {
							dir: join(router.outDir, router.base),
							baseURL: router.base,
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
			"#vinxi/prod-app": () => {
				const config = {
					...app.config,
					routers: app.config.routers.map((router) => {
						if (router.type === "spa" && !router.handler.endsWith(".html")) {
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
								if (router.type !== "static") {
									const bundlerManifest = JSON.parse(
										readFileSync(viteManifestPath(router), "utf-8"),
									);
									return [router.name, bundlerManifest];
								}
							})
							.filter(Boolean),
					),
				)}

				const routeManifest = ${JSON.stringify(
					Object.fromEntries(
						// @ts-ignore
						app.config.routers
							.map((router) => {
								if (router.type !== "static" && router.internals.routes) {
									return [router.name, router.internals.routes?.getRoutes?.()];
								}
							})
							.filter(Boolean),
					),
				)}

        function createProdApp(appConfig) {
          return {
            config: { ...appConfig, buildManifest, routeManifest },
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
			...app.config.routers
				.filter((router) => router.type === "spa")
				.reduce((virtuals, router) => {
					virtuals[`#vinxi/spa/${router.name}`] = () => {
						const indexHtml = readFileSync(
							join(router.outDir, router.base, "index.html"),
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
			"#vinxi/chunks": () => chunksServerVirtualModule()(app),

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
	process.exit(0);
}

/**
 *
 * @param {import("vite").InlineConfig & { router?: any; app: any }} config
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
 * @param {import("./router-mode.js").Router} router
 */
async function createRouterBuild(app, router) {
	console.log("\n");
	console.log(c.green(`📦 Compiling ${router.name} router...`));
	await app.hooks.callHook("app:build:router:start", { app, router });
	let buildRouter = router;
	if (router.type === "spa" && !router.handler.endsWith(".html")) {
		await app.hooks.callHook("app:build:router:html:generate:start", {
			app,
			router,
		});
		await createViteBuild({
			app: app,
			root: router.root,
			build: {
				ssr: true,
				ssrManifest: true,
				rollupOptions: {
					input: { handler: router.handler },
				},
				target: "esnext",
				outDir: join(router.outDir + "_entry"),
				emptyOutDir: true,
			},
		});

		const render = await import(
			pathToFileURL(join(router.outDir + "_entry", "handler.js")).href
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

		await app.hooks.callHook("app:build:router:html:generate:end", {
			app,
			router,
			html: htmlCode,
		});

		writeFileSync(join(router.root, "index.html"), htmlCode.code);

		await app.hooks.callHook("app:build:router:html:generate:write", {
			app,
			router,
			html: htmlCode,
			path: join(router.root, "index.html"),
		});

		buildRouter = {
			...router,
			handler: "./index.html",
		};
	}

	log(`building router ${router.name} in ${router.type} mode`);

	const viteBuildConfig = {
		router: buildRouter,
		app,
		root: router.root,
		plugins: [
			buildTargetPlugin[buildRouter.target]?.(buildRouter) ?? [],
			routerModePlugin[buildRouter.internals.type.name]?.(buildRouter) ?? [],
			...((await buildRouter.plugins?.(buildRouter)) ?? []),
			{
				name: "vinxi:build:router:config",
				async configResolved(config) {
					await app.hooks.callHook("app:build:router:vite:config:resolved", {
						vite: config,
						router: buildRouter,
						app,
					});
				},
			},
		],
	};

	await app.hooks.callHook("app:build:router:vite:config", {
		vite: viteBuildConfig,
		router: buildRouter,
		app,
	});

	await app.hooks.callHook("app:build:router:vite:start", {
		vite: viteBuildConfig,
		router: buildRouter,
		app,
	});

	await createViteBuild(viteBuildConfig);

	await app.hooks.callHook("app:build:router:vite:end", {
		vite: viteBuildConfig,
		router: buildRouter,
		app,
	});

	if (router.type === "spa" && !router.handler.endsWith(".html")) {
		await rm(join(router.root, "index.html"));
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
						attrs: {
							src: join(
								config.app.config.server.baseURL ?? "/",
								config.router.base,
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

const routerModePlugin = {
	static: () => [],
	client: (router) => [
		virtual(
			{
				[handlerModule(router)]: ({ config }) => {
					invariant(
						config.router.type === "client",
						"#vinxi/handler is only supported in client mode",
					);
					return `import * as mod from "${join(
						config.router.root,
						config.router.handler,
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
	http: (router) => [
		virtual(
			{
				[handlerModule(router)]: ({ config }) => {
					invariant(
						config.router.type === "http",
						"#vinxi/handler is only supported in handler mode",
					);

					if (config.router.middleware) {
						return `
					import middleware from "${join(config.router.root, config.router.middleware)}";
					import handler from "${join(config.router.root, config.router.handler)}";
					import { eventHandler } from "vinxi/http";
					export default eventHandler({ onRequest: middleware.onRequest, onBeforeResponse: middleware.onBeforeResponse, handler, websocket: handler.__websocket__ });`;
					}
					return `import handler from "${join(
						config.router.root,
						config.router.handler,
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
		config("handler:base", (router, app) => {
			const clientRouter = router.link?.client
				? app.getRouter(router.link?.client)
				: null;

			let routerBase = clientRouter ? clientRouter.base : router.base;

			let base = join(app.config.server.baseURL ?? "/", routerBase);

			return {
				base,
			};
		}),
	],
	spa: (router) => [
		router.handler?.endsWith(".html")
			? undefined
			: virtual(
					{
						[handlerModule(router)]: ({ config }) => {
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
 * @param {import("./router-mode.js").Router<{ handler: string }>} router
 * @returns
 */
export async function getEntries(router) {
	return [
		handlerModule(router),
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
		async config({ router, app }, env) {
			if (env.command === "build") {
				invariant(
					router && router.type !== "static" && router.handler,
					"Invalid router",
				);
				const { builtinModules } = await import("module");
				const { join } = await import("./path.js");
				const input = await getEntries(router);
				let base = join(app?.config.server.baseURL ?? "/", router.base);
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
						outDir: join(router.outDir, router.base),
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
		async config({ router, app }, env) {
			if (env.command === "build") {
				invariant(router && router.type !== "static", "Invalid router");
				const { join } = await import("./path.js");
				let base = join(app.config.server.baseURL ?? "/", router.base);

				return {
					build: {
						rollupOptions: {
							input: await getEntries(router),
							treeshake: true,
							preserveEntrySignatures: "exports-only",
						},
						minify: process.env.MINIFY !== "false" ?? true,
						manifest: true,
						cssMinify: "esbuild",
						outDir: join(router.outDir, router.base),
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
