import { references } from "@vinxi/plugin-references";
import reactRefresh from "@vitejs/plugin-react";
import { createApp } from "vinxi";

import { tanstackFileRoutes } from "./lib/file-router.js";

export default createApp({
	server: {
		plugins: [references.serverPlugin],
		virtual: {
			[references.serverPlugin]: references.serverPluginModule({
				routers: ["server"],
			}),
		},
	},
	routers: [
		{
			name: "public",
			type: "static",
			dir: "./public",
		},
		{
			name: "client",
			type: "spa",
			handler: "./index.html",
			routes: tanstackFileRoutes({
				dir: "./app/pages",
			}),
			target: "browser",
			plugins: () => [references.clientRouterPlugin(), reactRefresh()],
		},
		{
			name: "server",
			type: "handler",
			base: "/_server",
			handler: "./app/entry-server.tsx",
			target: "server",
			plugins: () => [references.serverRouterPlugin()],
		},
	],
});
