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
			mode: "static",
			dir: "./public",
		},
		{
			name: "client",
			mode: "spa",
			handler: "./index.html",
			routes: tanstackFileRoutes({
				dir: "./app/pages",
			}),
			target: "browser",
			plugins: () => [references.clientRouterPlugin(), reactRefresh()],
		},
		{
			name: "server",
			mode: "handler",
			base: "/_server",
			handler: "./app/entry-server.tsx",
			target: "server",
			plugins: () => [references.serverRouterPlugin()],
		},
	],
});
