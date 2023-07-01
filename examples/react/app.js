import reactRefresh from "@vitejs/plugin-react";
import { createApp } from "vinxi";

export default createApp({
	bundlers: [
		{
			name: "static-server",
			outDir: "./.build/client",
		},
		{
			name: "node-api",
			target: "node",
			outDir: "./.build/api",
		},
		{
			name: "client",
			target: "browser",
			outDir: "./.build/api",
			plugins: () => [reactRefresh()],
		},
	],
	routers: [
		{
			mode: "static",
			name: "static",
			build: "static-server",
			dir: "./public",
			prefix: "/",
		},
		{
			mode: "build",
			name: "client",
			handler: "./app/client.tsx",
			build: "client",
			prefix: "/_build",
		},
		{
			mode: "node-handler",
			handler: "./app/server.tsx",
			name: "api",
			build: "node-api",
		},
	],
});
