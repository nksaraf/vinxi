import serverComponent from "@vinxi/react-server-dom-vite/plugin";
import reactRefresh from "@vitejs/plugin-react";
import { readFileSync } from "fs";
import { join } from "path";
import { createApp } from "vinxi";
import { virtual } from "vinxi/lib/plugins/virtual";

function hash(str) {
	let hash = 0;

	for (let i = 0; i < str.length; i++) {
		hash += str.charCodeAt(i);
	}

	return hash;
}

function serverComponents() {
	const serverModules = new Set();
	const clientModules = new Set();
	return [
		serverComponent({
			hash,
			onServerReference(reference) {
				serverModules.add(reference);
			},
			onClientReference(reference) {
				clientModules.add(reference);
			},
		}),
		reactRefresh(),
		{
			name: "react-rsc",
			handleHotUpdate({ file }) {
				// clear vite module cache so when its imported again, we will
				// fetch(`http://localhost:3000/__refresh`, {
				//   method: 'POST',
				//   headers: {'Content-Type': 'application/json'},
				//   body: JSON.stringify({file}),
				// })
				//   .then(() => {})
				//   .catch(err => console.error(err));
			},
			config(inlineConfig, env) {
				if (env.command === "build") {
					return {
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
					};
				} else {
					return {
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
							external: [
								"react",
								"react-dom",
								"react/jsx-dev-runtime",
								"@vinxi/react-server-dom-vite",
							],
						},
					};
				}
			},
			generateBundle() {
				this.emitFile({
					fileName: "react-server-manifest.json",
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
function clientComponents() {
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
				const rscRouter = app.getRouter("rsc");

				const reactServerManifest = JSON.parse(
					readFileSync(
						join(
							rscRouter.build.outDir,
							rscRouter.base,
							"react-server-manifest.json",
						),
						"utf-8",
					),
				);

				input = {
					entry: router.handler,
					...Object.fromEntries(
						reactServerManifest.client.map((key) => {
							return [hash(key), key];
						}),
					),
				};

				return {
					ssr: {
						external: ["react", "react-dom", "@vinxi/react-server-dom-vite"],
					},
					optimizeDeps: {
						include: [
							"@vinxi/react-server-dom-vite",
							"react-server-dom-vite",
							"react",
							"react-dom",
						],
					}, // optimizeDeps: {
					// 	include: [
					// 		"@vinxi/react-server-dom-vite/client.browser",
					// 		"@vinxi/react-server-dom-vite/runtime",
					// 		"react",
					// 		"react-dom",
					// 	],
					// },
					build: {
						rollupOptions: {
							// preserve the export names of the server actions in chunks
							treeshake: true,
							// required otherwise rollup will remove the exports since they are not used
							// by the other entries
							preserveEntrySignatures: "exports-only",
							// manualChunks: (chunk) => {
							//   // server references should be emitted as separate chunks
							//   // so that we can load them individually when server actions
							//   // are called. we need to do this in manualChunks because we don't
							//   // want to run a preanalysis pass just to identify these
							//   // if (serverModules.has(chunk)) {
							//   //   return `${hash(chunk)}`;
							//   // }
							// },
							// we want to control the chunk names so that we can load them
							// individually when server actions are called
							// chunkFileNames: "[name].js",
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
						include: [
							"@vinxi/react-server-dom-vite",
							"react-server-dom-vite",
							"react",
							"react-dom",
						],
					},
					ssr: {
						external: [
							"react",
							"react-dom",
							"@vinxi/react-server-dom-vite",
							"react-server-dom-vite",
						],
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

function viteServer() {
	let router;
	return [
		{
			configResolved(config) {
				router = config.router;
			},
			name: "vite-dev-server",
			configureServer(server) {
				globalThis.viteServers ??= {};
				globalThis.viteServers[router.name] = server;
			},
		},
		virtual({
			"#vite-dev-server": ({ env }) =>
				env.command === "build"
					? `export default undefined`
					: `export default viteServers['${router.name}']`,
		}),
	];
}

export default createApp({
	routers: [
		{
			name: "public",
			mode: "static",
			dir: "./public",
			base: "/",
		},
		{
			name: "rsc",
			worker: true,
			mode: "handler",
			base: "/_rsc",
			handler: "./app/react-server.tsx",
			build: {
				target: "node",
				plugins: () => [serverComponents()],
			},
		},
		{
			name: "client",
			mode: "build",
			handler: "./app/client.tsx",
			build: {
				target: "browser",
				plugins: () => [reactRefresh(), clientComponents()],
			},
			base: "/_build",
		},
		{
			name: "ssr",
			mode: "handler",
			handler: "./app/server.tsx",
			build: {
				target: "node",
				plugins: () => [reactRefresh(), viteServer(), clientComponents()],
			},
		},
	],
});
