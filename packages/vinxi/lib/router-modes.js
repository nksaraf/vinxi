import * as z from "zod";

import { isMainThread } from "node:worker_threads";

import { defineWebSocket } from "../runtime/http.js";
import invariant from "./invariant.js";
import { handlerModule, join } from "./path.js";
import { resolve } from "./resolve.js";

export { z };
/**
 * @typedef {{ routes?: CompiledRouter; devServer?: import('vite').ViteDevServer; appWorker?: import('./app-worker-client.js').AppWorkerClient; type: import("./router-mode.js").RouterMode }} Internals
 * @typedef {import('./fs-router.js').BaseFileSystemRouter} CompiledRouter
 * @typedef {(router: RouterSchemaInput, app: import("./app.js").AppOptions) => CompiledRouter} RouterStyleFn
 * */
export const staticRouterSchema = z.object({
	name: z.string(),
	base: z.optional(z.string().default("/")),
	type: z.literal("static").default("static"),
	dir: z.string(),
	root: z.optional(z.string()),
});
export const clientRouterSchema = z.object({
	name: z.string(),
	base: z.optional(z.string().default("/")),
	root: z.optional(z.string()),
	type: z.literal("client").default("client"),
	handler: z.string(),
	/** @type {z.ZodOptionalType<z.ZodType<RouterStyleFn, z.ZodTypeDef, RouterStyleFn>>} */
	routes: z.optional(z.custom((value) => value !== null)),
	extensions: z.array(z.string()).optional(),
	outDir: z.string().optional(),
	target: z.enum(["browser"]).default("browser").optional(),
	plugins: z.optional(z.custom((value) => typeof value === "function")),
});
export const httpRouterSchema = z.object({
	name: z.string(),
	base: z.optional(z.string().default("/")),
	root: z.optional(z.string()),

	type: z.literal("http").default("http"),
	build: z.optional(z.boolean()),
	worker: z.optional(z.boolean()),
	handler: z.string(),
	middleware: z.optional(z.string()),
	/** @type {z.ZodOptionalType<z.ZodType<RouterStyleFn, z.ZodTypeDef, RouterStyleFn>>} */
	routes: z.optional(z.custom((value) => value !== null)),
	outDir: z.string().optional(),
	target: z.enum(["server"]).default("server").optional(),
	plugins: z.optional(z.custom((value) => typeof value === "function")),
});
export const spaRouterSchema = z.object({
	name: z.string(),
	base: z.optional(z.string().default("/")),
	root: z.optional(z.string()),
	type: z.literal("spa").default("spa"),
	/** @type {z.ZodOptionalType<z.ZodType<RouterStyleFn, z.ZodTypeDef, RouterStyleFn>>} */
	routes: z.optional(z.custom((value) => value !== null)),
	handler: z.string(),
	outDir: z.string().optional(),
	target: z.enum(["browser"]).default("browser").optional(),
	plugins: z.optional(z.custom((value) => typeof value === "function")),
});
const customRouterSchema = z.object({
	name: z.string(),
	base: z.optional(z.string().default("/")),
	root: z.optional(z.string()),
	type: z.object({
		resolveConfig: z.function().args(z.any(), z.any()).returns(z.any()),
	}),
	/** @type {z.ZodOptionalType<z.ZodType<RouterStyleFn, z.ZodTypeDef, RouterStyleFn>>} */
	routes: z.optional(z.custom((value) => value !== null)),
	handler: z.string(),
	outDir: z.string().optional(),
	target: z.literal("server"),
	plugins: z.optional(z.custom((value) => typeof value === "function")),
});
export const routerSchema = {
	static: staticRouterSchema,
	client: clientRouterSchema,
	spa: spaRouterSchema,
	http: httpRouterSchema,
	custom: customRouterSchema,
};
/** @typedef {z.infer<typeof clientRouterSchema> & { outDir: string; base: string; order: number; root: string; internals: Internals }} ClientRouterSchema */
/** @typedef {z.infer<typeof customRouterSchema> & { outDir: string; base: string; order: number; root: string; internals: Internals }} CustomRouterSchema */
/** @typedef {z.infer<typeof staticRouterSchema> & { outDir: string; base: string; order: number; internals: Internals }} StaticRouterSchema */
/** @typedef {z.infer<typeof httpRouterSchema> & { outDir: string; base: string; order: number; root: string; internals: Internals }} HTTPRouterSchema */
/** @typedef {z.infer<typeof httpRouterSchema>} HandlerRouterInput */
/** @typedef {z.infer<typeof spaRouterSchema> & { outDir: string; base: string; order: number; root: string; internals: Internals }} SPARouterSchema */
/** @typedef {(HTTPRouterSchema | ClientRouterSchema | SPARouterSchema | StaticRouterSchema | CustomRouterSchema )} RouterSchema  */
/** @typedef {(z.infer<typeof clientRouterSchema> | z.infer<typeof staticRouterSchema> | z.infer<typeof spaRouterSchema> |  z.infer<typeof httpRouterSchema> | z.infer<typeof customRouterSchema>)} RouterSchemaInput  */

