import { fileURLToPath } from "node:url";

import { join } from "../path.js";

/**
 *
 * @returns {import("../vite-dev.d.ts").Plugin[]}
 */
export function manifest() {
	/** @type {import("../service-modes.js").Router | undefined} */
	let service;
	/** @type {import("../app.js").App | undefined} */
	let app;

	return [
		{
			name: "vinxi:manifest",
			config(config) {
				service = config.service;
				app = config.app;

				if (!service || !app) {
					throw new Error("Missing service or app");
				}

				return {
					define: {
						"import.meta.env.MANIFEST": `globalThis.MANIFEST`,
						"import.meta.env.ROUTER_NAME": JSON.stringify(service.name),
						"import.meta.env.ROUTER_TYPE": JSON.stringify(service.type),
						"import.meta.env.ROUTER_HANDLER": JSON.stringify(service.handler),
						"import.meta.env.SERVICE_NAME": JSON.stringify(service.name),
						"import.meta.env.SERVICE_TYPE": JSON.stringify(service.type),
						"import.meta.env.SERVICE_HANDLER": JSON.stringify(service.handler),
						"import.meta.env.CWD": JSON.stringify(service.root),
						"import.meta.env.SERVER_BASE_URL": JSON.stringify(
							app.config.server.baseURL ?? "",
						),
						"import.meta.env.SERVICES": JSON.stringify(
							app.config.services.map((services) => services.name),
						),
						// @deprecated
						"import.meta.env.ROUTERS": JSON.stringify(
							app.config.services.map((service) => service.name),
						),
						"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
						"import.meta.env.DEVTOOLS": config.dev?.devtools
							? JSON.stringify(config.dev.devtools)
							: `false`,
						"import.meta._asyncContext": JSON.stringify(
							app.config.server.experimental?.asyncContext,
						),
					},
				};
			},
			async load(id) {
				if (id.startsWith("/@manifest")) {
					if (!service || !app) {
						throw new Error("Missing service or app");
					}

					const [path, query] = id.split("?");
					const params = new URLSearchParams(query);
					if (path.endsWith("assets")) {
						const id = params.get("id");
						if (!id) {
							throw new Error("Missing id to get assets.");
						}
						return `export default ${JSON.stringify(
							await globalThis.MANIFEST[service.name].inputs[id].assets(),
						)}`;
					}
				}
			},
		},
		injectVinxiClient(),
	];
}

/** @returns {import('vinxi').Plugin} */
export function injectVinxiClient() {
	/** @type {import('../service-mode.js').Service} */
	let service;
	/** @type {import('../app.js').App} */
	let app;
	return {
		name: "vinxi:inject-client-runtime",
		configResolved(config) {
			service = config.service;
			app = config.app;
		},
		apply: "serve",
		transformIndexHtml(html) {
			return [
				{
					tag: "script",
					attrs: {
						type: "module",
						src: join(
							app.config.server.baseURL ?? "",
							service.base,
							"@fs",
							`${fileURLToPath(
								new URL("../../runtime/client.js", import.meta.url),
							)}`,
						),
					},
				},
			];
		},
	};
}
