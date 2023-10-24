import { fileURLToPath } from "node:url";

export { default as inspect } from "vite-plugin-inspect";

/** @returns {import('vinxi').RouterSchemaInput} */
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

/** @returns {import('vinxi').RouterSchemaInput} */
export const devtoolsClient = () => {
	return {
		name: "devtools-client",
		mode: "static",
		dir: fileURLToPath(new URL("./dist/client", import.meta.url)),
		base: "/__devtools/client",
	};
};