/**
 * @template X
 * @param {X} schema
 * @param {import("./router-mode.js").RouterMode<z.z.infer<X>>} mode
 * @returns {import("./router-mode.js").RouterMode<z.z.infer<X>>}
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
			invariant(router.type === "static", "Invalid router mode");
			const appRoot = appConfig.root ?? process.cwd();
			const root = resolve.absolute(router.root, appRoot) ?? appRoot;
			return {
				...router,
				base: router.base ?? "/",
				root,
				order: order ?? 0,
				internals: {
					type: routerModes.static,
				},
				outDir: join(appRoot, ".vinxi", "build", router.name),
			};
		},
	}),
	client: createRouterMode(clientRouterSchema, {
		name: "client",
		dev: {
			plugins: async (router) => {
				const { ROUTER_MODE_DEV_PLUGINS } = await import(
					"./router-dev-plugins.js"
				);
				return await ROUTER_MODE_DEV_PLUGINS.client(router);
			},
			handler: async (router, app, serveConfig) => {
				const { createViteHandler } = await import("./dev-server.js");
				const { joinURL } = await import("ufo");
				const { fromNodeMiddleware, eventHandler } = await import("h3");
				const viteDevServer = await createViteHandler(router, app, serveConfig);

				viteDevServer.middlewares.stack.unshift({
					route: "",
					handle: async (req, res, next) => {
						// console.log(req.url, req.originalURL)
						req.__preViteUrl = req.url;
						req.url = joinURL(
							app.config.server.baseURL ?? "",
							router.base,
							req.url,
						);
						await next();
						req.url = req.__preViteUrl;
					},
				});

				return {
					route: router.base,
					handler: eventHandler({
						handler: fromNodeMiddleware(viteDevServer.middlewares),
					}),
				};
			},
		},
		resolveConfig(router, appConfig, order) {
			invariant(router.type === "client", "Invalid router mode");
			const appRoot = appConfig.root ?? process.cwd();
			const root = resolve.absolute(router.root, appRoot) ?? appRoot;
			/** @type {ClientRouterSchema} */
			const buildRouter = {
				...router,
				root,
				base: router.base ?? "/",
				handler: resolve.relative(router.handler, root),
				target: router.target ?? "browser",
				outDir: router.outDir
					? join(appRoot, router.outDir)
					: join(appRoot, ".vinxi", "build", router.name),
				// @ts-ignore
				internals: {},
				order: order ?? 0,
			};

			buildRouter.internals = {
				type: routerModes.build,
				routes: router.routes
					? router.routes(buildRouter, appConfig)
					: undefined,
				devServer: undefined,
			};

			return buildRouter;
		},
	}),
	http: createRouterMode(httpRouterSchema, {
		name: "http",
		dev: {
			publicAssets: (router) => {
				/**
				 * Added here to support static asset imports. Vite transforms these using the server base path. During development it expects that the file system will be available. So we need to serve the whole src diectory (including node_modules) during dev.
				 */
				return {
					dir: join(router.root),
					baseURL: router.base,
					fallthrough: true,
				};
			},
			plugins: async (router) => {
				const { ROUTER_MODE_DEV_PLUGINS } = await import(
					"./router-dev-plugins.js"
				);
				return await ROUTER_MODE_DEV_PLUGINS.http(router);
			},
			handler: async (router, app, serveConfig) => {
				const { eventHandler, fromNodeMiddleware } = await import(
					"../runtime/http.js"
				);
				if (router.type === "http" && router.worker && isMainThread) {
					if (!router.internals.appWorker) {
						const { AppWorkerClient } = await import("./app-worker-client.js");
						router.internals.appWorker = new AppWorkerClient(
							new URL("./app-worker.js", import.meta.url),
						);
					}

					const handler = eventHandler(async (event) => {
						invariant(
							router.internals.appWorker,
							"Router App Worker not initialized",
						);
						await router.internals.appWorker.init(
							{ name: router.name, base: router.base },
							() => {},
						);
						await router.internals.appWorker.handle(event);
					});
					return [
						{
							route: `${router.base}/**`,
							handler,
						},
						{
							route: router.base,
							handler,
						},
					];
				}

				const { createViteHandler } = await import("./dev-server.js");
				const viteServer = await createViteHandler(router, app, serveConfig);
				const viteMiddleware = fromNodeMiddleware(viteServer.middlewares);

				function createHook(hook) {
					return async function callWebSocketHook(...args) {
						const { default: handler } = await viteServer.ssrLoadModule(
							handlerModule(router),
						);
						return await handler.__websocket__?.[hook]?.(...args);
					};
				}

				const handler = eventHandler({
					handler: async (event) => {
						await viteMiddleware(event);
						if (event.handled) {
							return;
						}
						const { default: handler } = await viteServer.ssrLoadModule(
							handlerModule(router),
						);
						return handler(event);
					},
					websocket: defineWebSocket({
						open: createHook("open"),
						close: createHook("close"),
						message: createHook("message"),
						error: createHook("error"),
						upgrade: createHook("upgrade"),
					}),
				});
				return [
					{
						route: `${router.base}/**`,
						handler,
					},
					{
						route: router.base,
						handler,
					},
				];
			},
		},
		resolveConfig(router, appConfig, order) {
			invariant(router.type === "http", "Invalid router mode");
			const appRoot = appConfig.root ?? process.cwd();
			const root = resolve.absolute(router.root, appRoot) ?? appRoot;
			/** @type {HTTPRouterSchema} */
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
					: join(appRoot, ".vinxi", "build", router.name),
				order: order ?? 0,
			};

			handlerRouter.internals = {
				type: routerModes.handler,
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
				} = await import("../runtime/http.js");
				const { joinURL } = await import("ufo");
				const viteDevServer = await createViteHandler(router, app, serveConfig);

				viteDevServer.middlewares.stack.unshift({
					route: "",
					handle: async (req, res, next) => {
						// console.log(req.url, req.originalURL)
						req.__preViteUrl = req.url;
						req.url = joinURL(
							app.config.server.baseURL ?? "",
							router.base,
							req.url,
						);
						await next();
						req.url = req.__preViteUrl;
					},
				});

				if (router.handler.endsWith(".html")) {
					return [
						{
							route: `${router.base}/**`,
							handler: defineEventHandler({
								handler: fromNodeMiddleware(viteDevServer.middlewares),
							}),
						},
						{
							route: router.base,
							handler: defineEventHandler({
								handler: fromNodeMiddleware(viteDevServer.middlewares),
							}),
						},
					];
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
								"/index.html",
								text,
								getRequestURL(event).href,
							);

							return transformedHtml;
						}),
					};
				}
			},
		},
		resolveConfig(router, appConfig, order) {
			invariant(router.type === "spa", "Invalid router mode");
			const appRoot = appConfig.root ?? process.cwd();
			const root = resolve.absolute(router.root, appRoot) ?? appRoot;
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
					: join(appRoot, ".vinxi", "build", router.name),
				order: order ?? 0,
			};

			spaRouter.internals = {
				type: routerModes.spa,
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
	// @ts-ignore backwards compat with router.mode for a few versions (TODO)
	router.type = router.type ?? router.mode;
	const routerMode =
		typeof router.type === "string" ? routerModes[router.type] : router.type;

	invariant(routerMode, `Invalid router type: ${router.type}`);

	const config = routerMode.resolveConfig(router, appConfig, order);
	config.internals.type = routerMode;
	return config;
}
