import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

import transformReferences from "./transform-references.js";

function hash(str) {
	let hash = 0;

	for (let i = 0; i < str.length; i++) {
		hash += str.charCodeAt(i);
	}

	return hash;
}

const manifest = `references-manifest.json`;

export function client() {
	const serverModules = new Set();
	const clientModules = new Set();
	return [
		transformReferences({
			hash: (e) => `c_${hash(e)}`,
			runtime: fileURLToPath(
				new URL("./references-runtime.js", import.meta.url),
			),
			onServerReference(reference) {
				serverModules.add(reference);
			},
			onClientReference(reference) {
				clientModules.add(reference);
			},
		}),
		{
			name: "references-manifest",
			generateBundle() {
				this.emitFile({
					fileName: manifest,
					type: "asset",
					source: JSON.stringify({
						server: [...serverModules],
						client: [...clientModules],
					}),
				});
			},
		},
	];
}
/**
 *
 * @returns {import('vinxi').PluginOption}
 */
export function server({ client = "client" } = {}) {
	let isBuild;
	let input;
	return {
		name: "server-references",
		config(config, env) {
			isBuild = env.command === "build";
			// @ts-ignore
			const router = config.router;
			// @ts-ignore
			const app = config.app;

			if (isBuild) {
				const rscRouter = app.getRouter(client);

				const reactClientManifest = JSON.parse(
					readFileSync(
						join(rscRouter.build.outDir, rscRouter.base, manifest),
						"utf-8",
					),
				);

				input = {
					entry: router.handler,
					...Object.fromEntries(
						reactClientManifest.server.map((key) => {
							return [`c_${hash(key)}`, key];
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
					resolve: {
						conditions: ["node", "import", process.env.NODE_ENV],
					},
					ssr: {
						noExternal: true,
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

function getChunks(app, routerName, modIndex) {
	const router = app.getRouter(routerName);
	const bundlerManifest = JSON.parse(
		readFileSync(
			join(router.build.outDir, router.base, "manifest.json"),
			"utf-8",
		),
	);

	const chunks = Object.entries(bundlerManifest)
		.filter(
			([name, chunk]) => chunk.file.startsWith("c_") && name !== router.handler,
		)
		.map(([name, chunk], index) => {
			const chunkPath = join(router.build.outDir, router.base, chunk.file);
			return `
				import * as mod_${index}_${modIndex} from '${chunkPath}';
				chunks['${chunk.file}'] = mod_${index}_${modIndex}
			`;
		})
		.join("\n");
	return chunks;
}

const serverPlugin = "#extra-chunks";
const serverPluginModule = (app) => {
	const serverChunks = getChunks(app, "server", 0);

	return `
			 const chunks = {};
			 ${serverChunks}
			 export default function app() {
				 globalThis.$$chunks = chunks
			 }
		`;
};

export const references = {
	serverPlugin,
	serverPluginModule,
	transformReferences,
	clientRouter: client,
	serverRouter: server,
};
