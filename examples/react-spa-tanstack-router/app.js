import reactRefresh from "@vitejs/plugin-react";
import fs from "fs";
import { join } from "path";
import { createApp } from "vinxi";
import { pathToRegexp, readFiles } from "vinxi/file-system-router";

class TanstackFileSystemRouter {
	routes;
	constructor(config) {
		function toPath(path, config) {
			const routePath = path
				.slice(config.dir.length + 1)
				.replace(/\.(ts|tsx|js|jsx)$/, "")
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

			return routePath?.length > 0 ? `/${routePath}` : "/";
		}
		this.routes = [
			// {
			// 	path: "",
			// 	regex: /^\/$/,
			// 	keys: [],
			// 	$component: {
			// 		src: join(config.dir, "../root.tsx"),
			// 		pick: ["default", "$css"],
			// 	},
			// },
			...readFiles(config).map((src) => {
				let path = toPath(src, config);
				let keys = [];
				let regex = pathToRegexp(path, keys);
				const hasRouteData = fs.readFileSync(src, "utf-8").includes(" loader");
				const hasErrorBoundary = fs
					.readFileSync(src, "utf-8")
					.includes(" ErrorBoundary");
				const hasLoading = fs.readFileSync(src, "utf-8").includes(" Loading");
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
					$$loader: hasRouteData
						? {
								src: src,
								pick: ["loader"],
						  }
						: undefined,
					path,
					filePath: src,
				};
			}),
		];
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
			dir: "./app/pages",
			root: "./app/root.tsx",
			style: TanstackFileSystemRouter,
			build: {
				babel: {
					plugins: ["@babel/plugin-syntax-jsx"],
				},
				target: "browser",
				plugins: () => [reactRefresh()],
			},
		},
	],
});
