import fg from "fast-glob";
import { pathToRegexp } from "path-to-regexp";
import { join } from "pathe";

export class FileSystemRouter {
	config;
	routes;
	constructor(config) {
		this.config = config;
		this.routes = fg
			.sync(join(config.dir, "**/*") + ".{ts,tsx,js,jsx}", {
				absolute: true,
			})

			.map((r) => {
				let path = r
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
				let keys = [];
				let regex = pathToRegexp(path, keys);
				return {
					regex,
					keys,
					component: r,
					path,
					filePath: r,
				};
			});
	}

	match(path) {
		return this.routes.find((r) => r.regex.exec(path));
	}
}
