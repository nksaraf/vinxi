import { serverComponents } from "@vinxi/server-components/plugin";
import { serverFunctions } from "@vinxi/server-functions/plugin";
import reactRefresh from "@vitejs/plugin-react";
import { createApp } from "vinxi";

const app = createApp({
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
			target: "server",
			plugins: () => [serverComponents.server(), reactRefresh()],
		},
		{
			name: "client",
			mode: "spa",
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
			mode: "handler",
			base: "/_server",
			handler: "./app/server-action.tsx",
			target: "server",
			plugins: () => [
				serverFunctions.server({
					resolve: {
						conditions: ["react-server"],
					},
				}),
				serverComponents.serverActions(),
			],
		},
	],
});

app.hooks.hook("app:build:router:vite:config:resolved", ({ vite }) => {
	console.log(vite.build.rollupOptions.input);
});

export default app;
