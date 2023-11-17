import invariant from "../invariant.js";
import { isAbsolute, join, relative } from "../path.js";
import findStylesInModuleGraph from "./collect-styles.js";

/**
 *
 * @param {import("../app.js").App} app
 * @returns
 */
export function createDevManifest(app) {
	const manifest = new Proxy(
		{},
		{
			get(target, bundlerName) {
				invariant(typeof bundlerName === "string", "Bundler name expected");

				let router = app.getRouter(bundlerName);

				if (router.mode === "static") {
					return {
						json() {
							return {};
						},
						assets() {
							return {};
						},
						routes() {
							return [];
						},
						base: router.base,
						target: "static",
						mode: router.mode,
						handler: undefined,
						chunks: {},
						inputs: {},
					};
				}

				const viteServer = router.internals.devServer;
				return {
					json() {
						return {};
					},
					assets() {
						return {};
					},
					handler: router.handler,
					base: router.base,
					target: router.target,
					mode: router.mode,
					chunks: new Proxy(
						{},
						{
							get(target, chunk) {
								invariant(typeof chunk === "string", "Chunk expected");
								let absolutePath = isAbsolute(chunk)
									? chunk
									: join(app.config.root, chunk);
								invariant(
									router.mode != "static",
									"No manifest for static router",
								);

								if (router.target === "browser") {
									return {
										output: {
											path: join(router.base, "@fs", absolutePath),
										},
									};
								} else {
									return {
										import() {
											return router.internals.devServer?.ssrLoadModule(
												/* @vite-ignore */ absolutePath,
											);
										},
										output: {
											path: join(absolutePath),
										},
									};
								}
							},
						},
					),
					async routes() {
						return (await router.internals.routes?.getRoutes()) ?? [];
					},
					inputs: new Proxy(
						{},
						{
							// ownKeys(target) {
							// 	const keys = Object.keys(bundlerManifest)
							// 		.filter((id) => bundlerManifest[id].isEntry)
							// 		.map((id) => id);
							// 	return keys;
							// },
							getOwnPropertyDescriptor(k) {
								return {
									enumerable: true,
									configurable: true,
								};
							},
							get(target, input, receiver) {
								invariant(typeof input === "string", "Input string expected");
								let absolutePath = isAbsolute(input)
									? input
									: join(app.config.root, input);

								let relativePath = relative(app.config.root, input);
								invariant(
									router.mode != "static",
									"No manifest for static router",
								);

								let isHandler = router.handler === relativePath;

								async function getVitePluginAssets() {
									const plugins = router.internals?.devServer
										? router.internals.devServer.config.plugins.filter(
												(plugin) => "transformIndexHtml" in plugin,
										  )
										: [];
									let pluginAssets = [];
									for (let plugin of plugins) {
										// @ts-ignore
										let transformedHtml = await plugin.transformIndexHtml(
											"/",
											``,
											`/`,
										);

										if (!transformedHtml) continue;
										if (Array.isArray(transformedHtml)) {
											pluginAssets.push(...transformedHtml);
										} else if (transformedHtml.tags) {
											pluginAssets.push(...(transformedHtml.tags ?? []));
										}
									}

									return pluginAssets.map((asset, index) => {
										return {
											...asset,
											attrs: {
												...asset.attrs,
												key: `plugin-${index}`,
											},
										};
									});
								}

								if (router.target === "browser") {
									return {
										import() {
											return router.internals.devServer?.ssrLoadModule(
												/* @vite-ignore */ join(absolutePath),
											);
										},
										async assets() {
											return [
												...(viteServer
													? Object.entries(
															await findStylesInModuleGraph(
																viteServer,
																[
																	absolutePath.endsWith(".ts") &&
																	router.mode === "spa"
																		? undefined
																		: absolutePath,
																].filter(Boolean),
																false,
															),
													  ).map(([key, value]) => ({
															tag: "style",
															attrs: {
																type: "text/css",
																key,
																"data-vite-dev-id": key,
															},
															children: value,
													  }))
													: []),
												...(isHandler
													? [
															...(await getVitePluginAssets()),
															{
																tag: "script",
																attrs: {
																	key: "vite-client",
																	type: "module",
																	src: join(router.base, "@vite", "client"),
																},
															},
													  ]
													: []),
											].filter(Boolean);
										},
										output: {
											path: join(router.base, "@fs", absolutePath),
										},
									};
								} else {
									return {
										import() {
											return router.internals.devServer?.ssrLoadModule(
												/* @vite-ignore */ join(absolutePath),
											);
										},
										async assets() {
											return [
												...(viteServer
													? Object.entries(
															await findStylesInModuleGraph(
																viteServer,
																[input],
																true,
															),
													  ).map(([key, value]) => ({
															tag: "style",
															attrs: {
																type: "text/css",
																key,
																"data-vite-dev-id": key,
															},
															children: value,
													  }))
													: []),
											];
										},
										output: {
											path: absolutePath,
										},
									};
								}
							},
						},
					),
				};
			},
		},
	);

	return manifest;
}
