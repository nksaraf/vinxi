import { directives, splitPlugin } from "@vinxi/plugin-directives";
import { readFileSync } from "fs";
import { chunkify } from "vinxi/lib/chunks";
import { handlerModule, join } from "vinxi/lib/path";

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
	manifest = CLIENT_REFERENCES_MANIFEST,
} = {}) {
	let isBuild;
	let input;
	return [
		directives({
			hash: chunkify,
			runtime: "",
			transforms: [
				splitPlugin({
					runtime: {
						module: "",
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
									"node",
									"import",
									...(resolve.conditions ?? []),
									process.env.NODE_ENV,
								],
								conditions: [
									"node",
									"import",
									...(resolve.conditions ?? []),
									process.env.NODE_ENV,
								],
							},
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
