import { $ } from "execa";
import { createApp } from "vinxi";

import { devtoolsClientDev } from "./devtools-dev.js";

const app = createApp({
	routers: [devtoolsClientDev()],
});

function flatten(items) {
	const flat = [];

	items.forEach((item) => {
		if (Array.isArray(item)) {
			flat.push(...flatten(item));
		} else {
			flat.push(item);
		}
	});

	return flat;
}

app.hooks.hook("app:build:router:vite:config", async ({ vite }) => {
	console.log(vite);

	vite.plugins = flatten(vite.plugins).filter(
		(plugin) => plugin?.name !== "vinxi:inject-client",
	);
	console.log(vite);
});

app.hooks.hook("app:build:end", async () => {
	const { default: fs } = await import("fs/promises");
	try {
		await fs.open("dist");
		await fs.rmdir("dist", { recursive: true });
		await fs.mkdir("dist");
	} catch (e) {
		await fs.mkdir("dist");
	}
	await $`cp -r .vinxi/build/devtools-client/__devtools/client dist/client`;
	await $`cp style.css dist/style.css`;
	console.log((await $`npm run build:mount`).stdout);
});

export default app;
