#!/usr/bin/env node
import { defineCommand, runMain } from "citty";
import fs from "fs";
import { fileURLToPath } from "url";

const packageJson = JSON.parse(
	fs.readFileSync(
		fileURLToPath(new URL("../package.json", import.meta.url)),
		"utf-8",
	),
);

const command = defineCommand({
	meta: {
		name: "vinxi",
		version: packageJson.version,
		description: "Vinxi: The JavaScript/TypeScript Server SDK",
	},
	args: {
		config: {
			type: "string",
			description: "Path to config file (default: app.config.js)",
		},
	},
	subCommands: () => ({
		dev: {
			meta: {
				name: "dev",
				version: packageJson.version,
				description: "Start a Vinxi development server",
			},
			args: {
				config: {
					type: "string",
					description: "Path to config file (default: app.config.js)",
				},
				force: {
					type: "boolean",
					description: "Force optimize deps (default: false)",
				},
				devtools: {
					type: "boolean",
					description: "Enable devtools (default: false)",
				},
				port: {
					type: "number",
					description: "Port to listen on (default: 3000)",
				},
				host: {
					type: "boolean",
					description: "Expose to host (default: false)",
				},
				stack: {
					type: "string",
					description: "Stacks",
					alias: "s",
				},
			},
			async run({ args }) {
				const chokidar = await import("chokidar");
				const { loadApp } = await import("../lib/load-app.js");
				const { log } = await import("../lib/logger.js");
				const configFile = args.config;
				globalThis.MANIFEST = {};
				const app = await loadApp(configFile, args);

				let devServer;
				/** @type {import('chokidar').FSWatcher} */
				let watcher;

				function createWatcher() {
					watcher = chokidar.watch(
						["app.config.*", "vite.config.*", configFile].filter(Boolean),
						{
							ignoreInitial: true,
						},
					);
					watcher.on("all", async (ctx, path) => {
						log("change detected in", path);
						log("reloading app");
						const newApp = await loadApp(configFile, args);
						if (!newApp) return;
						restartDevServer(newApp);
					});
				}

				async function restartDevServer(newApp) {
					const { createDevServer } = await import("../lib/dev-server.js");
					await devServer?.close();
					devServer = await createDevServer(newApp, {
						force: args.force,
						devtools: args.devtools || Boolean(process.env.DEVTOOLS),
						port: Number(args.port ?? process.env.PORT ?? 3000),
					});
					log("restarting dev server");
					devServer.listen();
				}

				if (!app) {
					let fsWatcher = (watcher = chokidar.watch(
						["app.config.*", "vite.config.*", configFile].filter(Boolean),
						{
							ignoreInitial: true,
							persistent: true,
						},
					));
					fsWatcher.on("all", async (path) => {
						log("change detected in", path);
						log("reloading app");
						const newApp = await loadApp(configFile, args);
						if (!newApp) return;

						fsWatcher.close();
						createWatcher();
						restartDevServer(newApp);
					});
					return;
				}
				createWatcher();
				const { createDevServer } = await import("../lib/dev-server.js");
				devServer = await createDevServer(app, {
					force: args.force,
					port: Number(args.port ?? process.env.PORT ?? 3000),
					devtools: args.devtools || Boolean(process.env.DEVTOOLS),
				});
				devServer.listen();
			},
		},
		build: {
			meta: {
				name: "build",
				version: packageJson.version,
				description: "Build your Vinxi app",
			},
			args: {
				config: {
					type: "string",
					description: "Path to config file (default: app.config.js)",
				},
				stack: {
					type: "string",
					description: "Stacks",
				},
				preset: {
					type: "string",
					description: "Server preset (default: node-server)",
				},
			},
			async run({ args }) {
				const configFile = args.config;
				globalThis.MANIFEST = {};
				const { loadApp } = await import("../lib/load-app.js");
				const app = await loadApp(configFile, args);
				process.env.NODE_ENV = "production";
				const { createBuild } = await import("../lib/build.js");
				await createBuild(app, { preset: args.preset });
			},
		},
		start: {
			meta: {
				name: "start",
				version: packageJson.version,
				description: "Start your built Vinxi app",
			},
			args: {
				config: {
					type: "string",
					description: "Path to config file (default: app.config.js)",
				},
				stack: {
					type: "string",
					description: "Stacks",
				},
				preset: {
					type: "string",
					description: "Server preset (default: node-server)",
				},
				port: {
					type: "number",
					description: "Port to listen on (default: 3000)",
				},
				host: {
					type: "boolean",
					description: "Expose to host (default: false)",
				},
			},
			async run({ args }) {
				process.env.PORT ??= args.port ?? 3000;
				process.env.HOST ??= args.host ?? "0.0.0.0";
				await import(process.cwd() + "/.output/server/index.mjs");
			},
		},
	}),
});

runMain(command);
