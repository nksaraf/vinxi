import { join } from "pathe";
import { isMainThread } from "worker_threads";
import * as v from "zod";

import invariant, { InvariantError } from "./invariant.js";
import { resolve } from "./resolve.js";

export { resolve };

/**
 * @typedef {{ routes?: CompiledRouter; devServer?: import('vite').ViteDevServer; appWorker?: import('./app-worker-client.js').AppWorkerClient; }} Internals
 * @typedef {{ getRoutes(): Promise<any[]>; } & EventTarget} CompiledRouter
 * @typedef {(router: RouterSchemaInput, app: AppOptions) => CompiledRouter} RouterStyleFn
 * */

const staticRouterSchema = v.object({
	name: v.string(),
	base: v.optional(v.string().default("/")),
	mode: v.literal("static"),
	dir: v.string(),
	root: v.optional(v.string()),
});

const buildRouterSchema = v.object({
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

const handlerRouterSchema = v.object({
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

const spaRouterSchema = v.object({
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

const routerSchema = {
	static: staticRouterSchema,
	build: buildRouterSchema,
	spa: spaRouterSchema,
	handler: handlerRouterSchema,
};

/** @typedef {v.infer<typeof buildRouterSchema> & { outDir: string; base: string; order: number; root: string; internals: Internals }} BuildRouterSchema */
/** @typedef {v.infer<typeof staticRouterSchema> & { outDir: string; base: string; order: number; internals?: Internals }} StaticRouterSchema */
/** @typedef {v.infer<typeof handlerRouterSchema> & { outDir: string; base: string; order: number; root: string; internals: Internals }} HandlerRouterSchema */
/** @typedef {v.infer<typeof spaRouterSchema> & { outDir: string; base: string; order: number; root: string; internals: Internals }} SPARouterSchema */
/** @typedef {(HandlerRouterSchema | BuildRouterSchema | SPARouterSchema | StaticRouterSchema)} RouterSchema  */
/** @typedef {(v.infer<typeof buildRouterSchema> | v.infer<typeof staticRouterSchema> | v.infer<typeof spaRouterSchema> |  v.infer<typeof handlerRouterSchema>)} RouterSchemaInput  */
/** @typedef {{ routers?: RouterSchemaInput[]; name?: string; server?: import('nitropack').NitroConfig; root?: string }} AppOptions */
/** @typedef {{ config: { name: string; server: import('nitropack').NitroConfig; routers: RouterSchema[]; root: string; }; getRouter: (name: string) => RouterSchema; dev(): Promise<void>; build(): Promise<void> }} App */

/**
 *
 * @param {RouterSchemaInput} router
 * @param {AppOptions} appConfig
 * @param {number} order
 * @returns {RouterSchema}
 */
function resolveRouterConfig(router, appConfig, order) {
	const appRoot = appConfig.root ?? process.cwd();
	const root = router.root ?? appRoot;
	switch (router.mode) {
		case "static":
			return {
				...router,
				base: router.base ?? "/",
				root,
				order,
				outDir: join(appRoot, ".nitro", "build", router.name),
			};
		case "build":
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
				internals: {},
				order,
			};

			buildRouter.internals = {
				routes: router.routes
					? router.routes(buildRouter, appConfig)
					: undefined,
				devServer: undefined,
			};

			return buildRouter;
		case "handler":
			/** @type {HandlerRouterSchema} */
			const handlerRouter = {
				...router,
				root,
				base: router.base ?? "/",
				internals: {},
				handler: resolve.relative(router.handler, root),
				middleware: resolve.relative(router.middleware, root),
				target: router.target ?? "server",
				outDir: router.outDir
					? join(appRoot, router.outDir)
					: join(appRoot, ".nitro", "build", router.name),
				order,
			};

			handlerRouter.internals = {
				routes: router.routes
					? router.routes(handlerRouter, appConfig)
					: undefined,
				devServer: undefined,
			};
			return handlerRouter;
		case "spa":
			/** @type {SPARouterSchema} */
			const spaRouter = {
				...router,
				base: router.base ?? "/",
				root,
				internals: {},
				handler: resolve.relative(router.handler, root),
				target: router.target ?? "browser",
				outDir: router.outDir
					? join(appRoot, router.outDir)
					: join(appRoot, ".nitro", "build", router.name),
				order,
			};

			spaRouter.internals = {
				routes: router.routes ? router.routes(spaRouter, appConfig) : undefined,
				devServer: undefined,
			};

			return spaRouter;
	}
}

/**
 *
 * @param {AppOptions} param0
 * @returns {App}
 */
export function createApp({
	routers = [],
	name = "app",
	server = {},
	root = process.cwd(),
}) {
	const parsedRouters = routers.map((router) => {
		invariant(
			router.mode in routerSchema,
			`Invalid router mode ${router.mode}`,
		);
		const result = routerSchema[router.mode].safeParse(router);
		if (result.success !== true) {
			const issues = result.error.issues.map((issue) => {
				return issue.path.map((p) => p).join(".") + " " + issue.message;
			});
			throw new InvariantError(
				`Errors in router configuration: ${router.name}\n${issues.join("\n")}`,
			);
		}
		return result.data;
	});

	const resolvedRouters = routers.map((router, index) => {
		return {
			...resolveRouterConfig(
				router,
				{
					name: name ?? "vinxi",
					// @ts-ignore
					routers: parsedRouters,
					server,
					root,
				},
				index,
			),
		};
	});

	const config = {
		name: name ?? "vinxi",
		routers: resolvedRouters,
		server,
		root,
	};

	/** @type {App} */
	const app = {
		config,
		getRouter(/** @type {string} */ name) {
			const router = config.routers.find((router) => router.name === name);
			if (!router) {
				throw new InvariantError(`Router ${name} not found`);
			}
			return router;
		},
		async dev() {
			if (isMainThread) {
				const { createDevServer } = await import("./dev-server.js");
				await createDevServer(app, {
					port: Number(process.env.PORT ?? 3000),
					dev: true,
				});
			}
		},
		async build() {
			const { createBuild } = await import("./build.js");
			await createBuild(app, {});
		},
	};

	if (process.argv.includes("--dev")) {
		app.dev();
	} else if (process.argv.includes("--build")) {
		app.build();
	}

	return app;
}
