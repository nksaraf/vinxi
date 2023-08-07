import reactRefresh from "@vitejs/plugin-react";
import { readFileSync } from "fs";
import { join } from "path";
import { createApp } from "vinxi";
import {
	BaseFileSystemRouter,
	analyzeModule,
	cleanPath,
} from "vinxi/file-system-router";

import serverComponent from "./plugin.js";

class TanstackFileSystemRouter extends BaseFileSystemRouter {
	toPath(src) {
		const routePath = cleanPath(src, this.config)
			// remove the initial slash
			.slice(1)
			.replace(/index$/, "")
			.replace(/\[([^\/]+)\]/g, (_, m) => {
				if (m.length > 3 && m.startsWith("...")) {
					return `*${m.slice(3)}`;
				}
				if (m.length > 2 && m.startsWith("[") && m.endsWith("]")) {
					return `$${m.slice(1, -1)}?`;
				}
				return `$${m}`;
			});

		return routePath?.length > 0 ? `/${routePath}` : "/";
	}

	toRoute(src) {
		let path = this.toPath(src);

		const [_, exports] = analyzeModule(src);
		const hasLoader = exports.find((e) => e.n === "loader");
		const hasErrorBoundary = exports.find((e) => e.n === "ErrorBoundary");
		const hasLoading = exports.find((e) => e.n === "Loading");
		const hasConfig = exports.find((e) => e.n === "config");
		return {
			$component: {
				src: src,
				pick: ["default", "$css"],
			},
			$error: hasErrorBoundary
				? { src: src, pick: ["ErrorBoundary"] }
				: undefined,
			$loading: hasLoading ? { src: src, pick: ["Loading"] } : undefined,
			$$loader: hasLoader
				? {
						src: src,
						pick: ["loader"],
				  }
				: undefined,
			$$config: hasConfig ? { src: src, pick: ["config"] } : undefined,
			path,
			filePath: src,
		};
	}
}

function hash(str) {
	let hash = 0;

	for (let i = 0; i < str.length; i++) {
		hash += str.charCodeAt(i);
	}

	return hash;
}

function client() {
	const serverModules = new Set();
	const clientModules = new Set();
	return [
		serverComponent({
			hash: (e) => `c_${hash(e)}`,
			runtime: join(process.cwd(), "runtime.js"),
			onServerReference(reference) {
				serverModules.add(reference);
			},
			onClientReference(reference) {
				clientModules.add(reference);
			},
		}),
		{
			name: "clientttt",
			generateBundle() {
				this.emitFile({
					fileName: "react-client-manifest.json",
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
function serverAction() {
	let isBuild;
	let input;
	return {
		name: "server-action-components",
		config(config, env) {
			isBuild = env.command === "build";
			// @ts-ignore
			const router = config.router;
			// @ts-ignore
			const app = config.app;

			if (isBuild) {
				const rscRouter = app.getRouter("client");

				const reactClientManifest = JSON.parse(
					readFileSync(
						join(
							rscRouter.build.outDir,
							rscRouter.base,
							"react-client-manifest.json",
						),
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

				console.log(input);

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
						conditions: [
							"node",
							"import",
							"react-server",
							process.env.NODE_ENV,
						],
					},
					ssr: {
						noExternal: true,
					},
					// 	include: [
					// 		"@vinxi/react-server-dom-vite/client.browser",
					// 		"@vinxi/react-server-dom-vite/runtime",
					// 		"react",
					// 		"react-dom",
					// 	],
					// },
					// build: {
					// 	rollupOptions: {
					// 		// preserve the export names of the server actions in chunks
					// 		treeshake: true,
					// 		// required otherwise rollup will remove the exports since they are not used
					// 		// by the other entries
					// 		preserveEntrySignatures: "exports-only",
					// 		// manualChunks: (chunk) => {
					// 		//   // server references should be emitted as separate chunks
					// 		//   // so that we can load them individually when server actions
					// 		//   // are called. we need to do this in manualChunks because we don't
					// 		//   // want to run a preanalysis pass just to identify these
					// 		//   // if (serverModules.has(chunk)) {
					// 		//   //   return `${hash(chunk)}`;
					// 		//   // }
					// 		// },
					// 		// we want to control the chunk names so that we can load them
					// 		// individually when server actions are called
					// 		// chunkFileNames: "[name].js",
					// 		output: {
					// 			minifyInternalExports: false,
					// 			entryFileNames: (chunk) => {
					// 				return chunk.name + ".js";
					// 			},
					// 		},
					// 	},
					// },
				};
			} else {
				return {
					// optimizeDeps: {
					// 	include: [
					// 		"@vinxi/react-server-dom-vite",
					// 		"react-server-dom-vite",
					// 		"react",
					// 		"react-dom",
					// 	],
					// },
					// ssr: {
					// 	external: [
					// 		"react",
					// 		"react-dom",
					// 		"@vinxi/react-server-dom-vite",
					// 		"react-server-dom-vite",
					// 	],
					// },
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
			return `import * as mod_${index}_${modIndex} from '${join(
				router.build.outDir,
				router.base,
				chunk.file,
			)}';
								 chunks['${chunk.file}'] = mod_${index}_${modIndex}
								 `;
		})
		.join("\n");
	return chunks;
}

export default createApp({
	server: {
		plugins: ["#extra-chunks"],
		virtual: {
			"#extra-chunks": (app) => {
				const serverChunks = getChunks(app, "server", 0);

				return `
						 const chunks = {};
						 ${serverChunks}
						 export default function app() {
							 globalThis.$$chunks = chunks
						 }
					`;
			},
		},
	},
	routers: [
		{
			name: "public",
			mode: "static",
			dir: "./public",
		},
		{
			name: "client",
			mode: "spa",
			handler: "./index.html",
			dir: "./app/pages",
			style: TanstackFileSystemRouter,
			build: {
				target: "browser",
				plugins: () => [client(), reactRefresh()],
			},
			base: "/",
		},
		{
			name: "server",
			mode: "handler",
			base: "/_server",
			handler: "./app/server-action.tsx",
			build: {
				target: "node",
				plugins: () => [serverAction()],
			},
		},
	],
});
