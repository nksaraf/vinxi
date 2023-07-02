import { isAbsolute, join, relative } from "pathe";

import { FileSystemRouter } from "../file-system-router.js";
// import { FileSystemRouter } from '../file-system-router.js'
import invariant from "../invariant.js";

// export async function createNodeMiddleware(app, router, serveConfig, server) {
//   const bunlderManifest = JSON.parse(
//     fs.readFileSync(
//       join(router.build.outDir, router.base, "manifest.json"),
//       "utf-8"
//     )
//   );

//   let handlerAsset = bunlderManifest[relative(router.root, router.handler)];

//   const manifest = createProdManifest(app);

//   let middleware = async (req, res) => {
//     const handler = await import(
//       join(router.build.outDir, router.base, handlerAsset.file)
//     );
//     let context = {
//       manifest,
//       base: router.base,
//       import: (id) => import(id),
//       router,
//       async fetchNode(request, response) {
//         await server.handle(request, response, () => {
//           throw new Error("No handler found");
//         });
//       },
//     };

//     if (router.fileRouter) {
//       context.match = router.fileRouter.match(req.url);
//     }

//     try {
//       await handler.default(req, res, context);
//     } catch (e) {
//       res.statusCode = 500;
//       res.end(this.renderError(e));
//     }
//   };

//   if (router.base) {
//     server.use(router.base, middleware);
//   } else {
//     server.use(middleware);
//   }
// }

// export async function devMiddleware(app, router, serveConfig, server) {
//   if (shouldCreateWorker(router.bundler) && isMainThread) {
//     router.worker = new AppWorkerClient(
//       new URL("./../worker/app-worker.js", import.meta.url)
//     );
//     await router.worker.init();
//     server.use(
//       router.base,
//       this.createNodeMiddleware(async (req, res, next) => {
//         await router.worker.fetchNode(req, res, {});
//       }, router)
//     );
//     return;
//   }

//   const devServer = await this.createDevServer(
//     router,
//     [
//       {
//         name: "node-handler-dev",
//         config() {
//           return {
//             appType: "custom",
//           };
//         },
//       },
//     ],
//     serveConfig
//   );

//   const manifest = createDevManifest(this, devServer);

//   let middleware = this.createNodeMiddleware(async (req, res, next) => {
//     let handler = await devServer.ssrLoadModule(router.handler);
//     invariant("default" in handler, "Handler should default export a function");

//     let context = {
//       manifest,
//       base: router.base,
//       router,
//       async fetchNode(request, response) {
//         let route = app.getRouter("react-rsc");
//         if (route.worker) {
//           await route.worker.fetchNode(request, response);
//         }
//       },
//       import: (id) => devServer.ssrLoadModule(id),
//     };

//     if (router.fileRouter) {
//       context.match = router.fileRouter.match(req.url);
//     }

//     try {
//       await handler.default(req, res, context);
//     } catch (e) {
//       res.statusCode = 500;
//       res.end(this.renderError(e));
//     }
//   }, router);

//   if (router.base) {
//     server.use(router.base, middleware);
//   } else {
//     server.use(middleware);
//   }
// }

export function resolveConfig(router, appConfig) {
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

	let fileRouter =
		routerStyle !== "static" && router.dir
			? new FileSystemRouter({ dir, style: router.style })
			: undefined;

	// invariant(
	// 	fileRouter ? router.handler : true,
	// 	"No handler found for SPA router. When `dir` is being used with `style` for file system routing, `handler` must be specified.",
	// );

	return {
		base: "/",
		...router,
		root: appConfig.root,
		dir,
		style: routerStyle,
		fileRouter,
		handler,
	};
}

// export const nodeHandler = createRouterMode({
//   name: "node-handler",
//   async prodMiddleware(router, serveConfig, server) {
//     const app = this;

//     const bundler = this.getBundler(router);
//     const bunlderManifest = JSON.parse(
//       fs.readFileSync(
//         join(bundler.outDir, router.base, "manifest.json"),
//         "utf-8"
//       )
//     );

//     let handlerAsset = bunlderManifest[relative(router.root, router.handler)];

//     const manifest = createProdManifest(app);

//     let middleware = async (req, res) => {
//       const handler = await import(
//         join(bundler.outDir, router.base, handlerAsset.file)
//       );
//       let context = {
//         manifest,
//         base: router.base,
//         import: (id) => import(id),
//         router,
//         async fetchNode(request, response) {
//           await server.handle(request, response, () => {
//             throw new Error("No handler found");
//           });
//         },
//       };

