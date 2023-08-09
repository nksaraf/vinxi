import reactRefresh from "@vitejs/plugin-react";
import { createApp } from "vinxi";

import { TanstackFileRouter } from "./lib/file-router.js";
import { references } from "./lib/references-plugin.js";

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
			dir: "./app/pages",
			style: TanstackFileRouter,
			build: {
				target: "browser",
				plugins: () => [references.clientRouter(), reactRefresh()],
			},
			base: "/",
		},
		{
			name: "server",
			mode: "handler",
			base: "/_server",
			handler: "./app/entry-server.tsx",
			build: {
				target: "node",
				plugins: () => [references.serverRouter()],
			},
		},
	],
});
