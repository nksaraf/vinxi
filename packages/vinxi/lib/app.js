// @ts-ignore
import { devtoolsClient, devtoolsRpc } from "@vinxi/devtools";
import { isMainThread } from "worker_threads";

import invariant, { InvariantError } from "./invariant.js";
import { resolveRouterConfig, routerSchema } from "./router-modes.js";

/** @typedef {{ devtools?: boolean; routers?: import("./router-modes.js").RouterSchemaInput[]; name?: string; server?: import('nitropack').NitroConfig; root?: string }} AppOptions */
/** @typedef {{ config: { name: string; devtools: boolean; server: import('nitropack').NitroConfig; routers: import("./router-mode.js").Router[]; root: string; }; getRouter: (name: string) => import("./router-mode.js").Router; dev(): Promise<void>; build(): Promise<void> }} App */

/**
 *
 * @param {AppOptions} param0
 * @returns {App}
 */
export function createApp({
	routers = [],
	name = "app",
	server = {},
	devtools = true,
	root = process.cwd(),
}) {
	if (devtools) {
		routers = [devtoolsClient(), devtoolsRpc(), ...routers];
	}

	const parsedRouters = routers.map((router) => {
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
		devtools,
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
					force: process.argv.includes("--force"),
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
