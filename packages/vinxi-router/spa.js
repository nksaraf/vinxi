import { config } from "vinxi/lib/plugins/config";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 *
 * @param {{ plugins: () => import('vinxi').PluginOption[]; dir: string; style: string; }} param0
 * @returns {import('vinxi').RouterSchema}
 */
export function spaRouter({
	plugins = () => [],
	dir = undefined,
	style = undefined,
} = {}) {
	return {
		name: "client",
		mode: "spa",
		handler: "./index.html",
		dir,
		style,
		build: {
			target: "browser",
			plugins: () => [
				...((plugins?.() ?? []).filter(Boolean) ?? []),
				config("env-vars", {
					envPrefix: "PUBLIC_",
				}),
				tsconfigPaths(),
			],
		},
	};
}
