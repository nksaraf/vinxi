import { isAbsolute, join, relative } from "pathe";
import { isMainThread } from "worker_threads";

function resolveConfig(router, appConfig) {
	let handler = relative(
		appConfig.root,
		router.handler
			? isAbsolute(router.handler)
				? router.handler
				: join(appConfig.root, router.handler)
			: undefined,
	);

	// invariant(handler, "No handler found for node-handler router");

	let dir = router.dir
		? isAbsolute(router.dir)
			? router.dir
			: join(appConfig.root, router.dir)
		: undefined;

	let routerStyle = router.style ?? "static";

	// invariant(
	// 	routerStyle !== "static" ? dir : true,
	// 	`There should be dir provided if the router style is ${routerStyle}`,
	// );

	console.log(routerStyle, dir);
	let fileRouter =
		routerStyle !== "static" && router.dir
			? new routerStyle({ dir, style: router.style })
			: undefined;

	// invariant(
	// 	fileRouter ? router.handler : true,
	// 	"No handler found for SPA router. When `dir` is being used with `style` for file system routing, `handler` must be specified.",
	// );

	const buildConfig = router.build
		? {
				...router.build,
				outDir: router.build.outDir
					? join(appConfig.root, router.build.outDir)
					: join(appConfig.root, ".nitro", "build", router.name),
		  }
		: {
				outDir: join(appConfig.root, ".nitro", "build", router.name),
		  };

	return {
		base: "/",
		...router,
		build: buildConfig,
		root: appConfig.root,
		dir,
		style: routerStyle,
		fileRouter,
		handler,
	};
}

export function createApp({ routers, name }) {
	const config = {
		name: name ?? "vinxi",
		routers,
		root: process.cwd(),
	};

	// function resolveBuildConfig(bundler) {
	// 	let outDir = bundler.outDir ? join(config.root, bundler.outDir) : undefined;
	// 	return {
	// 		target: "static",
	// 		root: config.root,
	// 		...bundler,
	// 		outDir,
	// 	};
	// }

	config.routers = routers.map((router, index) => {
		return {
			...resolveConfig(router, config),
			index,
		};
	});

	globalThis.MANIFEST = new Proxy(
		{},
		{
			get(target, prop) {
				throw new Error("Manifest not yet ready");
			},
		},
	);

	const app = {
		config,
		getRouter(name) {
			return config.routers.find((router) => router.name === name);
		},
		async serve() {
			if (isMainThread) {
				const { createDevServer } = await import("./dev-server.js");
				await createDevServer(app, {
					port: 3000,
					dev: true,
				});
			}
		},
	};

	if (process.argv.includes("--dev")) {
		app.serve();
	}

	return app;
}
