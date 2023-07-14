import fg from "fast-glob";
import { pathToRegexp } from "path-to-regexp";
import { join } from "pathe";

export { pathToRegexp };
export function readFiles(config) {
	return fg.sync(join(config.dir, "**/*") + ".{ts,tsx,js,jsx}", {
		absolute: true,
	});
}

function toNextJSPagesPath(path, config) {
	return path
		.slice(config.dir.length)
		.replace(/\.(ts|tsx|js|jsx)$/, "")
		.replace(/index$/, "")
		.replace(/\[([^\/]+)\]/g, (_, m) => {
			if (m.length > 3 && m.startsWith("...")) {
				return `*${m.slice(3)}`;
			}
			if (m.length > 2 && m.startsWith("[") && m.endsWith("]")) {
				return `:${m.slice(1, -1)}?`;
			}
			return `:${m}`;
		});
}

export class NextJSPagesFileSystemRouter {
	config;
	routes;
	constructor(config) {
		this.config = config;
		this.routes = readFiles(config).map((src) => {
			let path = toNextJSPagesPath(src, config);
			let keys = [];
			let regex = pathToRegexp(path, keys);
			return {
				regex,
				keys,
				$component: {
					src: src,
					pick: ["default", "$css"],
				},
				path,
				filePath: src,
			};
		});
	}

	match(path) {
		return this.routes.find((r) => r.regex.exec(path));
	}
}
