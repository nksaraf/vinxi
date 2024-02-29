import { serverComponents } from "@vinxi/server-components/plugin";
import { serverFunctions } from "@vinxi/server-functions/plugin";
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
			name: "client",
			type: "spa",
			handler: "./index.ts",
			target: "browser",
			plugins: () => [
				serverFunctions.client({
					runtime: "@vinxi/react-server-dom/runtime",
				}),
				reactRefresh(),
				serverComponents.client(),
			],
			base: "/",
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
