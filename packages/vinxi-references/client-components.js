import { readFileSync } from "fs";
import { join } from "path";

import { SERVER_REFERENCES_MANIFEST, hash } from "./constants.js";

/**
 *
 * @returns {import('vinxi').PluginOption}
 */
export function clientComponents({
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
						join(serverRouter.build.outDir, serverRouter.base, manifest),
						"utf-8",
					),
				);

				input = {
					entry: router.handler,
					...Object.fromEntries(
						serverManifest.client.map((key) => {
							return [`c_${hash(key)}`, key];
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
									return chunk.name + ".js";
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
				// const reactServerManifest = JSON.parse(
				// 	readFileSync(".build/rsc/_rsc/react-server-manifest.json", "utf-8"),
				// );
				config.build.rollupOptions.input = input;
			}
		},
	};
}
