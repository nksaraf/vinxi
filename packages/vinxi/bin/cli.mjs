#!/usr/bin/env node
import mri from "mri";
import { join, resolve } from "pathe";
import { pathToFileURL } from "url";

async function main() {
	const args = mri(process.argv.slice(2));
	const command = args._[0];
	const rootDir = resolve(args._[1] || ".");
	globalThis.MANIFEST = {};

	const { default: config } = await import(
		pathToFileURL(resolve("./app.js")).href
	);

	if (command === "dev") {
		const { createDevServer } = await import("../lib/dev-server.js");
		await createDevServer(config, {
			dev: true,
			port: 3000,
		});
	} else if (command === "build") {
		const { createBuild } = await import("../lib/build.js");
		await createBuild(config, {});
	}
}
main().catch((err) => {
	console.error(err);
	process.exit(1);
});
