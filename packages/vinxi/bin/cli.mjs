#!/usr/bin/env node
import { runMain } from "citty";
import fs from "fs";
import { fileURLToPath } from "url";

import { createCommand } from "../lib/command.js";

const packageJson = JSON.parse(
	fs.readFileSync(
		fileURLToPath(new URL("../package.json", import.meta.url)),
		"utf-8",
	),
);

const command = createCommand({
	meta: {
		name: "vinxi",
		version: packageJson.version,
		description: "Vinxi: The JavaScript/TypeScript Server SDK",
	}
})

runMain(command);
