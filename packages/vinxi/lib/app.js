import { join } from "pathe";
import { isMainThread } from "worker_threads";
import * as v from "zod";

import invariant, { InvariantError } from "./invariant.js";
import { resolve } from "./resolve.js";

export { resolve };
/**
 *
 * @param {RouterSchema} router
 * @param {AppOptions} appConfig
 * @returns {RouterSchema}
 */
function resolveConfig(router, appConfig) {
	switch (router.mode) {
		case "static":
			return {
				base: "/",
				root: appConfig.root,
				...router,
			};
		case "build":
			return {
				base: "/",
				root: appConfig.root,
				...router,
				handler: resolve.relative(router.handler, router, appConfig),
				compiled: router.style ? router.style(router, appConfig) : undefined,
				compile: {
					...(router.compile ?? {}),
					outDir: router.compile?.outDir
						? join(appConfig.root, router.compile.outDir)
						: join(appConfig.root, ".nitro", "build", router.name),
				},
			};
		case "handler":
			return {
				base: "/",
				root: appConfig.root,
				...router,
				handler: resolve.relative(router.handler, router, appConfig),
				middleware: resolve.relative(router.middleware, router, appConfig),
				compiled: router.style ? router.style(router, appConfig) : undefined,
				compile: {
					...(router.compile ?? {}),
					outDir: router.compile?.outDir
						? join(appConfig.root, router.compile.outDir)
						: join(appConfig.root, ".nitro", "build", router.name),
				},
			};
		case "spa":
			return {
				base: "/",
				root: appConfig.root,
				...router,
				handler: resolve.relative(router.handler, router, appConfig),
				compiled: router.style ? router.style(router, appConfig) : undefined,
				compile: {
					...(router.compile ?? {}),
					outDir: router.compile?.outDir
						? join(appConfig.root, router.compile.outDir)
						: join(appConfig.root, ".nitro", "build", router.name),
				},
			};
	}
}

/** @typedef {"static" | "build" | "spa" | "handler"} RouterModes  */
/** @type {[RouterModes, ...RouterModes[]]} */
const routerModes = ["static", "build", "spa", "handler"];

const staticRouterSchema = v.object({
	name: v.string(),
	base: v.string().default("/"),
	mode: v.literal("static"),
	dir: v.string(),
	root: v.optional(v.string()),
});

/** @typedef {v.infer<typeof staticRouterSchema>} StaticRouterSchema */

const buildRouterSchema = v.object({
	name: v.string(),
	base: v.string().default("/"),
	root: v.optional(v.string()),
	mode: v.literal("build"),
	handler: v.string(),
	/** @type {v.ZodType<RouterStyleFn, v.ZodTypeDef, RouterStyleFn>} */
	style: v.custom((value) => value !== null),
	extensions: v.array(v.string()).optional(),
	compile: v.object({
		outDir: v.string().optional(),
		target: v.literal("browser"),
		plugins: v.optional(v.custom((value) => typeof value === "function")),
	}),
});

/** @typedef {{ getRoutes(): Promise<any[]> }} CompiledRouter */
/** @typedef {(router: RouterSchema, app: AppOptions) => CompiledRouter} RouterStyleFn */
/** @typedef {v.infer<typeof buildRouterSchema> & { compiled?: CompiledRouter }} BuildRouterSchema */

const handlerRouterSchema = v.object({
	name: v.string(),
	base: v.string().default("/"),
	root: v.optional(v.string()),

	mode: v.literal("handler"),

	worker: v.optional(v.boolean()),
	handler: v.string(),
	middleware: v.optional(v.string()),
	/** @type {v.ZodType<RouterStyleFn, v.ZodTypeDef, RouterStyleFn>} */
	style: v.custom((value) => value !== null),
	compile: v.object({
		outDir: v.string().optional(),
		target: v.literal("server"),
		plugins: v.optional(v.custom((value) => typeof value === "function")),
	}),
});

/** @typedef {v.infer<typeof handlerRouterSchema> & { compiled?: CompiledRouter }} HandlerRouterSchema */

const spaRouterSchema = v.object({
	name: v.string(),
	base: v.string().default("/"),
	root: v.optional(v.string()),
	mode: v.literal("spa"),
	/** @type {v.ZodType<RouterStyleFn, v.ZodTypeDef, RouterStyleFn>} */
	style: v.custom((value) => value !== null),
	handler: v.string(),
	compile: v.object({
		outDir: v.string().optional(),
		target: v.literal("browser"),
		plugins: v.optional(v.custom((value) => typeof value === "function")),
	}),
});

/** @typedef {v.infer<typeof spaRouterSchema>  & { compiled?: CompiledRouter }} SPARouterSchema */

const routerSchema = {
	static: staticRouterSchema,
	build: buildRouterSchema,
	spa: spaRouterSchema,
	handler: handlerRouterSchema,
};

/** @typedef {(HandlerRouterSchema | BuildRouterSchema | SPARouterSchema | StaticRouterSchema) & { fileRouter?: any }} RouterSchema  */
/** @typedef {{ routers?: RouterSchema[]; name?: string; server?: import('nitropack').NitroConfig; root?: string }} AppOptions */
/** @typedef {{ config: { name: string; server: import('nitropack').NitroConfig; routers: RouterSchema[]; root: string; }; getRouter: (name: string) => RouterSchema & { devServer: import('vite').ViteDevServer } }} App */

/**
 *
 * @param {AppOptions} param0
 * @returns {App}
 */
export function createApp({ routers = [], name = "app", server = {} }) {
	routers = routers.map((router) => {
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

	const config = {
		name: name ?? "vinxi",
		routers,
		server,
		root: process.cwd(),
	};

	config.routers = routers.map((router, index) => {
		return {
			...resolveConfig(router, config),
			index,
		};
	});

	const app = {
		config,
		getRouter(name) {
			return config.routers.find((router) => router.name === name);
		},
		async serve() {
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
			await createBuild(app);
		},
	};

	if (process.argv.includes("--dev")) {
		app.serve();
	} else if (process.argv.includes("--build")) {
		app.build();
	}

	return app;
}
