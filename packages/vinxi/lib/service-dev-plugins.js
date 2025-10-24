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

export const SERVICE_MODE_DEV_PLUGINS = {
	spa: (
		/** @type {import("./service-modes.js").SPAServicesSchema} */ service,
	) => [
		css(),
		routes(),
		devEntries(),
		manifest(),
		config("appType", {
			appType: "spa",
			ssr: {
				noExternal: ["vinxi", /@vinxi\//],
			},
			cacheDir: `node_modules/.vinxi/cache/${service.name}`,
			optimizeDeps: {
				exclude: ["vinxi"],
			},
			define: {
				"process.env.TARGET": JSON.stringify(process.env.TARGET ?? "node"),
			},
		}),
		treeShake(),
		service.internals.routes ? fileSystemWatcher() : null,
	],
	http: (
		/** @type {import("./service-modes.js").HTTPServicesSchema} */ service,
	) => [
		virtual({
			[handlerModule(service)]: ({ config }) => {
				/** @type {import("./service-mode.js").Service<{ middleware?: string; }>} */
				const service = config.service;
				invariant(
					service.handler,
					"$vinxi/handler is only supported in handler mode",
				);

				if (service.middleware) {
					return `
					import middleware from "${join(service.root, service.middleware)}";
					import handler from "${join(service.root, service.handler)}";
					import { eventHandler } from "vinxi/http";
					export default eventHandler({ onRequest: middleware.onRequest, onBeforeResponse: middleware.onBeforeResponse, handler, websocket: handler.__websocket__});`;
				}
				return `import handler from "${join(
					service.root,
					service.handler,
				)}"; export default handler;`;
			},
		}),
		routes(),
		devEntries(),
		manifest(),
		config("appType", {
			appType: "custom",
			ssr: {
				noExternal: ["vinxi", /@vinxi\//],
			},
			cacheDir: `node_modules/.vinxi/cache/${service.name}`,
			define: {
				"process.env.TARGET": JSON.stringify(process.env.TARGET ?? "node"),
			},
		}),
		treeShake(),
		config("handler:base", (service, app) => {
			const clientService = service.link?.client
				? app.getService(service.link?.client)
				: null;
			return {
				base: clientService ? clientService.base : service.base,
			};
		}),
		service.internals.routes ? fileSystemWatcher() : null,
	],
	client: (
		/** @type {import("./service-modes.js").ClientServiceSchema} */ service,
	) => [
		css(),
		virtual(
			{
				[handlerModule(service)]: ({ config }) => {
					invariant(config.service.handler, "");
					return `import * as mod from "${join(
						config.service.root,
						config.service.handler,
					)}"; export default mod['default']`;
				},
			},
			"http",
		),
		routes(),
		devEntries(),
		manifest(),
		config("appType", {
			appType: "custom",
			cacheDir: `node_modules/.vinxi/cache/${service.name}`,
			ssr: {
				noExternal: ["vinxi", /@vinxi\//],
			},
			optimizeDeps: {
				exclude: ["vinxi"],
			},
			define: {
				"process.env.TARGET": JSON.stringify(process.env.TARGET ?? "node"),
			},
		}),
		treeShake(),
		service.internals.routes ? fileSystemWatcher() : null,
	],
};
