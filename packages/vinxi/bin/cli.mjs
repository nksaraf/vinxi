#!/usr/bin/env node
import mri from "mri";

import { loadApp } from "../lib/load-app.js";
import { resolve } from "../lib/path.js";
import { exec } from "node:child_process";

async function main() {
	const args = mri(process.argv.slice(2));
	const command = args._[0];
	const rootDir = resolve(args._[1] || ".");

	const configFile = args.config;
	globalThis.MANIFEST = {};
	const app = await loadApp(configFile);

	if (command === "dev") {
		const { createDevServer } = await import("../lib/dev-server.js");
		await createDevServer(app, {
			dev: true,
			port: Number(process.env.PORT ?? 3000),
		});
	} else if (command === "build") {
		process.env.NODE_ENV = "production";
		const { createBuild } = await import("../lib/build.js");
		await createBuild(app, {});
	} else if (command === "start") {
		exec(`node .output/dist/server.js`)
	} else {
		throw new Error(`Unknown command ${command}`);
	}
}
main().catch((err) => {
	console.error(err);
	process.exit(1);
});
