import { moduleId } from "./routes.js";

/**
 *
 * @param {import('vite').FSWatcher} watcher
 * @param {import("../router-modes.js").CompiledRouter} routes
 */
function setupWatcher(watcher, routes) {
	watcher.on("unlink", (path) => routes.removeRoute(path));
	watcher.on("add", (path) => routes.addRoute(path));
	watcher.on("change", (path) => routes.updateRoute(path));
}

/**
 * @param {import('vite').ViteDevServer} server
 * @param {import("../router-modes.js").CompiledRouter} routes
 */
function createRoutesReloader(server, routes) {
	routes.addEventListener("reload", handleRoutesReload);
	return () => routes.removeEventListener("reload", handleRoutesReload);
	function handleRoutesReload() {
		const { moduleGraph } = server;
		const mod = moduleGraph.getModuleById(moduleId);
		if (mod) {
			const seen = new Set();
			moduleGraph.invalidateModule(mod, seen);
			server.reloadModule(mod);
		}
		if (!server.config.server.hmr) {
			server.ws.send({ type: "full-reload" });
		}
	}
}

export const fileSystemWatcher = () => {
	/** @type {import('vite').ResolvedConfig & { router: Exclude<import('../router-modes.js').RouterSchema, import('../router-modes.js').StaticRouterSchema> }} */
	let config;

	/** @type {undefined|(() => void)} */
	let close;

	/** @type {import('../vite-dev.js').Plugin} */
	const plugin = {
		name: "fs-watcher",
		apply: "serve",
		/**
		 * @param {import('vite').ResolvedConfig & { router: any }} resolvedConfig
		 */
		configResolved(resolvedConfig) {
			config = resolvedConfig;
		},
		configureServer(server) {
			const routes = config.router?.internals?.routes;
			if (routes) {
				setupWatcher(server.watcher, routes);
				close = createRoutesReloader(server, routes);
			}
		},
		closeBundle() {
			close?.();
		},
	};
	return plugin;
};
