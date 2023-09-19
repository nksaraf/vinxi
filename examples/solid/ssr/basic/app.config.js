import { references } from "@vinxi/plugin-references";
import { createApp } from "vinxi";
import solid from "vite-plugin-solid";

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
			base: "/",
		},
		{
			name: "client",
			mode: "build",
			handler: "./app/client.tsx",
			compile: {
				target: "browser",
				plugins: () => [references.clientRouterPlugin(), solid({ ssr: true })],
			},
			base: "/_build",
		},
		{
			name: "ssr",
			mode: "handler",
			handler: "./app/server.tsx",
			compile: {
				target: "server",
				plugins: () => [solid({ ssr: true })],
			},
		},
		references.serverRouter(),
	],
});
