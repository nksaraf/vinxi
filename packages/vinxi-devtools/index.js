import { fileURLToPath } from "node:url";

export { default as inspect } from "vite-plugin-inspect";

/** @returns {import('vinxi').ServiceSchemaInput} */
export const devtoolsRpc = () => {
	return {
		name: "devtools-rpc",
		type: "http",
		handler: fileURLToPath(new URL("./devtools-rpc.js", import.meta.url)),
		target: "server",
		build: false,
		base: "/__devtools/rpc",
	};
};

/** @returns {import('vinxi').ServiceSchemaInput} */
export const devtoolsClient = () => {
	return {
		name: "devtools-client",
		type: "static",
		dir: fileURLToPath(new URL("./out/client", import.meta.url)),
		base: "/__devtools/client",
	};
};
