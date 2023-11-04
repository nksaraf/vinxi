// @ts-ignore
import { createHooks } from "hookable";
import { isMainThread } from "worker_threads";

import invariant, { InvariantError } from "./invariant.js";
import { c, consola, log, withLogger } from "./logger.js";
import { resolveRouterConfig, routerSchema } from "./router-modes.js";

/** @typedef {{ 
	devtools?: boolean; 
	routers?: import("./router-modes.js").RouterSchemaInput[]; 
	name?: 
	string; 
	server?: import('nitropack').NitroConfig; 
	root?: string
}} AppOptions */

/** @typedef {{
	config: {
		name: string;
		devtools: boolean;
		server: import("nitropack").NitroConfig;
		routers: import("./router-mode.js").Router[];
		root: string;
	};
	addRouter: (router: any) => App;
	getRouter: (name: string) => import("./router-mode.js").Router;
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
	name = "vinxi",
	server = {},
	root = process.cwd(),
} = {}) {
	const hooks = createHooks();
	hooks.afterEach((result) => {
		const output = result.args[0].router
			? [c.yellow(result.args[0].router?.name), result.name]
			: [result.name];
		consola.log(c.blue("vinxi"), c.green("hook"), ...output);
	});
	// if (devtools) {
	// 	routers = [devtoolsClient(), devtoolsRpc(), ...routers];
	// }

	function parseRouter(router) {
		if (typeof router.mode === "string") {
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
					routers: parsedRouters,
					server,
					root,
				},
				index,
			),
		};
	}

	const parsedRouters = routers.map(parseRouter);

	const resolvedRouters = routers.map(resolveRouter);

	/** @type {{ name: string; devtools: boolean; server: import('nitropack').NitroConfig; routers: import("./router-mode.js").Router[]; root: string; }} */
	const config = {
		name: name ?? "vinxi",
		// @ts-ignore
		routers: resolvedRouters,
		server,
		root,
	};

	hooks.callHook("app:config-resolved", { config });

	/** @type {App} */
	const app = {
		config,
		hooks,
		addRouter(router) {
			const parsedRouter = parseRouter(router);
			const resolvedRouter = resolveRouter(parsedRouter, config.routers.length);
			config.routers.push(resolvedRouter);
			return app;
		},
		getRouter(/** @type {string} */ name) {
			const router = config.routers.find((router) => router.name === name);
			if (!router) {
				throw new InvariantError(`Router ${name} not found`);
			}
			return router;
		},
		async stack(stack) {
			await stack(app);
			return app;
		},
		async dev() {
			if (isMainThread) {
				const { createDevServer } = await import("./dev-server.js");
				await createDevServer(app, {
					port: Number(process.env.PORT ?? 3000),
					force: process.argv.includes("--force"),
					devtools:
						process.argv.includes("--devtools") ||
						Boolean(process.env.DEVTOOLS),
				});
			}
		},
		async build() {
			const { createBuild } = await import("./build.js");
			await withLogger({}, () => createBuild(app, {}));
		},
	};

	hooks.callHook("app:created", { app });

	if (process.argv.includes("--dev")) {
		withLogger({ router: { name }, requestId: "dev" }, () => app.dev());
	} else if (process.argv.includes("--build")) {
		app.build();
	}

	return app;
}
