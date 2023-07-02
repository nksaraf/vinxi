import reactRefresh from "@vitejs/plugin-react";
import { createApp } from "vinxi";

export default createApp({
	routers: [
		{
			name: "public",
			mode: "static",
			build: {
				outDir: "./.build/client",
			},
			dir: "./public",
			base: "/",
		},
		{
			name: "client",
			mode: "build",
			handler: "./app/client.tsx",
			build: {
				target: "browser",
				outDir: "./.build/api",
				plugins: () => [reactRefresh()],
			},
			base: "/_build",
		},
		{
			name: "ssr",
			mode: "handler",
			handler: "./app/server.tsx",
			build: {
				target: "node",
				outDir: "./.build/api",
			},
		},
	],
});
