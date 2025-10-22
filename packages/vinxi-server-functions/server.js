import { directives, wrapExportsPlugin } from "@vinxi/plugin-directives";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { chunkify } from "vinxi/lib/chunks";
import { handlerModule, join, normalize } from "vinxi/lib/path";

import { CLIENT_REFERENCES_MANIFEST } from "./constants.js";

export function serverTransform({ runtime }) {
	return directives({
		hash: chunkify,
		runtime: runtime,
		transforms: [
			wrapExportsPlugin({
				runtime: {
					module: runtime,
					function: "createServerReference",
				},
				hash: chunkify,
				apply: (code, id, options) => {
					return options.ssr;
				},
				pragma: "use server",
			}),
		],
		onReference(type, reference) {},
	});
}

/**
 *
 * @returns {import('vinxi').Plugin}
 */
export const serverBuild = ({ client, manifest }) => {
	let input;
	return {
		name: "server-functions:build",
		enforce: "post",
		apply: "build",
		config(config, env) {
			// @ts-ignore
			const service = config.service;
			// @ts-ignore
			const app = config.app;

			const rscService = app.getService(client);

			const serverFunctionsManifest = JSON.parse(
				readFileSync(
					join(rscService.outDir, rscService.base, manifest),
					"utf-8",
				),
			);

			input = {
				entry: handlerModule(service),
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
							chunkFileNames: "[name].mjs",
							entryFileNames: "[name].mjs",
						},
						treeshake: true,
					},
				},
			};
		},

		configResolved(config) {
			config.build.rollupOptions.input = input;
		},
	};
};

/**
 *
 * @returns {import('vinxi').Plugin[]}
 */
export function server({
	client = "client",
	manifest = CLIENT_REFERENCES_MANIFEST,
	runtime = normalize(
		fileURLToPath(new URL("./server-runtime.js", import.meta.url)),
	),
} = {}) {
	return [serverTransform({ runtime }), serverBuild({ client, manifest })];
}
