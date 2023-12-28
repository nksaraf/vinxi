#!/usr/bin/env node
import { defineCommand, runMain } from "citty";
import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";

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
				const chokidar = await import("chokidar");
				const { loadApp } = await import("../lib/load-app.js");
				const { log, c } = await import("../lib/logger.js");
				log(c.dim(c.yellow(packageJson.version)));
				const configFile = args.config;
				globalThis.MANIFEST = {};
				const app = await loadApp(configFile, args);

				log(c.dim(c.green("starting dev server")));
				let devServer;
				/** @type {import('@vinxi/listhen').Listener} */
				let listener;
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
						log(c.dim(c.green("change detected in " + path)));
						log(c.dim(c.green("reloading app")));
						const newApp = await loadApp(configFile, args);
						if (!newApp) return;
						restartDevServer(newApp);
					});
				}
				async function createKeypressWatcher() {
					const { emitKeypressEvents } = await import("readline");
					emitKeypressEvents(process.stdin);
					process.stdin.on("keypress", async (_, key) => {
						switch (key.name) {
							case "r":
								restartDevServer(app);
								break;
							case "u":
								listener.showURL();
								break;
							case "q":
								process.exit(0);
							case "h":
								log("Shortcuts:\n");
								log("  r - Restart dev server");
								log("  u - Show server URL");
								log("  h - Show help");
						}
					});
				}
				async function restartDevServer(newApp) {
					const { createDevServer } = await import("../lib/dev-server.js");
					await devServer?.close();
					let preset =
						args.preset ??
						process.env.TARGET ??
						process.env.PRESET ??
						process.env.SERVER_PRESET ??
						process.env.SERVER_TARGET ??
						process.env.NITRO_PRESET ??
						process.env.NITRO_TARGET ??
						(process.versions.bun !== undefined ? "bun" : "node-server");

					devServer = await createDevServer(newApp, {
						force: args.force,
						devtools: args.devtools || Boolean(process.env.DEVTOOLS),
						port: Number(args.port ?? process.env.PORT ?? 3000),
						preset: preset,
					});
					log(c.dim(c.green("restarting dev server")));
					listener = await devServer.listen();
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
						log(c.dim(c.green("change detected in " + path)));
						log(c.dim(c.green("reloading app")));
						const newApp = await loadApp(configFile, args);
						if (!newApp) return;

						fsWatcher.close();
						createWatcher();
						restartDevServer(newApp);
					});
					return;
				}
				createWatcher();
				await createKeypressWatcher();
				const { createDevServer } = await import("../lib/dev-server.js");
				let preset =
					args.preset ??
					process.env.TARGET ??
					process.env.PRESET ??
					process.env.SERVER_PRESET ??
					process.env.SERVER_TARGET ??
					process.env.NITRO_PRESET ??
					process.env.NITRO_TARGET ??
					(process.versions.bun !== undefined ? "bun" : "node-server");
				devServer = await createDevServer(app, {
					force: args.force,
					port: Number(args.port ?? process.env.PORT ?? 3000),
					devtools: args.devtools || Boolean(process.env.DEVTOOLS),
					preset: preset,
				});
				listener = await devServer.listen();
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
				const { log, c } = await import("../lib/logger.js");
				args.preset ??=
					process.env.TARGET ??
					process.env.PRESET ??
					process.env.SERVER_PRESET ??
					process.env.SERVER_TARGET ??
					process.env.NITRO_PRESET ??
					process.env.NITRO_TARGET ??
					(process.versions.bun !== undefined ? "bun" : "node-server");

				log(c.dim(c.yellow(packageJson.version)));
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

				process.env.SERVER_PRESET ??=
					args.preset ??
					process.env.TARGET ??
					process.env.PRESET ??
					process.env.SERVER_PRESET ??
					process.env.SERVER_TARGET ??
					process.env.NITRO_PRESET ??
					process.env.NITRO_TARGET ??
					(process.versions.bun !== undefined ? "bun" : "node-server");

				console.log(process.env.SERVER_PRESET);

				switch (process.env.SERVER_PRESET) {
					case "node-server":
						await import(
							pathToFileURL(process.cwd() + "/.output/server/index.mjs").href
						);
						break;

					case "bun":
						if (process.versions.bun !== undefined) {
							await import(
								pathToFileURL(process.cwd() + "/.output/server/index.mjs").href
							);
						} else {
							const { $ } = await import("execa");

							const p = await $`bun run .output/server/index.mjs`.pipeStdout(
								process.stdout,
							);
						}
						break;
					default:
						log(
							"Couldn't run an app built with the ${} preset locally. Deploy the app to a provider that supports it.",
						);
				}
			},
		},
		deploy: {
			meta: {
				name: "deploy",
				version: packageJson.version,
				description: "Deploy your built Vinxi app to any provider",
			},
			args: {
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

				process.env.SERVER_PRESET ??=
					args.preset ??
					process.env.TARGET ??
					process.env.PRESET ??
					process.env.SERVER_PRESET ??
					process.env.SERVER_TARGET ??
					process.env.NITRO_PRESET ??
					process.env.NITRO_TARGET ??
					"node-server";

				switch (process.env.SERVER_PRESET) {
					case "node-server":
						await import(
							pathToFileURL(process.cwd() + "/.output/server/index.mjs").href
						);
						break;

					case "bun":
						const { $ } = await import("execa");

						await $`bun run .output/server/index.mjs`;
						break;
					default:
						log(
							"Couldn't run an app built with the ${} preset locally. Deploy the app to a provider that supports it.",
						);
				}
			},
		},
	}),
});

runMain(command);
