import { devEntries } from "./dev-server.js";
import invariant from "./invariant.js";
import { handlerModule, join } from "./path.js";
import { config } from "./plugins/config.js";
import { css } from "./plugins/css.js";
import { fileSystemWatcher } from "./plugins/fs-watcher.js";
import { manifest } from "./plugins/manifest.js";
import { routes } from "./plugins/routes.js";
import { treeShake } from "./plugins/tree-shake.js";
import { virtual } from "./plugins/virtual.js";

export const ROUTER_MODE_DEV_PLUGINS = {
	spa: (/** @type {import("./router-modes.js").SPARouterSchema} */ router) => [
		css(),
		routes(),
		devEntries(),
		manifest(),
		config("appType", {
			appType: "spa",
			ssr: {
				noExternal: ["vinxi"],
			},
			optimizeDeps: {
				exclude: ["vinxi"],
			},
			define: {
				"process.env.TARGET": JSON.stringify(process.env.TARGET ?? "node"),
			},
		}),
		treeShake(),
		router.internals.routes ? fileSystemWatcher() : null,
	],
	handler: (
		/** @type {import("./router-modes.js").HandlerRouterSchema} */ router,
	) => [
		virtual({
			[handlerModule(router)]: ({ config }) => {
				/** @type {import("./router-mode.js").Router<{ middleware?: string; }>} */
				const router = config.router;
				invariant(
					router.handler,
					"#vinxi/handler is only supported in handler mode",
				);

				if (router.middleware) {
					return `
					import middleware from "${join(router.root, router.middleware)}";
					import handler from "${join(router.root, router.handler)}"; 
					import { eventHandler } from "vinxi/server";
					export default eventHandler({ onRequest: middleware.onRequest, onBeforeResponse: middleware.onBeforeResponse, handler});`;
				}
				return `import handler from "${join(
					router.root,
					router.handler,
				)}"; export default handler;`;
			},
		}),
		routes(),
		devEntries(),
		manifest(),
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
		treeShake(),
		router.internals.routes ? fileSystemWatcher() : null,
	],
	build: (
		/** @type {import("./router-modes.js").BuildRouterSchema} */ router,
	) => [
		css(),
		virtual(
			{
				[handlerModule(router)]: ({ config }) => {
					invariant(config.router.handler, "");
					return `import * as mod from "${join(
						config.router.root,
						config.router.handler,
					)}"; export default mod['default']`;
				},
			},
			"handler",
		),
		routes(),
		devEntries(),
		manifest(),
		config("appType", {
			appType: "custom",
			ssr: {
				noExternal: ["vinxi"],
			},
			optimizeDeps: {
				exclude: ["vinxi"],
			},
			define: {
				"process.env.TARGET": JSON.stringify(process.env.TARGET ?? "node"),
			},
		}),
		treeShake(),
		router.internals.routes ? fileSystemWatcher() : null,
	],
};
