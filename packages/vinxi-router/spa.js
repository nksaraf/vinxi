import { config } from "vinxi/plugins/config";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 *
 * @param {{ plugins?: () => import('vinxi').Plugin[]; routes?: import("vinxi").RouterStyleFn; }} param0
 * @returns {import('vinxi').RouterSchemaInput}
 */
export function spaRouter({ plugins = () => [], routes = undefined } = {}) {
	return {
		name: "client",
		mode: "spa",
		handler: "./index.html",
		routes,
		target: "browser",
		plugins: () => [
			...((plugins?.() ?? []).filter(Boolean) ?? []),
			config("env-vars", {
				envPrefix: "PUBLIC_",
			}),
			tsconfigPaths(),
		],
	};
}
