import { createApp, resolve } from "vinxi";
import {
	BaseFileSystemRouter,
	analyzeModule,
	cleanPath,
} from "vinxi/fs-router";
import solid from "vite-plugin-solid";

class SolidStartFileSystemRouter extends BaseFileSystemRouter {
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
					return `:${m.slice(1, -1)}?`;
				}
				return `:${m}`;
			});

		return routePath?.length > 0 ? `/${routePath}` : "/";
	}

	toRoute(src) {
		let path = this.toPath(src);

		const [_, exports] = analyzeModule(src);
		const hasRouteData = exports.find((e) => e.n === "routeData");
		return {
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
	}
}

function solidStartFileRouter(config) {
	return (router, app) =>
		new SolidStartFileSystemRouter(
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
			type: "client",
			handler: "./app/client.tsx",
			routes: solidStartFileRouter({
				dir: "./app/pages",
			}),
			target: "browser",
			plugins: () => [
				solid({
					ssr: true,
				}),
			],
			base: "/_build",
		},
		{
			name: "ssr",
			type: "http",
			handler: "./app/server.tsx",
			routes: solidStartFileRouter({
				dir: "./app/pages",
			}),
			target: "server",
			plugins: () => [solid({ ssr: true })],
		},
	],
});
