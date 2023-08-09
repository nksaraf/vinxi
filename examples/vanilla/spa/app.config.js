import { references } from "@vinxi/plugin-references";
import reactRefresh from "@vitejs/plugin-react";
import { createApp } from "vinxi";

export default createApp({
	server: {
		plugins: [references.serverPlugin],
		virtual: {
			[references.serverPlugin]: references.serverPluginModule,
		},
	},
	routers: [
		{
			name: "public",
			mode: "static",
			dir: "./public",
		},
		{
			name: "client",
			mode: "spa",
			handler: "./index.html",
			build: {
				target: "browser",
				plugins: () => [references.clientRouterPlugin(), reactRefresh()],
			},
		},
		references.serverRouter(),
	],
});
