import reactRefresh from "@vitejs/plugin-react";
import { init, parse } from "es-module-lexer";
import esbuild from "esbuild";
import fs from "fs";
import { join } from "path";
import { createApp } from "vinxi";
import { glob, pathToRegexp } from "vinxi/file-system-router";

class TanstackFileSystemRouter {
	routes;
	constructor(config) {
		this.config = config;
	}

	async buildRoutes() {
		function toPath(path, config) {
			const routePath = path
				.slice(config.dir.length)
				.replace(/\.(ts|tsx|js|jsx)$/, "")
				.replace(/\/page$/, "/")
				.replace(/\/layout$/, "")
				.replace(/index$/, "")
				.replace(/\[([^\/]+)\]/g, (_, m) => {
					if (m.length > 3 && m.startsWith("...")) {
						return `*${m.slice(3)}`;
					}
					if (m.length > 2 && m.startsWith("[") && m.endsWith("]")) {
						return `$${m.slice(1, -1)}?`;
					}
					return `$${m}`;
				});

			return routePath?.length > 0 ? `${routePath}` : "/";
		}
		await init;
		this.routes = [
			...glob(join(this.config.dir, "**/(page|layout).tsx"), {
				absolute: true,
			}).map((src) => {
				console.log(src);
				let path = toPath(src, this.config);
				let keys = [];
				let regex = pathToRegexp(path, keys);

				const [_, exports] = parse(
					esbuild.transformSync(fs.readFileSync(src, "utf-8"), {
						jsx: "transform",
						format: "esm",
						loader: "tsx",
					}).code,
					src,
				);
				const hasLoader = exports.find((e) => e.n === "loader");
				const hasErrorBoundary = exports.find((e) => e.n === "ErrorBoundary");
				const hasLoading = exports.find((e) => e.n === "Loading");
				const hasConfig = exports.find((e) => e.n === "config");
				return {
					regex,
					keys,
					$component: {
						src: src,
						pick: ["default", "$css"],
					},
					$error: hasErrorBoundary
						? { src: src, pick: ["ErrorBoundary"] }
						: undefined,
					$loading: hasLoading ? { src: src, pick: ["Loading"] } : undefined,
					$$loader: hasLoader
						? {
								src: src,
								pick: ["loader"],
						  }
						: undefined,
					$$config: hasConfig ? { src: src, pick: ["config"] } : undefined,
					path,
					filePath: src,
				};
			}),
		];

		return this.routes;
	}

	buildRoutesPromise = undefined;

	async getRoutes() {
		if (!this.buildRoutesPromise) {
			this.buildRoutesPromise = this.buildRoutes();
		}
		return await this.buildRoutesPromise;
	}
}

export default createApp({
	routers: [
		{
			name: "public",
			mode: "static",
			dir: "./public",
		},
		{
			name: "client",
			mode: "spa",
			handler: "./index.html",
			dir: "./app/routes",
			root: "./app/root.tsx",
			style: TanstackFileSystemRouter,
			build: {
				babel: {
					plugins: [
						"@babel/plugin-syntax-jsx",
						["@babel/plugin-syntax-typescript", { isTSX: true }],
					],
				},
				target: "browser",
				plugins: () => [reactRefresh()],
			},
		},
	],
});
