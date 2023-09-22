import reactRefresh from "@vitejs/plugin-react";
import { join } from "path";
import { createApp, resolve } from "vinxi";
import {
	BaseFileSystemRouter,
	analyzeModule,
	cleanPath,
} from "vinxi/file-system-router";

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

export default createApp({
	routers: [
		{
			name: "public",
			mode: "static",
			dir: "./public",
			base: "/",
		},
		{
			name: "api",
			mode: "handler",
			handler: "./app/api.ts",
			routes: (router, app) =>
				new APIFileSystemRouter(
					{
						dir: resolve.absolute("./app/api", router.root),
						extensions: ["js", "ts", "tsx", "jsx"],
					},
					router,
					app,
				),
			target: "server",
			// plugins: () => [reactRefresh()],
			base: "/api",
		},
		{
			name: "client",
			mode: "build",
			handler: "./app/entry-client.tsx",
			target: "browser",
			plugins: () => [reactRefresh()],
			base: "/_build",
		},
		{
			name: "ssr",
			mode: "handler",
			handler: "./app/entry-server.tsx",
			target: "server",
		},
	],
});
