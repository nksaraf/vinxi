import { join } from "node:path";

import { devEntries } from "./dev-server.js";
import invariant from "./invariant.js";
import { config } from "./plugins/config.js";
import { css } from "./plugins/css.js";
import { fileSystemWatcher } from "./plugins/fs-watcher.js";
import { manifest } from "./plugins/manifest.js";
import { routes } from "./plugins/routes.js";
import { treeShake } from "./plugins/tree-shake.js";
import { virtual } from "./plugins/virtual.js";

export const ROUTER_MODE_DEV_PLUGINS = {
	spa: (
		/** @type {import("./app-router-mode.js").SPARouterSchema} */ router,
	) => [
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
		/** @type {import("./app-router-mode.js").HandlerRouterSchema} */ router,
	) => [
		virtual({
			"#vinxi/handler": ({ config }) => {
				// invariant(
				// 	config.router.mode === "handler",
				// 	"#vinxi/handler is only supported in handler mode",
				// );
				if (config.router.middleware) {
					return `
					import middleware from "${join(config.router.root, config.router.middleware)}";
					import handler from "${join(config.router.root, config.router.handler)}"; 
					import { eventHandler } from "vinxi/runtime/server";
					export default eventHandler({ onRequest: middleware.onRequest, onBeforeResponse: middleware.onBeforeResponse, handler});`;
				}
				return `import handler from "${join(
					config.router.root,
					config.router.handler,
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
		/** @type {import("./app-router-mode.js").BuildRouterSchema} */ router,
	) => [
		css(),
		virtual(
			{
				"#vinxi/handler": ({ config }) => {
					invariant(
						config.router.mode === "build",
						"#vinxi/handler is only supported in build mode",
					);
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
				force: true,
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
