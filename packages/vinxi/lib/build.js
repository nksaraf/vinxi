import boxen from "boxen";
import { mkdir, rm, writeFile } from "fs/promises";
import { H3Event, createApp } from "h3";
import { createRequire } from "module";
import { build, copyPublicAssets, createNitro, prerender } from "nitropack";

import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

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
	console.log(
		boxen(`⚙  ${c.green("Building your app...")}`, {
			padding: { left: 1, right: 4 },
		}),
	);
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
		if (router.mode !== "static" && router.build !== false) {
			await withLogger({ router, requestId: "build" }, async () => {
				await createRouterBuild(app, router);
			});
		}
	}

	const nitro = await createNitro({
		...app.config.server,
		dev: false,

		preset:
			buildConfig.preset ??
			process.env.TARGET ??
			process.env.PRESET ??
			process.env.SERVER_PRESET ??
			process.env.SERVER_TARGET ??
			process.env.NITRO_PRESET ??
			process.env.NITRO_TARGET ??
			app.config.server.preset,
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
		// externals: {
		// 	inline: ["node-fetch-native/polyfill"],
		// },

		minify: process.env.MINIFY !== "false" ?? true,
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
					if (router.mode === "handler") {
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
					} else if (router.mode === "spa") {
						return [
							{
								route: router.base.length === 1 ? "/" : `${router.base}`,
								handler: "#vinxi/spa",
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
					if (router.mode === "static") {
						return {
							// @ts-expect-error
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
			"#vinxi/prod-app": () => {
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
								if (router.mode !== "static" && router.internals.routes) {
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
					import { eventHandler } from 'vinxi/server'
					const html = ${JSON.stringify(indexHtml)}
					export default eventHandler(event => {
						return html
					})
				`;
			},
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
	console.log(
		boxen(`⚙  ${c.green(`Preparing app for ${nitro.options.preset}...`)}`, {
			padding: { left: 1, right: 4 },
		}),
	);

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
	const vite = await import("vite");
	return await vite.build({ ...config, configFile: false });
}

/**
 *
 * @param {import("./app.js").App} app
 * @param {import("./router-mode.js").Router} router
 */
async function createRouterBuild(app, router) {
	console.log("\n");
	console.log(
		boxen(c.green(`📦 Compiling ${router.name} router...`), {
			padding: { left: 1, right: 4 },
		}),
	);
	await app.hooks.callHook("app:build:router:start", { app, router });
	let buildRouter = router;
	if (router.mode === "spa" && !router.handler.endsWith(".html")) {
		await app.hooks.callHook("app:build:router:html:generate:start", {
			app,
			router,
		});
		await createViteBuild({
			app: app,
			build: {
				ssr: true,
				ssrManifest: true,
				rollupOptions: {
					input: { handler: router.handler },
				},
				target: "esnext",
				outDir: join(router.outDir + "_entry"),
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

		writeFileSync(join(process.cwd(), "index.html"), htmlCode.code);

		await app.hooks.callHook("app:build:router:html:generate:write", {
			app,
			router,
			html: htmlCode,
			path: join(process.cwd(), "index.html"),
		});

		buildRouter = {
			...router,
			handler: join(process.cwd(), "index.html"),
		};
	}

	log(`building router ${router.name} in ${router.mode} mode`);

	const viteBuildConfig = {
		router: buildRouter,
		app,
		plugins: [
			routerModePlugin[buildRouter.internals.mode.name]?.(buildRouter) ?? [],
			buildTargetPlugin[buildRouter.target]?.(buildRouter) ?? [],
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
	build: (router) => [
		virtual(
			{
				[handlerModule(router)]: ({ config }) => {
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
	handler: (router) => [
		virtual(
			{
				[handlerModule(router)]: ({ config }) => {
					invariant(
						config.router.mode === "handler",
						"#vinxi/handler is only supported in handler mode",
					);

					if (config.router.middleware) {
						return `
					import middleware from "${join(config.router.root, config.router.middleware)}";
					import handler from "${join(config.router.root, config.router.handler)}";
					import { eventHandler } from "vinxi/server";
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
	spa: (router) => [
		router.handler?.endsWith(".html")
			? undefined
			: virtual(
					{
						[handlerModule(router)]: ({ config }) => {
							return `export default {}`;
						},
					},
					"handler",
			  ),
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
 * @param {import("./router-mode.js").Router<{ handler: string }>} router
 * @returns
 */
export async function getEntries(router) {
	return [
		router.handler.endsWith(".html") ? router.handler : handlerModule(router),
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
		async config({ router }, env) {
			if (env.command === "build") {
				invariant(
					router && router.mode !== "static" && router.handler,
					"Invalid router",
				);
				const { builtinModules } = await import("module");
				const { join } = await import("./path.js");
				const input = await getEntries(router);
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
						minify: process.env.MINIFY !== "false" ?? true,
						manifest: true,
						target: "node18",
						ssrEmitAssets: true,
						outDir: join(router.outDir, router.base),
						emptyOutDir: false,
					},
					base: router.base,
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
		async config({ router }, env) {
			if (env.command === "build") {
				invariant(router && router.mode !== "static", "Invalid router");
				const { join } = await import("./path.js");
				console.log(await getEntries(router));
				return {
					build: {
						rollupOptions: {
							input: await getEntries(router),
							treeshake: true,
							preserveEntrySignatures: "exports-only",
						},
						minify: process.env.MINIFY !== "false" ?? true,
						manifest: true,
						outDir: join(router.outDir, router.base),
						target: "esnext",
						emptyOutDir: false,
					},
					base: router.base,
					publicDir: false,
				};
			}
		},
	};
}
