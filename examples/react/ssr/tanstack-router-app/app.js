import reactRefresh from "@vitejs/plugin-react";
import { join } from "path";
import { createApp } from "vinxi";
import {
	BaseFileSystemRouter,
	analyzeModule,
	cleanPath,
} from "vinxi/file-system-router";
import { config } from "vinxi/lib/plugins/config";

class TanstackFileSystemRouter extends BaseFileSystemRouter {
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

export default createApp({
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
			dir: "./app/routes",
			style: TanstackFileSystemRouter,
			build: {
				target: "browser",
				plugins: () => [reactRefresh()],
			},
		},
		{
			name: "ssr",
			mode: "handler",
			handler: "./app/server.tsx",
			dir: "./app/routes",
			style: TanstackFileSystemRouter,
			build: {
				target: "node",
				plugins: () => [reactRefresh()],
			},
		},
	],
});
