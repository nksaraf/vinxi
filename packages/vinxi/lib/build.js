import { build, copyPublicAssets, createNitro } from "nitropack";
import { relative } from "pathe";
import { visualizer } from "rollup-plugin-visualizer";

import { manifest } from "./plugins/manifest.js";
import { routes } from "./plugins/routes.js";
import { treeShake } from "./plugins/tree-shake.js";

export async function createBuild(app, buildConfig) {
	const { existsSync, promises: fsPromises, readFileSync } = await import("fs");
	const { join } = await import("path");
	const { fileURLToPath } = await import("url");
	for (const router of app.config.routers) {
		if (existsSync(router.build.outDir)) {
			await fsPromises.rm(router.build.outDir, { recursive: true });
		}
	}

	for (const router of app.config.routers.filter(
		(router) => router.mode != "static",
	)) {
		// if (router.mode in routers) {
		//   await withLogger({ requestId: router.index, router }, async () => {
		//     await routers[router.mode].build.apply(this, [router])
		//   })
		// }
		await createRouterBuild(app, router);
	}

	const nitro = await createNitro({
		dev: false,
		plugins: [
			"#app-manifest",
			fileURLToPath(new URL("./prod-manifest.js", import.meta.url)),
		],
		handlers: [
			...app.config.routers.map((router) => {
				if (router.mode === "handler") {
					const bundlerManifest = JSON.parse(
						readFileSync(
							join(router.build.outDir, router.base, "manifest.json"),
							"utf-8",
						),
					);

					return {
						route: router.base.length === 1 ? "/**" : `${router.base}/**`,
						handler: join(
							router.build.outDir,
							router.base,
							bundlerManifest[relative(app.config.root, router.handler)].file,
						),
					};
				} else if (router.mode === "spa") {
					return {
						route: router.base.length === 1 ? "/**" : `${router.base}/**`,
						handler: "#vinxi/spa",
					};
				}
			}),
		].filter(Boolean),
		rollupConfig: {
			plugins: [visualizer()],
		},
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
				.map((router) => ({
					dir: join(router.build.outDir, router.base),
					baseURL: router.base,
					passthrough: true,
				})),
			...app.config.routers
				.filter((router) => router.mode === "spa")
				.map((router) => ({
					dir: join(router.build.outDir, router.base),
					baseURL: router.base,
					passthrough: true,
				})),
		],
		scanDirs: [],
		appConfigFiles: [],
		virtual: {
			"#app-manifest": `
        const appConfig = ${JSON.stringify(app.config)}
				const buildManifest = ${JSON.stringify(
					Object.fromEntries(
						app.config.routers
							.filter((router) => router.mode !== "static")
							.map((router) => {
								const bundlerManifest = JSON.parse(
									readFileSync(
										join(router.build.outDir, router.base, "manifest.json"),
										"utf-8",
									),
								);
								return [router.name, bundlerManifest];
							}),
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
				const indexHtml = readFileSync(
					join(router.build.outDir, router.base, "index.html"),
					"utf-8",
				);
				return `
				import { eventHandler } from 'h3'
				const html = ${JSON.stringify(indexHtml)}
				export default eventHandler(event => { 
					return html
				})
				`;
			},
		},
	});

	await copyPublicAssets(nitro);
	await build(nitro);
	await nitro.close();
	process.exit(0);
}

/**
 *
 * @param {import("vite").InlineConfig & { router: any }} config
 */
async function createViteBuild(config) {
	const vite = await import("vite");
	return await vite.build(config);
}

async function createRouterBuild(app, router) {
	await createViteBuild({
		router,
		plugins: [
			routerModePlugin[router.mode]?.() ?? [],
			buildTargetPlugin[router.build.target]?.() ?? [],
			manifest(),
			...(router.build.plugins?.() ?? []),
		],
	});

	console.log("build done");
}

const buildTargetPlugin = {
	node: () => [routes(), handerBuild(), treeShake()],
	browser: () => [routes(), browserBuild(), treeShake()],
};

const routerModePlugin = {
	static: () => [],
	handler: () => [],
};

function toRouteId(route) {
	return `${route.src}?${route.pick.map((p) => `pick=${p}`).join("&")}`;
}

export function getEntries(router) {
	console.log(router.fileRouter?.routes);
	return [
		router.handler,
		...(
			router.fileRouter?.routes.map((r) =>
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
							input: getEntries(inlineConfig.router),
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
				console.log(inlineConfig);
				return {
					build: {
						rollupOptions: {
							input: getEntries(inlineConfig.router),
							treeshake: true,
						},
						manifest: true,
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
