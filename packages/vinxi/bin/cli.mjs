#!/usr/bin/env node
import { runMain } from "citty";
import { Vinxi } from "../lib/vinxi.js";
const vinxi = new Vinxi();

async function printVersions() {
	const { log, c } = await import("../lib/logger.js");

	let vite = await import("vite/package.json", { with: { type: "json" } });
	log(c.dim(c.yellow(`vite v${vite.default.version}`)));

	let nitro = await import("nitropack/package.json", {
		with: { type: "json" },
	});
	log(c.dim(c.yellow(`nitro v${nitro.default.version}`)));

	let h3 = await import("h3/package.json", { with: { type: "json" } });
	log(c.dim(c.yellow(`h3 v${h3.default.version}`)));
}

const command = vinxi.createCommand({
	printVersions,
});

runMain(command);
