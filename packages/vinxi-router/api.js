import {
	BaseFileSystemRouter,
	analyzeModule,
	cleanPath,
} from "vinxi/fs-router";
import { config } from "vinxi/plugins/config";
import tsconfigPaths from "vite-tsconfig-paths";

import { fileURLToPath } from "node:url";

class APIFileSystemRouter extends BaseFileSystemRouter {
	toPath(src) {
		const routePath = cleanPath(src, this.config)
			// remove the initial slash
			.slice(1)
			.replace(/index$/, "")
			.replace(/\[([^\/]+)\]/g, (_, m) => {
				if (m.length > 3 && m.startsWith("...")) {
					return `:${m.slice(3)}*`;
				}
				if (m.length > 2 && m.startsWith("[") && m.endsWith("]")) {
					return `:${m.slice(1, -1)}?`;
				}
				return `:${m}`;
			});

		return routePath?.length > 0 ? `/${routePath}` : "/";
	}

	toRoute(src) {
		let path = this.toPath(src);

		const [_, exports] = analyzeModule(src);
		const hasDefault = exports.find((e) => e.n === "default");

		if (hasDefault) {
			return {
				$handler: {
					src: src,
					pick: ["default"],
				},
				path,
				filePath: src,
			};
		}
	}
}

/**
 *
 * @param {{ plugins?: () => import('vinxi').Plugin[]; dir?: string; style?: any; base?: string; handler?: string }} param0
 * @returns {import('vinxi').RouterSchema}
 */
export function apiRouter({
	dir = "./app/api/routes",
	style = APIFileSystemRouter,
	base = "/api",
	handler = fileURLToPath(new URL("./handler.js", import.meta.url)),
	plugins = () => [],
} = {}) {
	return {
		name: "api",
		mode: "handler",
		base,
		dir,
		style,
		handler,
		build: {
			target: "server",
			plugins: () => [
				...((plugins?.() ?? []).filter(Boolean) ?? []),
				tsconfigPaths(),
				config("env-vars", {
					envPrefix: "PRIVATE_",
				}),
			],
		},
	};
}
