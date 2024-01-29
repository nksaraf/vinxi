import { serverFunctions } from "@vinxi/server-functions/plugin";
import { createApp } from "vinxi";
import solid from "vite-plugin-solid";

export default createApp({
	server: {
		experimental: {
			asyncContext: true,
		},
	},
	routers: [
		{
			name: "public",
			type: "static",
			dir: "./public",
			base: "/",
		},
		{
			name: "ssr",
			type: "handler",
			base: "/",
			handler: "./app/server.tsx",
			target: "server",
			plugins: () => [solid({ ssr: true })],
			link: {
				client: "client",
			},
		},
		{
			name: "client",
			type: "build",
			handler: "./app/client.tsx",
			target: "browser",
			plugins: () => [serverFunctions.client(), solid({ ssr: true })],
			base: "/_build",
		},
		serverFunctions.router(),
	],
});
