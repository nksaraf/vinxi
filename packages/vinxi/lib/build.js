import { createRequire } from "module";
import { build, copyPublicAssets, createNitro } from "nitropack";
import { join } from "path";
import { relative } from "pathe";
import { visualizer } from "rollup-plugin-visualizer";

import { consola, withLogger } from "./logger.js";
import { createSPAManifest } from "./manifest/spa-manifest.js";
import { config } from "./plugins/config.js";
import { manifest } from "./plugins/manifest.js";
import { routes } from "./plugins/routes.js";
import { treeShake } from "./plugins/tree-shake.js";

const require = createRequire(import.meta.url);

/**
 *
 * @param {import('./app.js').App} app
 * @param {*} buildConfig
 */
export async function createBuild(app, buildConfig) {
	const { existsSync, promises: fsPromises, readFileSync } = await import("fs");
	const { join } = await import("path");
	const { fileURLToPath } = await import("url");
	for (const router of app.config.routers) {
		if ("build" in router) {
			if (existsSync(router.build.outDir)) {
				await fsPromises.rm(router.build.outDir, { recursive: true });
			}
		}
	}

	for (const router of app.config.routers.filter(
		(router) => router.mode != "static",
	)) {
		// if (router.mode in routers) {
		await withLogger({ router, requestId: "build" }, async () => {
			await createRouterBuild(app, router);

			//     await routers[router.mode].build.apply(this, [router])
		});
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
			...app.config.routers
				.map((router) =>
					router.mode === "handler"
						? router.build.server?.middleware ?? []
						: [],
				)
				.flat(),
			...(app.config.server.plugins ?? []),
			// "#extra-chunks",
		],
		handlers: [
			...app.config.routers
				.map((router) => {
					if (router.mode === "handler") {
						const bundlerManifest = JSON.parse(
							readFileSync(
								join(router.build.outDir, router.base, "manifest.json"),
								"utf-8",
							),
						);

						const handler = join(
							router.build.outDir,
							router.base,
							bundlerManifest[relative(app.config.root, router.handler)].file,
						).replace(/\\/g, "\\\\");

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
				.filter((router) => router.mode === "static")
				.map((router) => ({
					dir: router.dir,
					baseURL: router.base,
					passthrough: true,
				})),
			...app.config.routers
				.filter((router) => router.mode === "build")
				.map((/** @type {import("./app.js").BuildRouterSchema} */ router) => ({
					dir: join(router.build.outDir, router.base),
					baseURL: router.base,
					passthrough: true,
				})),
			...app.config.routers
				.filter((router) => router.mode === "spa")
				.map((/** @type {import("./app.js").SPARouterSchema} */ router) => ({
					dir: join(router.build.outDir, router.base),
					baseURL: router.base,
					passthrough: true,
				})),
			...app.config.routers
				.filter((router) => router.mode === "handler")
				.map(
					(/** @type {import("./app.js").HandlerRouterSchema} */ router) => ({
						dir: join(router.build.outDir, router.base, "assets"),
						baseURL: join(router.base, "assets"),
						passthrough: true,
					}),
				),
			...(app.config.server.publicAssets ?? []),
		],
		scanDirs: [],
		appConfigFiles: [],
		imports: false,
		virtual: {
			"#prod-app": `
        const appConfig = ${JSON.stringify(app.config)}
				const buildManifest = ${JSON.stringify(
					Object.fromEntries(
						app.config.routers
							.filter((router) => router.mode !== "static")
							.map(
								(
									/** @type {Exclude<import("./app.js").RouterSchema, import("./app.js").StaticRouterSchema>} */ router,
								) => {
									const bundlerManifest = JSON.parse(
										readFileSync(
											join(router.build.outDir, router.base, "manifest.json"),
											"utf-8",
										),
									);
									return [router.name, bundlerManifest];
								},
							),
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
      `,
			"#vinxi/spa": () => {
				const router = app.config.routers.find(
					(router) => router.mode === "spa",
				);

				if (!("build" in router)) {
					return;
				}

				const indexHtml = readFileSync(
					join(router.build.outDir, router.base, "index.html"),
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
			...Object.fromEntries(
				app.config.routers
					.map((router) =>
						router.mode === "handler"
							? Object.entries(router.build.server?.virtual ?? {}).map(
									([k, v]) => [k, typeof v === "function" ? () => v(app) : v],
							  )
							: [],
					)
					.flat(),
			),
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
	await copyPublicAssets(nitro);
	await build(nitro);
	await nitro.close();
	process.exit(0);
}

/**
 *
 * @param {import("vite").InlineConfig & { router: any; app: any }} config
 */
async function createViteBuild(config) {
	const vite = await import("vite");
	return await vite.build({ ...config, configFile: false });
}

async function createRouterBuild(app, router) {
	await createViteBuild({
		router,
		app,
		plugins: [
			routerModePlugin[router.mode]?.() ?? [],
			buildTargetPlugin[router.build.target]?.() ?? [],
			...((await router.build.plugins?.()) ?? []),
		],
	});
	consola.success("build done");
}

const buildTargetPlugin = {
	node: () => [routes(), handerBuild(), treeShake(), manifest()],
	browser: () => [routes(), browserBuild(), treeShake(), manifest()],
};

const spaManifest = () => {
	let config;
	let env;

	return {
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
};

const routerModePlugin = {
	static: () => [],
	build: () => [
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
	],
	handler: () => [
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
	],
	spa: () => [
		spaManifest(),
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
	],
};

function toRouteId(route) {
	return `${route.src}?${route.pick.map((p) => `pick=${p}`).join("&")}`;
}

export async function getEntries(router) {
	return [
		router.handler,
		...(
			(await router.fileRouter?.getRoutes())?.map((r) =>
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
				const { builtinModules } = await import("module");
				const { join } = await import("path");
				return {
					build: {
						rollupOptions: {
							input: await getEntries(inlineConfig.router),
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
						outDir: join(
							inlineConfig.router.build.outDir,
							inlineConfig.router.base,
						),
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
				const { join } = await import("path");
				return {
					build: {
						rollupOptions: {
							input: await getEntries(inlineConfig.router),
							treeshake: true,
						},
						manifest: true,
						outDir: join(
							inlineConfig.router.build.outDir,
							inlineConfig.router.base,
						),
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
