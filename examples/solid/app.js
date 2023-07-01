import { createApp } from "vinxi";
import solid from "vite-plugin-solid";

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
			plugins: () => [solid({ ssr: true })],
		},
		{
			name: "client",
			target: "browser",
			outDir: "./.build/api",
			plugins: () => [solid({ ssr: true })],
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
