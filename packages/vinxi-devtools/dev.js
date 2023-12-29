import { createApp } from "vinxi";
import { config } from "vinxi/plugins/config";
import inspect from "vite-plugin-inspect";
import solid from "vite-plugin-solid";

import { devtoolsClientDev } from "./devtools-dev.js";
import { devtoolsRpc } from "./index.js";

export default createApp({
	devtools: false,
	routers: [
		{
			name: "test",
			mode: "spa",
			handler: "./test.html",
			target: "browser",
			plugins: () => [
				inspect(),
				solid(),
				config("test-spa", {
					build: {
						rollupOptions: {
							input: "./test.html",
						},
					},
				}),
			],
		},
		devtoolsClientDev(),
		devtoolsRpc(),
	],
});
