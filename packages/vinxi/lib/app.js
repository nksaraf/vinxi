// @ts-ignore
import { createHooks } from "hookable";
import resolve from "resolve";
import { isMainThread } from "worker_threads";

import invariant, { InvariantError } from "./invariant.js";
import { c, consola, withLogger } from "./logger.js";
import { resolveRouterConfig, routerSchema } from "./router-modes.js";

/** @typedef {{
	devtools?: boolean;
	routers?: import("./router-modes.js").ServiceSchemaInput[];
	services?: import("./router-modes.js").ServiceSchemaInput[];
	name?:
	string;
	server?: Omit<import('nitropack').NitroConfig, 'handlers' | 'scanDirs' | 'appConfigFiles' | 'imports' | 'virtual' | 'dev'  | 'buildDir'> & { https?: import('@vinxi/listhen').HTTPSOptions | boolean };
	root?: string
	mode?: string
}} AppOptions */

/** @typedef {{
	config: {
		name: string;
		devtools: boolean;
		server: Omit<import('nitropack').NitroConfig, 'handlers' | 'scanDirs' | 'appConfigFiles' | 'imports' | 'virtual' | 'dev' | 'buildDir'> & { https?: import('@vinxi/listhen').HTTPSOptions | boolean };
		routers: import("./router-mode.js").Router[];
		services: import("./router-mode.js").Router[];
		root: string;
		mode?: string;
	};

	// @deprecated
	addRouter: (router: any) => App; 
	
	// @deprecated
	// addRouterPlugins: (apply: (router: import("./router-mode.js").Router) => boolean, plugins: () => any[]) => void;
	
	// @deprecated
	// getRouter: (name: string) => import("./router-mode.js").Router;
	
	addService: (service: import("./router-modes.js").ServiceSchemaInput) => App;
	addServicePlugins: (apply: (service: import("./router-modes.js").ServiceSchemaInput) => boolean, plugins: () => any[]) => void;
	getService: (name: string) => import("./router-modes.js").ServiceSchemaInput;
	resolveSync: (mod: string) => string;
	import: (mod: string) => Promise<any>;
	stack: (stack: (app: App) => void | Promise<void>) => Promise<App>;
	dev(): Promise<void>;
	build(): Promise<void>;
	hooks: import("hookable").Hookable;
}} App */

/**
 *
 * @param {AppOptions} param0
 * @returns {App}
 */
export function createApp({
	routers = [],
	services = routers,
	name = "vinxi",
	server = {},
	root = process.cwd(),
	mode,
} = {}) {
	const hooks = createHooks();
	hooks.afterEach((result) => {
		if (process.env.DEBUG) {
			const output = result.args[0].router
				? [c.yellow(result.args[0].router?.name), result.name]
				: [result.name];
			consola.log(
				c.dim(c.blue("vinxi")),
				c.dim(c.green("hook")),
				...output.map(c.dim),
			);
		}
	});
	// if (devtools) {
	// 	routers = [devtoolsClient(), devtoolsRpc(), ...routers];
	// }

	function parseRouter(router) {
		if (typeof router.type === "string") {
			invariant(
				router.type in routerSchema,
				`Invalid router mode ${router.type}`,
			);
			const result = routerSchema[router.type].safeParse(router);
			if (result.success !== true) {
				const issues = result.error.issues.map((issue) => {
					return issue.path.map((p) => p).join(".") + " " + issue.message;
				});
				throw new InvariantError(
					`Errors in router configuration: ${router.name}\n${issues.join(
						"\n",
					)}`,
				);
			}
			return result.data;
		}

		return router;
	}

	function resolveRouter(router, index) {
		return {
			...resolveRouterConfig(
				router,
				{
					name: name ?? "vinxi",
					// @ts-ignore
					services: parsedServices,
					routers: parsedServices,
					server,
					root,
					mode,
				},
				index,
			),
		};
	}

	const parsedServices = services.map(parseRouter);

	const resolvedServices = services.map(resolveRouter);

	/** @type {App['config']} */
	const config = {
		name: name ?? "vinxi",
		services: resolvedServices,
		routers: resolvedServices,
		devtools: false,
		server,
		root,
		mode,
	};

	hooks.callHook("app:config-resolved", { config });

	/** @type {App} */
	const app = {
		config,
		hooks,
		addService(service) {
			const parsedService = parseRouter(service);
			const resolvedService = resolveRouter(
				parsedService,
				config.services.length,
			);
			config.services.push(resolvedService);
			return app;
		},
		addRouter(router) {
			return app.addService(router);
		},
		addServicePlugins(apply, plugins) {
			const routers = app.config.routers.filter(apply);

			routers.forEach((router) => {
				if (router.plugins) {
					let prevPlugins = router.plugins;
					router.plugins = () => [
						...(plugins?.() ?? []),
						...(prevPlugins() ?? []),
					];
				} else if (router.plugins === undefined) {
					router.plugins = plugins;
				}
			});
		},
		resolveSync(mod) {
			return resolve.sync(mod, { basedir: config.root });
		},
		async import(mod) {
			const resolved = app.resolveSync(mod);
			return await import(resolved);
		},
		getService(/** @type {string} */ name) {
			const service = config.services.find((service) => service.name === name);
			if (!service) {
				throw new InvariantError(`Service ${name} not found`);
			}
			return service;
		},
		getRouter(/** @type {string} */ name) {
			return app.getService(name);
		},
		async stack(stack) {
			await stack(app);
			return app;
		},
		async dev() {
			if (isMainThread) {
				const { createDevServer } = await import("./dev-server.js");
				const devServer = await createDevServer(app, {
					port: Number(process.env.PORT ?? 3000),
					force: process.argv.includes("--force"),
					devtools:
						process.argv.includes("--devtools") ||
						Boolean(process.env.DEVTOOLS),
				});
				await devServer.listen();
			}
		},
		async build() {
			const { createBuild } = await import("./build.js");
			await withLogger({}, () =>
				createBuild({
					app,
					buildConfig: {
						mode: config.mode,
						preset: config.server.preset,
					},
					configFile: undefined,
				}),
			);
		},
	};

	hooks.callHook("app:created", { app });

	// We do this so that we can access the app in plugins using globalThis.app just like we do in production.
	// @ts-ignore
	globalThis.app = app;

	if (process.argv.includes("--dev")) {
		app.dev();
	} else if (process.argv.includes("--build")) {
		app.build();
	}

	return app;
}
