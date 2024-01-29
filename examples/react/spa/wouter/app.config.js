import reactRefresh from "@vitejs/plugin-react";
import { createApp, resolve } from "vinxi";
import {
	BaseFileSystemRouter,
	analyzeModule,
	cleanPath,
} from "vinxi/fs-router";

class WouterFileSystemRouter extends BaseFileSystemRouter {
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

		// const [_, exports] = analyzeModule(src);
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

function wouterFileRouter(config) {
	return (router, app) =>
		new WouterFileSystemRouter(
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
		},
		{
			name: "client",
			type: "spa",
			handler: "./index.html",
			routes: wouterFileRouter({
				dir: "./app/pages",
			}),
			target: "browser",
			plugins: () => [reactRefresh()],
		},
	],
});
