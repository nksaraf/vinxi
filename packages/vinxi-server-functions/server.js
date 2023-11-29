import {
	directives,
	splitPlugin,
	wrapExportsPlugin,
} from "@vinxi/plugin-directives";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { chunkify } from "vinxi/lib/chunks";
import { handlerModule, join, normalize } from "vinxi/lib/path";

import { CLIENT_REFERENCES_MANIFEST } from "./constants.js";

/**
 *
 * @returns {import('vinxi').Plugin[]}
 */
export function server({
	client = "client",
	resolve = {
		conditions: [],
	},
	transpileDeps = ["react", "react-dom", "@vinxi/react-server-dom"],
	manifest = CLIENT_REFERENCES_MANIFEST,
	runtime = normalize(
		fileURLToPath(new URL("./server-runtime.js", import.meta.url)),
	),
	// onReference
} = {}) {
	let isBuild;
	let input;
	return [
		directives({
			hash: chunkify,
			runtime: runtime,
			transforms: [
				wrapExportsPlugin({
					runtime: {
						module: runtime,
						function: "createServerReference",
					},
					// onModuleFound: (mod) => onReference("server", mod),
					hash: chunkify,
					apply: (code, id, options) => {
						return options.ssr;
					},
					pragma: "use server",
				}),
			],
			onReference(type, reference) {
				// if (type === "server") {
				// 	serverModules.add(reference);
				// } else {
				// 	clientModules.add(reference);
				// }
			},
		}),
		{
			name: "server-functions:build",
			enforce: "post",
			config(config, env) {
				isBuild = env.command === "build";
				// @ts-ignore
				const router = config.router;
				// @ts-ignore
				const app = config.app;

				if (isBuild) {
					const rscRouter = app.getRouter(client);

					const serverFunctionsManifest = JSON.parse(
						readFileSync(
							join(rscRouter.outDir, rscRouter.base, manifest),
							"utf-8",
						),
					);

					input = {
						entry: handlerModule(router),
						...Object.fromEntries(
							serverFunctionsManifest.server.map((key) => {
								return [chunkify(key), key];
							}),
						),
					};

					return {
						build: {
							rollupOptions: {
								output: {
									chunkFileNames: "[name].js",
								},
								treeshake: true,
							},
						},
						ssr: {
							resolve: {
								externalConditions: [
									...(resolve.conditions ?? []),
									"node",
									"import",
									process.env.NODE_ENV,
								],
								conditions: [
									...(resolve.conditions ?? []),
									"node",
									"import",
									process.env.NODE_ENV,
								],
							},
							noExternal: true,
						},
					};
				} else {
					return {
						ssr: {
							resolve: {
								externalConditions: [
									...(resolve.conditions ?? []),
									"node",
									"import",
									process.env.NODE_ENV,
								],
								conditions: [
									...(resolve.conditions ?? []),
									"node",
									"import",
									process.env.NODE_ENV,
								],
							},
							external: transpileDeps,
							noExternal: true,
						},
					};
				}
			},

			configResolved(config) {
				if (isBuild) {
					config.build.rollupOptions.input = input;
				}
			},
		},
	];
}
