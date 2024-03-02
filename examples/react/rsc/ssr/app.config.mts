import { serverComponents } from "@vinxi/server-components/plugin";
import { se, serverFunctions } from "@vinxi/server-functions/plugin";
import reactRefresh from "@vitejs/plugin-react";
import { createApp } from "vinxi";

const app = createApp({
	routers: [
		{
			name: "public",
			type: "static",
			dir: "./public",
		},
		{
			name: "rsc",
			worker: true,
			type: "http",
			base: "/_rsc",
			handler: "./app/react-server.tsx",
			target: "server",
			plugins: () => [serverComponents.server(), reactRefresh()],
		},
		{
			name: "ssr",
			type: "http",
			handler: "./app/server.tsx",
			target: "server",
			plugins: () => [],
			base: "/",
		},
		{
			name: "client",
			type: "client",
			handler: "./app/client.tsx",
			target: "browser",
			plugins: () => [
				serverFunctions.client({
					runtime: "@vinxi/react-server-dom/runtime",
				}),
				reactRefresh(),
				serverComponents.client(),
			],
			base: "/_build",
		},
		{
			name: "server",
			worker: true,
			type: "http",
			base: "/_server",
			handler: "./app/server-action.tsx",
			target: "server",
			plugins: () => [
				serverFunctions.server({
					resolve: {
						conditions: ["react-server"],
					},
					runtime: `@vinxi/react-server-dom/runtime`,
				}),
				serverComponents.serverActions(),
			],
		},
	],
});

export default app;
