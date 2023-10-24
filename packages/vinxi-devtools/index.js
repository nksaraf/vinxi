import { fileURLToPath } from "node:url";

export { default as inspect } from "vite-plugin-inspect";

export const devtoolsRpc = () => {
	return {
		name: "devtools-rpc",
		mode: "handler",
		handler: fileURLToPath(new URL("./devtools-rpc.js", import.meta.url)),
		target: "server",
		build: false,
		base: "/__devtools/rpc",
	};
};

export const devtoolsClient = () => {
	return {
		name: "devtools-client",
		mode: "static",
		dir: fileURLToPath(
			new URL(
				"./.nitro/build/devtools-client/__devtools/client",
				import.meta.url,
			),
		),
		base: "/__devtools/client",
	};
};
