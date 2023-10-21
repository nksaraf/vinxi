import { createApp } from "vinxi";
import { config } from "vinxi/plugins/config";

import { devtoolsClientDev, devtoolsRpc } from "./index.js";

export default createApp({
	devtools: false,
	routers: [
		{
			name: "test",
			mode: "spa",
			handler: "./test.html",
			plugins: () => [
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
