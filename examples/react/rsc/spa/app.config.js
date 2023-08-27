import { references } from "@vinxi/plugin-references";
import reactRefresh from "@vitejs/plugin-react";
import { createApp } from "vinxi";

export default createApp({
	server: {
		plugins: [references.serverPlugin],
		virtual: {
			[references.serverPlugin]: references.serverPluginModule({
				routers: ["server", "rsc"],
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
			name: "rsc",
			worker: true,
			mode: "handler",
			base: "/_rsc",
			handler: "./app/react-server.tsx",
			build: {
				target: "node",
				plugins: () => [references.serverComponents(), reactRefresh()],
			},
		},
		{
			name: "client",
			mode: "spa",
			handler: "./index.html",
			build: {
				target: "browser",
				plugins: () => [
					references.clientRouterPlugin({
						runtime: "@vinxi/react-server-dom/runtime",
					}),
					reactRefresh(),
					references.clientComponents(),
				],
			},
			base: "/",
		},
		{
			name: "server",
			worker: true,
			mode: "handler",
			base: "/_server",
			handler: "./app/server-action.tsx",
			build: {
				target: "node",
				plugins: () => [
					references.serverRouterPlugin({
						resolve: {
							conditions: ["react-server"],
						},
					}),
				],
			},
		},
	],
});
