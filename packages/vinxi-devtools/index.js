import react from "@vitejs/plugin-react";
import { presetIcons, presetUno } from "unocss";
import unocss from "unocss/vite";
import { createRPCServer } from "vite-dev-rpc";

import { fileURLToPath } from "node:url";

import unocssConfig from "./uno.config.js";

/** @return {import('vinxi').Plugin} */
function DemoPlugin() {
	let app;
	let router;
	return {
		name: "demo",
		configResolved(config) {
			app = config.app;
			router = config.router;
		},
		configureServer(server) {
			const rpc = createRPCServer(
				"demo",
				server.ws,
				new Proxy(
					{},
					{
						get(target, prop) {
							return async (...args) => {
								const { functions } = await server.ssrLoadModule(
									fileURLToPath(new URL("./rpc.js", import.meta.url)),
								);
								return functions[prop](...args);
							};
						},
					},
				),
			);
		},
	};
}

export const devtoolsRpc = () => {
	return {
		name: "devtools-rpc",
		mode: "handler",
		handler: fileURLToPath(new URL("./devtools-rpc.js", import.meta.url)),
		target: "server",
		base: "/__devtools/rpc",
	};
};

export const devtoolsClientDev = () => {
	return {
		name: "devtools-client",
		mode: "spa",
		handler: fileURLToPath(new URL("./index.html.js", import.meta.url)),
		target: "browser",
		base: "/__devtools/client",
		plugins: () => [DemoPlugin(), unocss(unocssConfig), react()],
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
