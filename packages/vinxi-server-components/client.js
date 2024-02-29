import { readFileSync } from "fs";
import { chunkify } from "vinxi/lib/chunks";
import { handlerModule, join } from "vinxi/lib/path";

import { SERVER_REFERENCES_MANIFEST } from "./constants.js";

/**
 *
 * @param {*} param0
 * @returns {import('vinxi').Plugin[]}
 */
export function client({
	server = "rsc",
	transpileDeps = ["react", "react-dom", "@vinxi/react-server-dom"],
	manifest = SERVER_REFERENCES_MANIFEST,
} = {}) {
	return [
		buildClientComponents({
			server,
			transpileDeps,
			manifest,
		}),
	];
}

/**
 *
 * @returns {import('vinxi').Plugin}
 */
export function buildClientComponents({
	server = "rsc",
	transpileDeps = ["react", "react-dom", "@vinxi/react-server-dom"],
	manifest = SERVER_REFERENCES_MANIFEST,
} = {}) {
	let isBuild;
	let input;
	return {
		name: "client-components",
		config(config, env) {
			isBuild = env.command === "build";
			// @ts-ignore
			const router = config.router;
			// @ts-ignore
			const app = config.app;

			if (isBuild) {
				const serverRouter = app.getRouter(server);

				const serverManifest = JSON.parse(
					readFileSync(
						join(serverRouter.outDir, serverRouter.base, manifest),
						"utf-8",
					),
				);

				input = {
					entry: handlerModule(router),
					...Object.fromEntries(
						serverManifest.client.map((key) => {
							return [chunkify(key), key];
						}),
					),
				};

				return {
					ssr: {
						external: transpileDeps,
					},
					optimizeDeps: {
						include: transpileDeps,
					},
					build: {
						rollupOptions: {
							// preserve the export names of the server actions in chunks
							treeshake: true,
							// required otherwise rollup will remove the exports since they are not used
							// by the other entries
							preserveEntrySignatures: "exports-only",
							output: {
								minifyInternalExports: false,
								entryFileNames: (chunk) => {
									return chunk.name + ".mjs";
								},
							},
						},
					},
				};
			} else {
				return {
					optimizeDeps: {
						include: transpileDeps,
					},
					ssr: {
						external: transpileDeps,
					},
				};
			}
		},

		configResolved(config) {
			if (isBuild) {
				config.build.rollupOptions.input = input;
			}
		},
	};
}
