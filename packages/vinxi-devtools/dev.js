import { createApp } from "vinxi";
import { config } from "vinxi/plugins/config";

import { devtoolsClientDev, devtoolsServer } from "./index.js";

export default createApp({
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
		devtoolsServer(),
	],
});
