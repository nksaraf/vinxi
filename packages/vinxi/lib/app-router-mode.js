import { join } from "pathe";
import * as v from "zod";

import { isMainThread } from "node:worker_threads";

import invariant from "./invariant.js";
import { resolve } from "./resolve.js";

export { v };
/**
 * @typedef {{ routes?: CompiledRouter; devServer?: import('vite').ViteDevServer; appWorker?: import('./app-worker-client.js').AppWorkerClient; mode: import("./router-mode.js").RouterMode }} Internals
 * @typedef {{ getRoutes(): Promise<any[]>; } & EventTarget} CompiledRouter
 * @typedef {(router: RouterSchemaInput, app: import("./app.js").AppOptions) => CompiledRouter} RouterStyleFn
 * */
export const staticRouterSchema = v.object({
	name: v.string(),
	base: v.optional(v.string().default("/")),
	mode: v.literal("static"),
	dir: v.string(),
	root: v.optional(v.string()),
});
export const buildRouterSchema = v.object({
	name: v.string(),
	base: v.optional(v.string().default("/")),
	root: v.optional(v.string()),
	mode: v.literal("build"),
	handler: v.string(),
	/** @type {v.ZodOptionalType<v.ZodType<RouterStyleFn, v.ZodTypeDef, RouterStyleFn>>} */
	routes: v.optional(v.custom((value) => value !== null)),
	extensions: v.array(v.string()).optional(),
	outDir: v.string().optional(),
	target: v.literal("browser"),
	plugins: v.optional(v.custom((value) => typeof value === "function")),
});
export const handlerRouterSchema = v.object({
	name: v.string(),
	base: v.optional(v.string().default("/")),
	root: v.optional(v.string()),

	mode: v.literal("handler"),

	worker: v.optional(v.boolean()),
	handler: v.string(),
	middleware: v.optional(v.string()),
	/** @type {v.ZodOptionalType<v.ZodType<RouterStyleFn, v.ZodTypeDef, RouterStyleFn>>} */
	routes: v.optional(v.custom((value) => value !== null)),
	outDir: v.string().optional(),
	target: v.literal("server"),
	plugins: v.optional(v.custom((value) => typeof value === "function")),
});
export const spaRouterSchema = v.object({
	name: v.string(),
	base: v.optional(v.string().default("/")),
	root: v.optional(v.string()),
	mode: v.literal("spa"),
	/** @type {v.ZodOptionalType<v.ZodType<RouterStyleFn, v.ZodTypeDef, RouterStyleFn>>} */
	routes: v.optional(v.custom((value) => value !== null)),
	handler: v.string(),
	outDir: v.string().optional(),
	target: v.literal("browser"),
	plugins: v.optional(v.custom((value) => typeof value === "function")),
});
const customRouterSchema = v.object({
	name: v.string(),
	base: v.optional(v.string().default("/")),
	root: v.optional(v.string()),
	mode: v.object({
		resolveConfig: v.function().args(v.any(), v.any()).returns(v.any()),
	}),
	/** @type {v.ZodOptionalType<v.ZodType<RouterStyleFn, v.ZodTypeDef, RouterStyleFn>>} */
	routes: v.optional(v.custom((value) => value !== null)),
	handler: v.string(),
	outDir: v.string().optional(),
	target: v.literal("server"),
	plugins: v.optional(v.custom((value) => typeof value === "function")),
});
export const routerSchema = {
	static: staticRouterSchema,
	build: buildRouterSchema,
	spa: spaRouterSchema,
	handler: handlerRouterSchema,
	custom: customRouterSchema,
};
/** @typedef {v.infer<typeof buildRouterSchema> & { outDir: string; base: string; order: number; root: string; internals: Internals }} BuildRouterSchema */
/** @typedef {v.infer<typeof customRouterSchema> & { outDir: string; base: string; order: number; root: string; internals: Internals }} CustomRouterSchema */
/** @typedef {v.infer<typeof staticRouterSchema> & { outDir: string; base: string; order: number; internals: Internals }} StaticRouterSchema */
/** @typedef {v.infer<typeof handlerRouterSchema> & { outDir: string; base: string; order: number; root: string; internals: Internals }} HandlerRouterSchema */
/** @typedef {v.infer<typeof spaRouterSchema> & { outDir: string; base: string; order: number; root: string; internals: Internals }} SPARouterSchema */
/** @typedef {(HandlerRouterSchema | BuildRouterSchema | SPARouterSchema | StaticRouterSchema | CustomRouterSchema )} RouterSchema  */
/** @typedef {(v.infer<typeof buildRouterSchema> | v.infer<typeof staticRouterSchema> | v.infer<typeof spaRouterSchema> |  v.infer<typeof handlerRouterSchema> | v.infer<typeof customRouterSchema>)} RouterSchemaInput  */

