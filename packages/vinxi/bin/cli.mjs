#!/usr/bin/env node
import chokidar from "chokidar";
import mri from "mri";

import { exec } from "node:child_process";

import { loadApp } from "../lib/load-app.js";
import { log } from "../lib/logger.js";
import { resolve } from "../lib/path.js";

async function main() {
	const args = mri(process.argv.slice(2));
	const command = args._[0];
	const rootDir = resolve(args._[1] || ".");

	const configFile = args.config;
	globalThis.MANIFEST = {};
	const app = await loadApp(configFile);

	if (command === "dev") {
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
				const newApp = await loadApp(configFile);
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
				const newApp = await loadApp(configFile);
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
	} else if (command === "build") {
		process.env.NODE_ENV = "production";
		const { createBuild } = await import("../lib/build.js");
		await createBuild(app, {});
	} else if (command === "start") {
		exec(`node .output/dist/server.js`);
	} else {
		throw new Error(`Unknown command ${command}`);
	}
}
main().catch((err) => {
	console.error(err);
	process.exit(1);
});
