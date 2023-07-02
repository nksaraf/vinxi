import { createApp } from "vinxi";
import solid from "vite-plugin-solid";

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
			dir: "./app/pages",
			style: "nextjs",
			build: {
				target: "browser",
				outDir: "./.build/api",
				plugins: () => [solid({ ssr: true })],
			},
			base: "/_build",
		},
		{
			name: "ssr",
			mode: "handler",
			handler: "./app/server.tsx",
			dir: "./app/pages",
			style: "nextjs",
			build: {
				target: "node",
				outDir: "./.build/api",
				plugins: () => [solid({ ssr: true })],
			},
		},
	],
});
