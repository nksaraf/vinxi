import fs from "fs";
import { isAbsolute, join } from "pathe";
import serveStatic from "serve-static";

import invariant from "../invariant.js";
import { createRouterMode } from "../router-mode.js";

// export const name = "static";

export const stat = createRouterMode({
	name: "static",
	async prodMiddleware(router, serveConfig, server) {
		const bundler = this.getBundler(router);
		if (router.base) {
			server.use(router.base, serveStatic(join(bundler.outDir, router.base)));
		} else {
			server.use(serveStatic(bundler.outDir));
		}
	},
	async devMiddleware(router, serveConfig, server) {
		if (router.base) {
			server.use(router.base, serveStatic(router.dir));
		} else {
			server.use(serveStatic(router.dir));
		}
	},
	resolveConfig(router, appConfig) {
		let dir = router.dir
			? isAbsolute(router.dir)
				? router.dir
				: join(appConfig.root, router.dir)
			: undefined;

		invariant(dir, "No dir found for static router");

		return {
			base: undefined,
			...router,
			root: appConfig.root,
			dir,
		};
	},
	async build(router) {
		const bundler = this.getBundler(router);
		fs.promises.cp(router.dir, join(bundler.outDir, router.base), {
			recursive: true,
		});
	},
});