/**
 * @template X
 * @template T
 * @param {X} schema
 * @param {import("./router-mode.js").RouterMode<v.z.infer<X>>} mode
 * @returns {import("./router-mode.js").RouterMode<v.z.infer<X>>}
 */
export function createRouterMode(schema, mode) {
	return mode;
}

/** @type {Record<string, import("./router-mode.js").RouterMode<any>>} */
const routerModes = {
	static: createRouterMode(staticRouterSchema, {
		name: "static",
		dev: {
			publicAssets: (router) => {
				return {
					dir: router.dir,
					baseURL: router.base,
					fallthrough: true,
				};
			},
			plugins: () => {},
		},
		resolveConfig(router, appConfig, order) {
			invariant(router.mode === "static", "Invalid router mode");
			const appRoot = appConfig.root ?? process.cwd();
			const root = router.root ?? appRoot;
			return {
				...router,
				base: router.base ?? "/",
				root,
				order: order ?? 0,
				internals: {
					mode: routerModes.static,
				},
				outDir: join(appRoot, ".nitro", "build", router.name),
			};
		},
	}),
	build: createRouterMode(buildRouterSchema, {
		name: "build",
		dev: {
			plugins: async (router) => {
				const { ROUTER_MODE_DEV_PLUGINS } = await import(
					"./router-dev-plugins.js"
				);
				return await ROUTER_MODE_DEV_PLUGINS.build(router);
			},
			handler: async (router, app, serveConfig) => {
				const { createViteHandler } = await import("./dev-server.js");
				const { fromNodeMiddleware, eventHandler } = await import("h3");
				const viteDevServer = await createViteHandler(router, app, serveConfig);

				return {
					route: router.base,
					handler: fromNodeMiddleware(viteDevServer.middlewares),
				};
			},
		},
		resolveConfig(router, appConfig, order) {
			invariant(router.mode === "build", "Invalid router mode");
			const appRoot = appConfig.root ?? process.cwd();
			const root = router.root ?? appRoot;
			/** @type {BuildRouterSchema} */
			const buildRouter = {
				...router,
				root,
				base: router.base ?? "/",
				handler: resolve.relative(router.handler, root),
				target: router.target ?? "browser",
				outDir: router.outDir
					? join(appRoot, router.outDir)
					: join(appRoot, ".nitro", "build", router.name),
				// @ts-ignore
				internals: {},
				order: order ?? 0,
			};

			buildRouter.internals = {
				mode: routerModes.build,
				routes: router.routes
					? router.routes(buildRouter, appConfig)
					: undefined,
				devServer: undefined,
			};

			return buildRouter;
		},
	}),
	handler: createRouterMode(handlerRouterSchema, {
		name: "handler",
		dev: {
			plugins: async (router) => {
				const { ROUTER_MODE_DEV_PLUGINS } = await import(
					"./router-dev-plugins.js"
				);
				return await ROUTER_MODE_DEV_PLUGINS.handler(router);
			},
			handler: async (router, app, serveConfig) => {
				const { eventHandler } = await import("../runtime/server.js");
				if (router.mode === "handler" && router.worker && isMainThread) {
					if (!router.internals.appWorker) {
						const { AppWorkerClient } = await import("./app-worker-client.js");
						router.internals.appWorker = new AppWorkerClient(
							new URL("./app-worker.js", import.meta.url),
						);
					}
					return {
						route: router.base,
						handler: eventHandler(async (event) => {
							invariant(
								router.internals.appWorker,
								"Router App Worker not initialized",
							);
							await router.internals.appWorker.init(() => {});
							await router.internals.appWorker.handle(event);
						}),
					};
				}

				const { createViteHandler } = await import("./dev-server.js");
				const viteDevServer = await createViteHandler(router, app, serveConfig);
				const handler = eventHandler(async (event) => {
					const { default: handler } = await viteDevServer.ssrLoadModule(
						"#vinxi/handler",
					);
					return handler(event);
				});
				return {
					route: router.base,
					handler,
				};
			},
		},
		resolveConfig(router, appConfig, order) {
			invariant(router.mode === "handler", "Invalid router mode");
			const appRoot = appConfig.root ?? process.cwd();
			const root = router.root ?? appRoot;
			/** @type {HandlerRouterSchema} */
			const handlerRouter = {
				...router,
				root,
				base: router.base ?? "/",
				// @ts-ignore
				internals: {},
				handler: resolve.relative(router.handler, root),
				middleware: resolve.relative(router.middleware, root),
				target: router.target ?? "server",
				outDir: router.outDir
					? join(appRoot, router.outDir)
					: join(appRoot, ".nitro", "build", router.name),
				order: order ?? 0,
			};

			handlerRouter.internals = {
				mode: routerModes.handler,
				routes: router.routes
					? router.routes(handlerRouter, appConfig)
					: undefined,
				devServer: undefined,
			};
			return handlerRouter;
		},
	}),
	spa: createRouterMode(spaRouterSchema, {
		name: "spa",
		dev: {
			plugins: async (router) => {
				const { ROUTER_MODE_DEV_PLUGINS } = await import(
					"./router-dev-plugins.js"
				);
				return await ROUTER_MODE_DEV_PLUGINS.spa(router);
			},
			handler: async (router, app, serveConfig) => {
				const { createViteHandler } = await import("./dev-server.js");
				const { createServerResponse } = await import("./http-stream.js");
				const {
					defineEventHandler,
					H3Event,
					createApp,
					fromNodeMiddleware,
					getRequestURL,
				} = await import("../runtime/server.js");

				const viteDevServer = await createViteHandler(router, app, serveConfig);

				if (router.handler.endsWith(".html")) {
					return {
						route: router.base,
						handler: defineEventHandler(
							fromNodeMiddleware(viteDevServer.middlewares),
						),
					};
				} else {
					viteDevServer.middlewares.stack =
						viteDevServer.middlewares.stack.filter(
							(m) =>
								![
									"viteIndexHtmlMiddleware",
									"viteHtmlFallbackMiddleware",
									"vite404Middleware",
									// @ts-expect-error
								].includes(m.handle.name),
						);
					const viteHandler = fromNodeMiddleware(viteDevServer.middlewares);

					return {
						route: router.base,
						handler: defineEventHandler(async (event) => {
							const response = await viteHandler(event);
							if (event.handled) {
								return;
							}
							const { default: handler } = await viteDevServer.ssrLoadModule(
								router.handler,
							);

							let html = "";
							const textDecoder = new TextDecoder();
							const smallApp = createApp();
							smallApp.use(handler);
							const text = await new Promise(async (resolve, reject) => {
								await smallApp.handler(
									new H3Event(
										event.node.req,
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

							const transformedHtml = await viteDevServer.transformIndexHtml(
								getRequestURL(event).href,
								text,
							);

							return transformedHtml;
						}),
					};
				}
			},
		},
		resolveConfig(router, appConfig, order) {
			invariant(router.mode === "spa", "Invalid router mode");
			const appRoot = appConfig.root ?? process.cwd();
			const root = router.root ?? appRoot;
			/** @type {SPARouterSchema} */
			const spaRouter = {
				...router,
				base: router.base ?? "/",
				root,
				// @ts-ignore
				internals: {},
				handler: resolve.relative(router.handler, root),
				target: router.target ?? "browser",
				outDir: router.outDir
					? join(appRoot, router.outDir)
					: join(appRoot, ".nitro", "build", router.name),
				order: order ?? 0,
			};

			spaRouter.internals = {
				mode: routerModes.spa,
				routes: router.routes ? router.routes(spaRouter, appConfig) : undefined,
				devServer: undefined,
			};

			return spaRouter;
		},
	}),
};
/**
 *
 * @param {RouterSchemaInput} router
 * @param {import("./app.js").AppOptions} appConfig
 * @param {number} order
 * @returns {RouterSchema}
 */
export function resolveRouterConfig(router, appConfig, order) {
	const routerMode =
		typeof router.mode === "string" ? routerModes[router.mode] : router.mode;

	const config = routerMode.resolveConfig(router, appConfig, order);
	config.internals.mode = routerMode;
	return config;
}
