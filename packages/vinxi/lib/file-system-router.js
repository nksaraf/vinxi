import { init } from "es-module-lexer";
import { parse } from "es-module-lexer";
import esbuild from "esbuild";
import fg from "fast-glob";
import fs from "fs";
import micromatch from "micromatch";
import { join } from "path";
import { pathToRegexp } from "path-to-regexp";

export { pathToRegexp };

export const glob = (path) => fg.sync(path, { absolute: true });

export function cleanPath(src, config) {
	return src.slice(config.dir.length).replace(/\.(ts|tsx|js|jsx)$/, "");
}

export function analyzeModule(src) {
	return parse(
		esbuild.transformSync(fs.readFileSync(src, "utf-8"), {
			jsx: "transform",
			format: "esm",
			loader: "tsx",
		}).code,
		src,
	);
}

export class BaseFileSystemRouter {
	routes;
	constructor(config) {
		this.routes = [];
		this.config = config;
	}

	glob() {
		return join(this.config.dir, "**/*") + ".{ts,tsx,js,jsx}";
	}

	/**
	 * @returns {Promise<any[]>}
	 */
	async buildRoutes() {
		await init;
		glob(this.glob()).forEach((src) => {
			this.addRoute(src);
		});

		return this.routes;
	}

	/**
	 *
	 * @param {*} src
	 * @returns {boolean}
	 */
	isRoute(src) {
		return micromatch(src, this.glob());
	}

	/**
	 *
	 * @param {*} src
	 * @returns {string}
	 */
	toPath(src) {
		throw new Error("Not implemented");
	}

	/**
	 *
	 * @param {*} src
	 * @returns {object}
	 */
	toRoute(src) {
		let path = this.toPath(src);

		const [_, exports] = analyzeModule(src);

		if (!exports.find((e) => e.n === "default")) {
			console.warn("No default export", src);
		}

		return {
			$component: {
				src: src,
				pick: ["default", "$css"],
			},
			path,
			filePath: src,
		};
	}

	/**
	 * To be attached by vite plugin to the vite dev server
	 */
	update = undefined;

	_addRoute(route) {
		const existing = this.routes.find((r) => r.path === route.path);
		if (!existing) this.routes.push(route);
	}

	addRoute(src) {
		if (this.isRoute(src)) {
			this._addRoute(this.toRoute(src));
			this.update?.();
		}
	}

	updateRoute(src) {
		if (this.isRoute(src)) {
			// this.update?.();
		}
	}

	removeRoute(src) {
		if (this.isRoute(src)) {
			const path = this.toPath(src);
			this.routes = this.routes.filter((r) => r.path !== path);
			this.update?.();
		}
	}

	buildRoutesPromise = undefined;

	async getRoutes() {
		if (!this.buildRoutesPromise) {
			this.buildRoutesPromise = this.buildRoutes();
		}
		await this.buildRoutesPromise;
		return this.routes;
	}
}

// function toNextJSPagesPath(path, config) {
// 	return path
// 		.slice(config.dir.length)
// 		.replace(/\.(ts|tsx|js|jsx)$/, "")
// 		.replace(/index$/, "")
// 		.replace(/\[([^\/]+)\]/g, (_, m) => {
// 			if (m.length > 3 && m.startsWith("...")) {
// 				return `*${m.slice(3)}`;
// 			}
// 			if (m.length > 2 && m.startsWith("[") && m.endsWith("]")) {
// 				return `:${m.slice(1, -1)}?`;
// 			}
// 			return `:${m}`;
// 		});
// }

// export class NextJSPagesFileSystemRouter {
// 	config;
// 	routes;
// 	constructor(config) {
// 		this.config = config;
// 		this.routes = readFiles(config).map((src) => {
// 			let path = toNextJSPagesPath(src, config);
// 			let keys = [];
// 			let regex = pathToRegexp(path, keys);
// 			return {
// 				regex,
// 				keys,
// 				$component: {
// 					src: src,
// 					pick: ["default", "$css"],
// 				},
// 				path,
// 				filePath: src,
// 			};
// 		});
// 	}

// 	async getRoutes() {
// 		return this.routes;
// 	}

// 	async match(path) {
// 		return (await this.getRoutes()).find((r) => r.regex.exec(path));
// 	}
// }
