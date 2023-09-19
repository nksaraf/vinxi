import { resolve } from "vinxi";
import {
	BaseFileSystemRouter,
	analyzeModule,
	cleanPath,
} from "vinxi/file-system-router";

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

export function tanstackFileRouter(config) {
	return (router, app) =>
		new TanstackFileRouter(
			{
				dir: resolve.absolute(config.dir, router, app),
				extensions: config.extensions ?? ["js", "jsx", "ts", "tsx"],
			},
			router,
			app,
		);
}
