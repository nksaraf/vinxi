#!/usr/bin/env node
import { loadConfig } from "c12";
import mri from "mri";
import { join, resolve } from "pathe";
import { pathToFileURL } from "url";

async function main() {
	const args = mri(process.argv.slice(2));
	const command = args._[0];
	const rootDir = resolve(args._[1] || ".");

	const configFile = args.config;
	globalThis.MANIFEST = {};

	/** @type {{ config: import("../lib/app.js").App }}*/
	const { config: app } = await loadConfig(
		configFile
			? {
					configFile,
			  }
			: {
					name: "app",
			  },
	);

	if (!app.config) {
		throw new Error("No config found");
	}

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
	}
}
main().catch((err) => {
	console.error(err);
	process.exit(1);
});
