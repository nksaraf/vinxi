import { references } from "@vinxi/plugin-references";
import { createApp } from "vinxi";

export default createApp({
	server: {
		plugins: [references.serverPlugin],
		virtual: {
			[references.serverPlugin]: references.serverPluginModule(),
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
			target: "browser",
			plugins: () => [references.clientRouterPlugin()],
		},
		{
			name: "ws",
			base: "/party",
			mode: "handler",
			handler: "./app/websocket.ts",
			target: "server",
		},
		references.serverRouter({
			middleware: "./app/middleware.tsx",
		}),
	],
});
