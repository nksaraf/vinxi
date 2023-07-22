import { isAbsolute, join, relative } from "pathe";

import invariant from "../invariant.js";
import findStylesInModuleGraph from "./collect-styles.js";

/**
 *
 * @param {import('../types.js').App} app
 * @returns
 */
export function createDevManifest(app) {
	const manifest = new Proxy(
		{},
		{
			get(target, bundlerName) {
				invariant(typeof bundlerName === "string", "Bundler name expected");

				let router = app.getRouter(bundlerName);

				const viteServer = router.devServer;
				return {
					json() {
						return {};
					},
					assets() {
						return {};
					},
					handler: router.handler,
					inputs: new Proxy(
						{},
						{
							get(target, input, receiver) {
								invariant(typeof input === "string", "Input string expected");
								let absolutePath = isAbsolute(input)
									? input
									: join(app.config.root, input);

								let relativePath = relative(app.config.root, input);

								let isHandler = router.handler === relativePath;
								let isDirEntry =
									router.dir && absolutePath.startsWith(router.dir);

								// invariant(
								// 	isHandler || isDirEntry,
								// 	`Could not find entry ${input} in any router with bundler ${bundlerName}`,
								// );

								async function getVitePluginAssets() {
									const plugins = router.devServer.config.plugins.filter(
										(plugin) => "transformIndexHtml" in plugin,
									);
									let pluginAssets = [];
									for (let plugin of plugins) {
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

								if (router.build.target === "browser") {
									return {
										async assets() {
											return [
												...Object.entries(
													await findStylesInModuleGraph(viteServer, [
														absolutePath,
													]),
												).map(([key, value]) => ({
													tag: "style",
													attrs: {
														type: "text/css",
														key,
														"data-vite-dev-id": key,
													},
													children: value,
												})),
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
										async assets() {
											return [
												...Object.entries(
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
												})),
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
