import reactRefresh from "@vitejs/plugin-react";
import { createApp } from "vinxi";

export default createApp({
	server: {
		experimental: {
			websocket: true,
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
			name: "client",
			type: "client",
			handler: "./app/client.tsx",
			target: "browser",
			plugins: () => [reactRefresh()],
			base: "/_build",
		},
		{
			name: "websocket",
			type: "http",
			handler: "./app/ws.ts",
			target: "server",
			base: "/_ws",
			plugins: () => [reactRefresh()],
		},
		{
			name: "ssr",
			type: "http",
			middleware: "./app/middleware.tsx",
			handler: "./app/server.tsx",
			target: "server",
			plugins: () => [reactRefresh()],
		},
	],
});
