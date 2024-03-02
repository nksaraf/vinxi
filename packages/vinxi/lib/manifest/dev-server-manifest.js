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

				let base = join(app.config.server.baseURL ?? "", router.base);

				if (router.type === "static") {
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
						base,
						target: "static",
						type: router.type,
						handler: undefined,
						chunks: {},
						inputs: {},
					};
				}

				const viteServer = router.internals.devServer;

				async function viteAssets(paths, ssr) {
					invariant(viteServer, "Vite server expected");
					return Object.entries(
						await findStylesInModuleGraph(
							viteServer,
							paths.filter(Boolean),
							ssr,
						),
					).map(([key, value]) => ({
						tag: "style",
						attrs: {
							type: "text/css",
							key,
							"data-vite-dev-id": key,
						},
						children: value,
					}));
				}
				return {
					json() {
						return {};
					},
					assets() {
						return {};
					},
					dev: {
						server: viteServer,
					},
					handler: router.handler,
					base,
					target: router.target,
					type: router.type,
					chunks: new Proxy(
						{},
						{
							get(target, chunk) {
								invariant(typeof chunk === "string", "Chunk expected");
								let absolutePath = isAbsolute(chunk)
									? chunk
									: join(app.config.root, chunk);
								invariant(
									router.type != "static",
									"No manifest for static router",
								);

								if (router.target === "browser") {
									return {
										output: {
											path: join(base, "@fs", absolutePath),
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
									router.type != "static",
									"No manifest for static router",
								);

								let isHandler = router.handler === relativePath;

								async function getVitePluginAssets() {
									const pluginList = router.internals?.devServer
										? router.internals.devServer.config.plugins
										: [];
									// @ts-ignore
									const indexHtmlTransformers = [];
									for (
										let i = 0, pre = 0, post = 0;
										i < pluginList.length;
										i++
									) {
										const plugin = pluginList[i];
										if (plugin != null && plugin.transformIndexHtml != null) {
											const order =
												typeof plugin.transformIndexHtml === "function"
													? null
													: plugin.transformIndexHtml.order ??
													  plugin.transformIndexHtml.enforce;
											const func =
												typeof plugin.transformIndexHtml === "function"
													? plugin.transformIndexHtml
													: "handler" in plugin.transformIndexHtml
													? plugin.transformIndexHtml.handler
													: plugin.transformIndexHtml.transform;
											if (order === "pre") {
												// @ts-ignore
												indexHtmlTransformers.splice(pre, 0, func);
												pre++;
											} else if (order === "post") {
												// @ts-ignore
												indexHtmlTransformers.splice(post, 0, func);
												post++;
											} else {
												// @ts-ignore
												indexHtmlTransformers.splice(
													Math.max(post - 1, 0),
													0,
													func,
												);
												post++;
											}
										}
									}
									let pluginAssets = [];
									// @ts-ignore
									for (let transformer of indexHtmlTransformers) {
										// @ts-ignore
										let transformedHtml = await transformer("/", ``, `/`);

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
													? (
															await viteAssets(
																[
																	absolutePath.endsWith(".ts") &&
																	router.type === "spa"
																		? undefined
																		: absolutePath,
																],
																false,
															)
													  ).filter(
															(asset) =>
																!asset.attrs.key.includes("vinxi-devtools"),
													  )
													: []),
												...(isHandler
													? [
															...(await getVitePluginAssets()),
															{
																tag: "script",
																attrs: {
																	key: "vite-client",
																	type: "module",
																	src: join(base, "@vite", "client"),
																},
															},
													  ]
													: []),
											].filter(Boolean);
										},
										output: {
											path: join(base, "@fs", absolutePath),
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
													? (await viteAssets([input], true)).filter(
															(asset) =>
																!asset.attrs.key.includes("vinxi-devtools"),
													  )
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
