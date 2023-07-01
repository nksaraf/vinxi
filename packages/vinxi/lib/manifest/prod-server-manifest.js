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
					async assets() {
						let assets = {};
						assets[router.handler] = await this.inputs[router.handler].assets();
						for (const route of router.fileRouter?.routes ?? []) {
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
										path: join(
											router.bundler.outDir,
											router.prefix,
											chunk + ".js",
										),
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
									.filter(
										(id) =>
											id.match(/\.(ts|tsx|js|jsx)$/) &&
											bundlerManifest[id].isEntry,
									)
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
								if (
									router.bundler.target === "node" ||
									router.bundler.target === "node-web"
								) {
									return {
										output: {
											path: join(
												router.bundler.outDir,
												router.prefix,
												bundlerManifest[relative(process.cwd(), input)].file,
											),
										},
									};
								} else if (router.bundler.target === "browser") {
									return {
										assets() {
											return findAssetsInViteManifest(
												bundlerManifest,
												relative(process.cwd(), input),
											)
												.filter((asset) => asset.endsWith(".css"))
												.map((asset) => ({
													tag: "link",
													attrs: {
														href: join(router.prefix, asset),
														key: join(router.prefix, asset),
														rel: "stylesheet",
														precendence: "high",
													},
												}));
										},
										output: {
											path: join(
												router.prefix,
												bundlerManifest[relative(process.cwd(), input)].file,
											),
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
