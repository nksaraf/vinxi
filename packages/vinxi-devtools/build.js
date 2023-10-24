import { createApp } from "vinxi";
import {$} from 'execa';


import { devtoolsClientDev } from "./devtools-dev.js";

const app = createApp({
	routers: [devtoolsClientDev()],
});

app.hooks.hook("app:build:end", async () => {
	const { default: fs } = await import("fs/promises");
	console.log('writing');
	await fs.rm
	await fs.cp(".nitro/build/devtools-client/__devtools/client", "dist/client", {
		recursive: true,
	});
	await fs.cp("style.css", "dist/style.css", {
		recursive: true,
	});


	await $`esbuild --bundle --jsx=transform --jsx-factory=h --format=esm --jsx-fragment=Fragment --target=es2020 --external:./style.css?raw --outdir=./dist mount.jsx`
	console.log('writing');

});

export default app;
