import fs from "fs";
import { createApp } from "vinxi";
import { pathToRegexp, readFiles } from "vinxi/file-system-router";
import solid from "vite-plugin-solid";

class SolidStartFileSystemRouter {
	routes;
	constructor(config) {
		function toPath(path, config) {
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
		this.routes = readFiles(config).map((src) => {
			let path = toPath(src, config);
			let keys = [];
			let regex = pathToRegexp(path, keys);
			const hasRouteData = fs.readFileSync(src, "utf-8").includes(" routeData");
			return {
				regex,
				keys,
				$component: {
					src: src,
					pick: ["default", "$css"],
				},
				$$data: hasRouteData
					? {
							src: src,
							pick: ["routeData"],
					  }
					: undefined,
				path,
				filePath: src,
			};
		});
	}
}

export default createApp({
	routers: [
		{
			name: "public",
			mode: "static",
			dir: "./public",
			base: "/",
		},
		{
			name: "client",
			mode: "build",
			handler: "./app/client.tsx",
			style: SolidStartFileSystemRouter,
			dir: "./app/pages",
			build: {
				target: "browser",
				plugins: () => [
					solid({
						ssr: true,
					}),
				],
			},
			base: "/_build",
		},
		{
			name: "ssr",
			mode: "handler",
			handler: "./app/server.tsx",
			dir: "./app/pages",
			style: SolidStartFileSystemRouter,
			build: {
				target: "node",
				plugins: () => [solid({ ssr: true })],
			},
		},
	],
});
