import * as z from "zod";

import { isMainThread } from "node:worker_threads";

import { defineWebSocket } from "../runtime/http.js";
import invariant from "./invariant.js";
import { handlerModule, join } from "./path.js";
import { resolve } from "./resolve.js";

export { z };

const serverObjectSchema = z
	.object({
		hmr: z
			.object({
				protocol: z.string().optional(),
				host: z.string().optional(),
				port: z.number().optional(),
				clientPort: z.number().optional(),
				path: z.string().optional(),
				timeout: z.number().optional(),
				overlay: z.boolean().optional(),
				server: z.any().optional(),
			})
			.optional(),
	})
	.optional();

/**
 * @typedef {{ routes?: CompiledRouter; devServer?: import('vite').ViteDevServer; appWorker?: import('./app-worker-client.js').AppWorkerClient; type: import("./service-modes.js").ServiceMode }} Internals
 * @typedef {import('./fs-router.js').BaseFileSystemRouter} CompiledRouter
 * @typedef {(service: ServiceSchemaInput, app: import("./app.js").AppOptions) => CompiledRouter} RouterStyleFn
 * */
export const staticServiceSchema = z.object({
	name: z.string(),
	base: z.optional(z.string().default("/")),
	type: z.literal("static").default("static"),
	dir: z.string(),
	root: z.optional(z.string()),
	server: serverObjectSchema,
});
export const clientServiceSchema = z.object({
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
	babel: z.optional(
		z.object({
			plugins: z.array(z.any()).optional(),
		}),
	),
	server: serverObjectSchema,
});
export const httpServiceSchema = z.object({
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
	babel: z.optional(
		z.object({
			plugins: z.array(z.any()).optional(),
		}),
	),
	server: serverObjectSchema,
});
export const spaServiceSchema = z.object({
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
	babel: z.optional(
		z.object({
			plugins: z.array(z.any()).optional(),
		}),
	),
	server: serverObjectSchema,
});
const customServiceSchema = z.object({
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
	server: serverObjectSchema,
});
export const serviceSchema = {
	static: staticServiceSchema,
	client: clientServiceSchema,
	spa: spaServiceSchema,
	http: httpServiceSchema,
	custom: customServiceSchema,
};
/** @typedef {z.infer<typeof clientServiceSchema> & { outDir: string; base: string; order: number; root: string; internals: Internals }} ClientServiceSchema */
/** @typedef {z.infer<typeof customServiceSchema> & { outDir: string; base: string; order: number; root: string; internals: Internals }} CustomServiceSchema */
/** @typedef {z.infer<typeof staticServiceSchema> & { outDir: string; base: string; order: number; internals: Internals }} StaticServicesSchema */
/** @typedef {z.infer<typeof httpServiceSchema> & { outDir: string; base: string; order: number; root: string; internals: Internals }} HTTPServicesSchema */
/** @typedef {z.infer<typeof httpServiceSchema>} HandlerServiceInput */
/** @typedef {z.infer<typeof spaServiceSchema> & { outDir: string; base: string; order: number; root: string; internals: Internals }} SPAServicesSchema */
/** @typedef {(HTTPServicesSchema | ClientServiceSchema | SPAServicesSchema | StaticServicesSchema | CustomServiceSchema )} ServiceSchema  */
/** @typedef {(z.infer<typeof clientServiceSchema> | z.infer<typeof staticServiceSchema> | z.infer<typeof spaServiceSchema> |  z.infer<typeof httpServiceSchema> | z.infer<typeof customServiceSchema>)} ServiceSchemaInput  */

/**
 * @template X
 * @param {X} schema
 * @param {import("./service-modes.js").ServiceMode<z.z.infer<X>>} mode
 * @returns {import("./service-modes.js").ServiceMode<z.z.infer<X>>}
 */
export function createServiceMode(schema, mode) {
	return mode;
}

