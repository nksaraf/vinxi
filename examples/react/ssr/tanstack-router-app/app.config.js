import reactRefresh from "@vitejs/plugin-react";
import { join } from "path";
import { createApp, resolve } from "vinxi";
import {
	BaseFileSystemRouter,
	analyzeModule,
	cleanPath,
} from "vinxi/fs-router";

function tanstackFileRouter(config) {
	class TanstackFileRouter extends BaseFileSystemRouter {
		glob() {
			return join(this.config.dir, "**/(page|layout).tsx");
		}
		toPath(src) {
			const routePath = cleanPath(src, this.config)
				// remove the initial slash
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

		toRoute(src) {
			let path = this.toPath(src);

			const [_, exports] = analyzeModule(src);
			const hasLoader = exports.find((e) => e.n === "loader");
			const hasErrorBoundary = exports.find((e) => e.n === "ErrorBoundary");
			const hasLoading = exports.find((e) => e.n === "Loading");
			const hasConfig = exports.find((e) => e.n === "config");
			return {
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
		}
	}

	return (router, app) =>
		new TanstackFileRouter(
			{
				dir: resolve.absolute(config.dir, router.root),
				extensions: config.extensions ?? ["ts", "tsx", "jsx", "js"],
			},
			router,
			app,
		);
}

export default createApp({
	server: {
		externals: {
			traceOptions: {
				conditions: ["default"],
			},
			inline: ["h3"],
		},
	},
	routers: [
		{
			name: "public",
			mode: "static",
			dir: "./public",
		},
		{
			name: "client",
			mode: "build",
			handler: "./app/client.tsx",
			routes: tanstackFileRouter({ dir: "./app/routes" }),
			target: "browser",
			plugins: () => [reactRefresh()],
		},
		{
			name: "ssr",
			mode: "handler",
			handler: "./app/server.tsx",
			routes: tanstackFileRouter({ dir: "./app/routes" }),
			target: "server",
			plugins: () => [reactRefresh()],
		},
	],
});
