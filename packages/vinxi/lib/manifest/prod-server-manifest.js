import { join, relative } from "pathe";

import invariant from "../invariant.js";
import findAssetsInViteManifest from "./vite-manifest.js";

export function createProdManifest(app) {
	const manifest = new Proxy(
		{},
		{
			get(target, routerName) {
				invariant(typeof routerName === "string", "Bundler name expected");
				const router = app.getRouter(routerName);
				const bundlerManifest = app.config.buildManifest[routerName];

				return {
					handler: router.handler,
					async assets() {
						let assets = {};
						assets[router.handler] = await this.inputs[router.handler].assets();
						for (const route of (await router.fileRouter?.getRoutes()) ?? []) {
							assets[route.filePath] = await this.inputs[
								route.filePath
							].assets();
						}
						return assets;
					},
					async json() {
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
										path: join(router.build.outDir, router.base, chunk + ".js"),
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
								if (
									router.build.target === "node" ||
									router.build.target === "node-web"
								) {
									return {
										assets() {
											return findAssetsInViteManifest(bundlerManifest, input)
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
												router.build.outDir,
												router.base,
												bundlerManifest[id].file,
											),
										},
									};
								} else if (router.build.target === "browser") {
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
