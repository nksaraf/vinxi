import { $ } from "execa";
import { createApp } from "vinxi";

import { devtoolsClientDev } from "./devtools-dev.js";

const app = createApp({
	routers: [devtoolsClientDev()],
});

app.hooks.hook("app:build:end", async () => {
	const { default: fs } = await import("fs/promises");
	await fs.rm;
	await fs.cp(".nitro/build/devtools-client/__devtools/client", "dist/client", {
		recursive: true,
	});
	await fs.cp("style.css", "dist/style.css", {
		recursive: true,
	});

	console.log((await $`npm run build:mount`).stdout);
});

export default app;
