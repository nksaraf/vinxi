import { config } from "vinxi/plugins/config";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 *
 * @param {{ plugins?: () => import('vinxi').Plugin[] | Promise<import('vinxi').Plugin[]>; routes?: import("vinxi").RouterStyleFn; }} param0
 * @returns {import('vinxi').ServiceSchemaInput}
 */
export function spaRouter({
	plugins = () => [],
	routes = undefined,
	...options
} = {}) {
	return {
		type: "spa",
		name: "client",
		handler: "./index.html",
		target: "browser",
		...options,
		routes,
		plugins: async () => [
			...(((await plugins?.()) ?? []).filter(Boolean) ?? []),
			config("env-vars", {
				envPrefix: "PUBLIC_",
			}),
			tsconfigPaths(),
		],
	};
}