/** @type {Record<string, import("./service-modes.js").ServiceMode<any>>} */
const serviceModes = {
	static: createServiceMode(staticServiceSchema, {
		name: "static",
		dev: {
			publicAssets: (service) => {
				return {
					dir: service.dir,
					baseURL: service.base,
					fallthrough: true,
				};
			},
			plugins: () => {},
		},
		resolveConfig(service, appConfig, order) {
			invariant(service.type === "static", "Invalid service mode");
			const appRoot = appConfig.root ?? process.cwd();
			const root = resolve.absolute(service.root, appRoot) ?? appRoot;
			return {
				...service,
				base: service.base ?? "/",
				root,
				order: order ?? 0,
				internals: {
					type: serviceModes.static,
				},
				outDir: join(appRoot, ".vinxi", "build", service.name),
			};
		},
	}),
	client: createServiceMode(clientServiceSchema, {
		name: "client",
		dev: {
			plugins: async (service) => {
				const { SERVICE_MODE_DEV_PLUGINS: ROUTER_MODE_DEV_PLUGINS } =
					await import("./service-dev-plugins.js");
				return await ROUTER_MODE_DEV_PLUGINS.client(service);
			},
			handler: async (service, app, serveConfig) => {
				const { createViteHandler } = await import("./dev-server.js");
				const { joinURL } = await import("ufo");
				const { fromNodeMiddleware, eventHandler } = await import("h3");
				const viteDevServer = await createViteHandler(
					service,
					app,
					serveConfig,
				);

				viteDevServer.middlewares.stack.unshift({
					route: "",
					handle: async (req, res, next) => {
						// console.log(req.url, req.originalURL)
						req.__preViteUrl = req.url;
						req.url = joinURL(
							app.config.server.baseURL ?? "",
							service.base,
							req.url,
						);
						await next();
						req.url = req.__preViteUrl;
					},
				});

				return {
					route: service.base,
					handler: eventHandler({
						handler: fromNodeMiddleware(viteDevServer.middlewares),
					}),
				};
			},
		},
		resolveConfig(service, appConfig, order) {
			invariant(service.type === "client", "Invalid service mode");
			const appRoot = appConfig.root ?? process.cwd();
			const root = resolve.absolute(service.root, appRoot) ?? appRoot;
			/** @type {ClientServiceSchema} */
			const resolvedService = {
				...service,
				root,
				base: service.base ?? "/",
				handler: resolve.relative(service.handler, root),
				target: service.target ?? "browser",
				outDir: service.outDir
					? join(appRoot, service.outDir)
					: join(appRoot, ".vinxi", "build", service.name),
				// @ts-ignore
				internals: {},
				order: order ?? 0,
			};

			resolvedService.internals = {
				type: serviceModes.build,
				routes: service.routes
					? service.routes(resolvedService, appConfig)
					: undefined,
				devServer: undefined,
			};

			return resolvedService;
		},
	}),
	http: createServiceMode(httpServiceSchema, {
		name: "http",
		dev: {
			publicAssets: (service) => {
				/**
				 * Added here to support static asset imports. Vite transforms these using the server base path. During development it expects that the file system will be available. So we need to serve the whole src diectory (including node_modules) during dev.
				 */
				return {
					dir: join(service.root),
					baseURL: service.base,
					fallthrough: true,
				};
			},
			plugins: async (service) => {
				const { SERVICE_MODE_DEV_PLUGINS: ROUTER_MODE_DEV_PLUGINS } =
					await import("./service-dev-plugins.js");
				return await ROUTER_MODE_DEV_PLUGINS.http(service);
			},
			handler: async (service, app, serveConfig) => {
				const { eventHandler, fromNodeMiddleware } = await import(
					"../runtime/http.js"
				);
				if (service.type === "http" && service.worker && isMainThread) {
					if (!service.internals.appWorker) {
						const { AppWorkerClient } = await import("./app-worker-client.js");
						service.internals.appWorker = new AppWorkerClient(
							new URL("./app-worker.js", import.meta.url),
						);
					}

					const handler = eventHandler(async (event) => {
						invariant(
							service.internals.appWorker,
							"Router App Worker not initialized",
						);
						await service.internals.appWorker.init(
							{ name: service.name, base: service.base },
							() => {},
						);
						await service.internals.appWorker.handle(event);
					});
					return [
						{
							route: `${service.base}/**`,
							handler,
						},
						{
							route: service.base,
							handler,
						},
					];
				}

				const { createViteHandler } = await import("./dev-server.js");
				const viteServer = await createViteHandler(service, app, serveConfig);
				const viteMiddleware = fromNodeMiddleware(viteServer.middlewares);

				function createHook(hook) {
					return async function callWebSocketHook(...args) {
						const { default: handler } = await viteServer.ssrLoadModule(
							handlerModule(service),
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
							handlerModule(service),
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
						route: `${service.base}/**`,
						handler,
					},
					{
						route: service.base,
						handler,
					},
				];
			},
		},
		resolveConfig(service, appConfig, order) {
			invariant(service.type === "http", "Invalid service mode");
			const appRoot = appConfig.root ?? process.cwd();
			const root = resolve.absolute(service.root, appRoot) ?? appRoot;
			/** @type {HTTPServicesSchema} */
			const resolvedService = {
				...service,
				root,
				base: service.base ?? "/",
				// @ts-ignore
				internals: {},
				handler: resolve.relative(service.handler, root),
				middleware: resolve.relative(service.middleware, root),
				target: service.target ?? "server",
				outDir: service.outDir
					? join(appRoot, service.outDir)
					: join(appRoot, ".vinxi", "build", service.name),
				order: order ?? 0,
			};

			resolvedService.internals = {
				type: serviceModes.handler,
				routes: service.routes
					? service.routes(resolvedService, appConfig)
					: undefined,
				devServer: undefined,
			};
			return resolvedService;
		},
	}),
	spa: createServiceMode(spaServiceSchema, {
		name: "spa",
		dev: {
			plugins: async (service) => {
				const { SERVICE_MODE_DEV_PLUGINS: ROUTER_MODE_DEV_PLUGINS } =
					await import("./service-dev-plugins.js");
				return await ROUTER_MODE_DEV_PLUGINS.spa(service);
			},
			handler: async (service, app, serveConfig) => {
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
				const viteDevServer = await createViteHandler(
					service,
					app,
					serveConfig,
				);

				viteDevServer.middlewares.stack.unshift({
					route: "",
					handle: async (req, res, next) => {
						// console.log(req.url, req.originalURL)
						req.__preViteUrl = req.url;
						req.url = joinURL(
							app.config.server.baseURL ?? "",
							service.base,
							req.url,
						);
						await next();
						req.url = req.__preViteUrl;
					},
				});

				if (service.handler && service.handler.endsWith(".html")) {
					return [
						{
							route: `${service.base}/**`,
							handler: defineEventHandler({
								handler: fromNodeMiddleware(viteDevServer.middlewares),
							}),
						},
						{
							route: service.base,
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
						route: service.base,
						handler: defineEventHandler(async (event) => {
							const response = await viteHandler(event);
							if (event.handled) {
								return;
							}
							const { default: handler } = await viteDevServer.ssrLoadModule(
								service.handler,
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
		resolveConfig(service, appConfig, order) {
			invariant(service.type === "spa", "Invalid service mode");
			const appRoot = appConfig.root ?? process.cwd();
			const root = resolve.absolute(service.root, appRoot) ?? appRoot;
			/** @type {SPAServicesSchema} */
			const spaService = {
				...service,
				base: service.base ?? "/",
				root,
				// @ts-ignore
				internals: {},
				handler: resolve.relative(service.handler, root),
				target: service.target ?? "browser",
				outDir: service.outDir
					? join(appRoot, service.outDir)
					: join(appRoot, ".vinxi", "build", service.name),
				order: order ?? 0,
			};

			spaService.internals = {
				type: serviceModes.spa,
				routes: service.routes
					? service.routes(spaService, appConfig)
					: undefined,
				devServer: undefined,
			};

			return spaService;
		},
	}),
};
/**
 *
 * @param {ServiceSchemaInput} service
 * @param {import("./app.js").AppOptions} appConfig
 * @param {number} order
 * @returns {ServiceSchema}
 */
export function resolveServiceConfig(service, appConfig, order) {
	// @ts-ignore backwards compat with router.mode for a few versions (TODO)
	// @deprecated
	service.type = service.type ?? service.mode;
	const serviceMode =
		typeof service.type === "string"
			? serviceModes[service.type]
			: service.type;

	invariant(serviceMode, `Invalid service type: ${service.type}`);

	const config = serviceMode.resolveConfig(service, appConfig, order);
	config.internals.type = serviceMode;
	return config;
}
