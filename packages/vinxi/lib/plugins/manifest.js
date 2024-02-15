import { fileURLToPath } from "node:url";

import { join } from "../path.js";

/**
 *
 * @returns {import("../vite-dev.d.ts").Plugin[]}
 */
export function manifest() {
	/** @type {import("../router-mode.js").Router | undefined} */
	let router;
	/** @type {import("../app.js").App | undefined} */
	let app;

	return [
		{
			name: "vinxi:manifest",
			config(config) {
				router = config.router;
				app = config.app;

				if (!router || !app) {
					throw new Error("Missing router or app");
				}

				return {
					define: {
						"import.meta.env.MANIFEST": `globalThis.MANIFEST`,
						"import.meta.env.ROUTER_NAME": JSON.stringify(router.name),
						"import.meta.env.ROUTER_TYPE": JSON.stringify(router.type),
						"import.meta.env.ROUTER_HANDLER": JSON.stringify(router.handler),
						"import.meta.env.CWD": JSON.stringify(router.root),
						"import.meta.env.SERVER_BASE_URL": JSON.stringify(
							app.config.server.baseURL ?? "",
						),
						"import.meta.env.ROUTERS": JSON.stringify(
							app.config.routers.map((router) => router.name),
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
					if (!router || !app) {
						throw new Error("Missing router or app");
					}

					const [path, query] = id.split("?");
					const params = new URLSearchParams(query);
					if (path.endsWith("assets")) {
						const id = params.get("id");
						if (!id) {
							throw new Error("Missing id to get assets.");
						}
						return `export default ${JSON.stringify(
							await globalThis.MANIFEST[router.name].inputs[id].assets(),
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
	/** @type {import('../router-mode.js').Router} */
	let router;
	/** @type {import('../app.js').App} */
	let app;
	return {
		name: "vinxi:inject-client-runtime",
		configResolved(config) {
			router = config.router;
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
							router.base,
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