//       if (router.fileRouter) {
//         context.match = router.fileRouter.match(req.url);
//       }

//       try {
//         await handler.default(req, res, context);
//       } catch (e) {
//         res.statusCode = 500;
//         res.end(this.renderError(e));
//       }
//     };

//     if (router.base) {
//       server.use(router.base, middleware);
//     } else {
//       server.use(middleware);
//     }
//   },
//   async devMiddleware(router, serveConfig, server) {
//     const app = this;

//     if (shouldCreateWorker(router.bundler) && isMainThread) {
//       router.worker = new AppWorkerClient(
//         new URL("./../worker/app-worker.js", import.meta.url)
//       );
//       await router.worker.init();
//       server.use(
//         router.base,
//         this.createNodeMiddleware(async (req, res, next) => {
//           await router.worker.fetchNode(req, res, {});
//         }, router)
//       );
//       return;
//     }

//     const devServer = await this.createDevServer(
//       router,
//       [
//         {
//           name: "node-handler-dev",
//           config() {
//             return {
//               appType: "custom",
//             };
//           },
//         },
//       ],
//       serveConfig
//     );

//     const manifest = createDevManifest(this, devServer);

//     let middleware = this.createNodeMiddleware(async (req, res, next) => {
//       let handler = await devServer.ssrLoadModule(router.handler);
//       invariant(
//         "default" in handler,
//         "Handler should default export a function"
//       );

//       let context = {
//         manifest,
//         base: router.base,
//         router,
//         async fetchNode(request, response) {
//           let route = app.getRouter("react-rsc");
//           if (route.worker) {
//             await route.worker.fetchNode(request, response);
//           }
//         },
//         import: (id) => devServer.ssrLoadModule(id),
//       };

//       if (router.fileRouter) {
//         context.match = router.fileRouter.match(req.url);
//       }

//       try {
//         await handler.default(req, res, context);
//       } catch (e) {
//         res.statusCode = 500;
//         res.end(this.renderError(e));
//       }
//     }, router);

//     if (router.base) {
//       server.use(router.base, middleware);
//     } else {
//       server.use(middleware);
//     }
//   },
//   async build(router) {
//     const bundler = this.getBundler(router);

//     await createBuild({
//       router,
//       app: this,
//       bundler,
//       plugins: [build(), ...(bundler.plugins?.() ?? []), client()],
//     });

//     console.log("build done");
//   },
//   resolveConfig(router, appConfig) {
//     let handler = router.handler
//       ? isAbsolute(router.handler)
//         ? router.handler
//         : join(appConfig.root, router.handler)
//       : undefined;

//     invariant(handler, "No handler found for node-handler router");

//     let dir = router.dir
//       ? isAbsolute(router.dir)
//         ? router.dir
//         : join(appConfig.root, router.dir)
//       : undefined;

//     let routerStyle = router.style ?? "static";

//     invariant(
//       routerStyle !== "static" ? dir : true,
//       `There should be dir provided if the router style is ${routerStyle}`
//     );

//     let fileRouter =
//       routerStyle !== "static" && router.dir
//         ? new FileSystemRouter({ dir, style: router.style })
//         : undefined;

//     invariant(
//       fileRouter ? router.handler : true,
//       "No handler found for SPA router. When `dir` is being used with `style` for file system routing, `handler` must be specified."
//     );

//     return {
//       base: undefined,
//       ...router,
//       root: appConfig.root,
//       dir,
//       style: routerStyle,
//       fileRouter,
//       handler,
//     };
//   },
// });

// export function getEntries(router) {
//   return [
//     router.handler,
//     ...(router.fileRouter?.routes.map((r) => r.filePath) ?? []),
//   ];
// }

// /**
//  * @returns {import('vite').Plugin}
//  */
// function build() {
//   return {
//     name: "react-rsc:node-handler",
//     config(inlineConfig, env) {
//       if (env.command === "build") {
//         return {
//           build: {
//             rollupOptions: {
//               input: getEntries(inlineConfig.router),
//               external: [
//                 ...builtinModules,
//                 ...builtinModules.map((m) => `node:${m}`),
//               ],
//               treeshake: true,
//             },
//             ssr: true,
//             manifest: true,
//             target: "node18",
//             ssrEmitAssets: true,
//             outDir: join(
//               inlineConfig.build.outDir,
//               inlineConfig.router.base
//             ),
//             emptyOutDir: false,
//           },
//           define: {
//             "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
//           },
//           base: inlineConfig.router.base,
//           publicDir: false,
//         };
//       }
//     },
//   };
// }
