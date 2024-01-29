import reactRefresh from "@vitejs/plugin-react";
import { createApp } from "vinxi";
import { resolve } from "vinxi";
import {
	BaseFileSystemRouter,
	analyzeModule,
	cleanPath,
} from "vinxi/fs-router";

export class TanstackFileRouter extends BaseFileSystemRouter {
	toPath(src) {
		const routePath = cleanPath(src, this.config)
			// remove the initial slash
			.slice(1)
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

	toRoute(src) {
		let path = this.toPath(src);

		const [_, exports] = analyzeModule(src);
		return {
			$component: {
				src: src,
				pick: ["default", "$css"],
			},

			path,
			filePath: src,
		};
	}
}

export function tanstackFileRouter(config) {
	return (router, app) =>
		new TanstackFileRouter(
			{
				dir: resolve.absolute(config.dir, router.root),
				extensions: config.extensions ?? ["js", "jsx", "ts", "tsx"],
			},
			router,
			app,
		);
}

export default createApp({
	routers: [
		{
			name: "public",
			type: "static",
			dir: "./public",
			base: "/",
		},
		{
			name: "client",
			type: "build",
			routes: tanstackFileRouter({ dir: "./app/pages" }),
			handler: "./app/client.tsx",
			target: "browser",
			plugins: () => [reactRefresh()],
			base: "/_build",
		},
		{
			name: "ssr",
			type: "handler",
			handler: "./app/server.tsx",
			routes: tanstackFileRouter({ dir: "./app/pages" }),
			target: "server",
		},
	],
});
