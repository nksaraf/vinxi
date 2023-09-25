import invariant from "../invariant.js";
import { join, relative } from "../path.js";
import findAssetsInViteManifest from "./vite-manifest.js";

/** @typedef {import("../app.js").App & { config: { buildManifest: { [key:string]: any } }}} ProdApp */

/**
 *
 * @param {ProdApp} app
 * @returns
 */
export function createProdManifest(app) {
	const manifest = new Proxy(
		{},
		{
			get(target, routerName) {
				invariant(typeof routerName === "string", "Bundler name expected");
				const router = app.getRouter(routerName);
				const bundlerManifest = app.config.buildManifest[routerName];

				invariant(
					router.mode !== "static",
					"manifest not available for static router",
				);
				return {
					handler: router.handler,
					async assets() {
						/** @type {{ [key: string]: string[] }} */
						let assets = {};
						assets[router.handler] = await this.inputs[router.handler].assets();
						for (const route of (await router.internals.routes?.getRoutes()) ??
							[]) {
							assets[route.filePath] = await this.inputs[
								route.filePath
							].assets();
						}
						return assets;
					},
					async json() {
						/** @type {{ [key: string]: { output: string; assets: string[]} }} */
						let json = {};
						for (const input of Object.keys(this.inputs)) {
							json[input] = {
								output: this.inputs[input].output.path,
								assets: await this.inputs[input].assets(),
							};
						}
						return json;
					},
					chunks: new Proxy(
						{},
						{
							get(target, chunk) {
								invariant(typeof chunk === "string", "Chunk expected");
								return {
									output: {
										path: join(router.outDir, router.base, chunk + ".js"),
									},
								};
							},
						},
					),
					inputs: new Proxy(
						{},
						{
							ownKeys(target) {
								const keys = Object.keys(bundlerManifest)
									.filter((id) => bundlerManifest[id].isEntry)
									.map((id) => id);
								return keys;
							},
							getOwnPropertyDescriptor(k) {
								return {
									enumerable: true,
									configurable: true,
								};
							},
							get(target, input) {
								invariant(typeof input === "string", "Input expected");
								const id = input;
								if (router.target === "server") {
									const id =
										input === router.handler ? "virtual:#vinxi/handler" : input;
									return {
										assets() {
											return findAssetsInViteManifest(bundlerManifest, id)
												.filter((asset) => asset.endsWith(".css"))
												.map((asset) => ({
													tag: "link",
													attrs: {
														href: join(router.base, asset),
														key: join(router.base, asset),
														rel: "stylesheet",
														precendence: "high",
													},
												}));
										},
										output: {
											path: join(
												router.outDir,
												router.base,
												bundlerManifest[id].file,
											),
										},
									};
								} else if (router.target === "browser") {
									const id =
										input === router.handler && !input.endsWith(".html")
											? "virtual:#vinxi/handler"
											: input;
									return {
										assets() {
											return findAssetsInViteManifest(bundlerManifest, id)
												.filter((asset) => asset.endsWith(".css"))
												.map((asset) => ({
													tag: "link",
													attrs: {
														href: join(router.base, asset),
														key: join(router.base, asset),
														rel: "stylesheet",
														precendence: "high",
													},
												}));
										},
										output: {
											path: join(router.base, bundlerManifest[id].file),
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
