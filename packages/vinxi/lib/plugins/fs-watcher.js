import { fileURLToPath } from "node:url";

import { normalize } from "../path.js";

/**
 *
 * @param {import('vite').FSWatcher} watcher
 * @param {import("../router-modes.js").RouterSchema} router
 */
function setupWatcher(watcher, router) {
	if (router.internals?.routes) {
		watcher.on("unlink", async (path) => {
			if (router.internals?.routes) {
				await router.internals?.routes.removeRoute(path);
			}
		});

		watcher.on("add", async (path) => {
			if (router.internals?.routes) {
				await router.internals?.routes.addRoute(path);
			}
		});

		watcher.on("change", async (path) => {
			if (router.internals?.routes) {
				await router.internals?.routes.updateRoute(path);
			}
		});
	}
}
export const fileSystemWatcher = () => {
	/** @type {import('../vite-dev.js').ViteConfig} */
	let config;

	/** @type {import('../vite-dev.js').Plugin} */
	const plugin = {
		name: "fs-watcher",
		apply: "serve",
		configResolved(resolvedConfig) {
			config = resolvedConfig;
		},
		configureServer(server) {
			if (config.router.internals?.routes) {
				setupWatcher(server.watcher, config.router);
				config.router.internals.routes.addEventListener("reload", () => {
					const { moduleGraph } = server;
					const mods = moduleGraph.getModulesByFile(
						normalize(fileURLToPath(new URL("../routes.js", import.meta.url))),
					);
					if (mods) {
						const seen = new Set();
						mods.forEach((mod) => {
							moduleGraph.invalidateModule(mod, seen);
						});
					}
					// debug.hmr("Reload generated pages.");
					server.ws.send({
						type: "full-reload",
					});
				});
			}
		},
	};
	return plugin;
};
