#!/usr/bin/env node
import chokidar from "chokidar";
import { defineCommand, runMain } from "citty";
import fs from "fs";
// import mri from "mri";
import { fileURLToPath } from "url";

import { exec } from "node:child_process";

import { loadApp } from "../lib/load-app.js";
import { log } from "../lib/logger.js";

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
						port: Number(process.env.PORT ?? 3000),
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
					port: Number(process.env.PORT ?? 3000),
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
				const app = await loadApp(configFile, args);
				process.env.NODE_ENV = "production";
				const { createBuild } = await import("../lib/build.js");
				await createBuild(app, { preset: args.preset });
			},
		},
	}),
});

runMain(command);
